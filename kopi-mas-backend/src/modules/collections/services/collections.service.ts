import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LoanCollection, CollectionStatus } from '../entities/collection.entity';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';
import { CollectionResponseDto } from '../dto/collection.dto';

export interface CollectionStats {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  totalAmount: number;
  collectedAmount: number;
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(LoanCollection)
    private collectionRepository: Repository<LoanCollection>,
    private auditLogsService: AuditLogsService,
  ) {}

  private mapToResponseDto(col: LoanCollection): CollectionResponseDto {
    return {
      id: col.collection_id,
      member: col.member ? {
        id: col.member.member_id,
        name: col.member.name,
        nik: col.member.nik,
        phone: col.member.phone,
      } : null,
      application: col.application ? {
        id: col.application.application_id,
        loanAmount: Number(col.application.loanAmount),
        loanTenureMonths: col.application.loanTenureMonths,
      } : null,
      installmentNumber: col.installmentNumber,
      dueDate: col.dueDate,
      dueAmount: Number(col.dueAmount),
      paidAmount: Number(col.paidAmount),
      paidDate: col.paidDate,
      collectionStatus: col.collectionStatus,
      collectedByOfficerId: col.collectedByOfficerId,
      notes: col.notes,
      createdAt: col.createdAt,
    };
  }

  async findAll(filters?: { 
    status?: string[]; 
    page?: number; 
    limit?: number;
    memberId?: string;
  }): Promise<{ data: LoanCollection[]; total: number }> {
    const where: FindOptionsWhere<LoanCollection> = {};
    
    if (filters?.status && filters.status.length > 0) {
      where.collectionStatus = In(filters.status as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }

    const [data, total] = await this.collectionRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { dueDate: 'ASC' },
    });

    return { data, total };
  }

  async findAllWithRelations(filters?: { 
    status?: string[]; 
    page?: number; 
    limit?: number;
    memberId?: string;
  }): Promise<{ data: CollectionResponseDto[]; total: number }> {
    const where: FindOptionsWhere<LoanCollection> = {};
    
    if (filters?.status && filters.status.length > 0) {
      where.collectionStatus = In(filters.status as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }

    const [data, total] = await this.collectionRepository.findAndCount({
      where,
      relations: ['member', 'application'],
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { dueDate: 'ASC' },
    });

    return { data: data.map(col => this.mapToResponseDto(col)), total };
  }

  async findOneWithRelations(collectionId: string): Promise<CollectionResponseDto | null> {
    const col = await this.collectionRepository.findOne({
      where: { collection_id: collectionId },
      relations: ['member', 'application'],
    });
    return col ? this.mapToResponseDto(col) : null;
  }

  async getStats(): Promise<CollectionStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, paid, overdue] = await Promise.all([
      this.collectionRepository.count({
        where: { collectionStatus: CollectionStatus.PENDING },
      }),
      this.collectionRepository.count({
        where: { collectionStatus: CollectionStatus.PAID },
      }),
      this.collectionRepository.count({
        where: { collectionStatus: CollectionStatus.OVERDUE },
      }),
    ]);

    const amountStats = await this.collectionRepository
      .createQueryBuilder('collection')
      .select('SUM(collection.due_amount)', 'total')
      .addSelect('SUM(collection.paid_amount)', 'collected')
      .getRawOne();

    return {
      totalPending: pending,
      totalPaid: paid,
      totalOverdue: overdue,
      totalAmount: parseFloat(amountStats?.total || '0'),
      collectedAmount: parseFloat(amountStats?.collected || '0'),
    };
  }

  async recordPayment(
    collectionId: string, 
    paidAmount: number, 
    officerId?: string,
    userId?: string,
    userEmail?: string,
  ): Promise<LoanCollection> {
    const collection = await this.collectionRepository.findOne({
      where: { collection_id: collectionId },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const oldPaidAmount = collection.paidAmount;
    const isFullyPaid = paidAmount >= collection.dueAmount;
    
    await this.collectionRepository.update(collectionId, {
      paidAmount: collection.paidAmount + paidAmount,
      paidDate: new Date(),
      collectionStatus: isFullyPaid ? CollectionStatus.PAID : CollectionStatus.PARTIAL,
      collectedByOfficerId: officerId,
    });

    const updated = await this.collectionRepository.findOne({ where: { collection_id: collectionId } });
    
    await this.auditLogsService.create({
      action: AuditAction.PAY,
      userId,
      userEmail,
      entityType: 'Collection',
      entityId: collectionId,
      oldValues: { paidAmount: oldPaidAmount },
      newValues: { paidAmount: updated.paidAmount, status: updated.collectionStatus },
      description: `Payment recorded for collection ${collectionId}: ${paidAmount}`,
    });
    
    return updated;
  }

  async findOverdue(): Promise<LoanCollection[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.collectionRepository
      .createQueryBuilder('collection')
      .where('collection.due_date < :today', { today })
      .andWhere('collection.collection_status IN (:...statuses)', {
        statuses: [CollectionStatus.PENDING, CollectionStatus.OVERDUE],
      })
      .orderBy('collection.due_date', 'ASC')
      .limit(50)
      .getMany();
  }

  async findPaymentHistory(filters?: {
    page?: number;
    limit?: number;
    memberId?: string;
  }): Promise<{ data: LoanCollection[]; total: number }> {
    const where: FindOptionsWhere<LoanCollection> = {
      collectionStatus: In([CollectionStatus.PAID, CollectionStatus.PARTIAL]),
    };

    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }

    const [data, total] = await this.collectionRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { paidDate: 'DESC' },
    });

    return { data, total };
  }

  async getPaymentStats(): Promise<{
    totalCollected: number;
    todayCollected: number;
    monthCollected: number;
    totalTransactions: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalResult, todayResult, monthResult, countResult] = await Promise.all([
      this.collectionRepository
        .createQueryBuilder('collection')
        .select('SUM(collection.paid_amount)', 'total')
        .where('collection.collection_status IN (:...statuses)', {
          statuses: [CollectionStatus.PAID, CollectionStatus.PARTIAL],
        })
        .getRawOne(),
      this.collectionRepository
        .createQueryBuilder('collection')
        .select('SUM(collection.paid_amount)', 'total')
        .where('collection.paid_date >= :today', { today })
        .andWhere('collection.collection_status IN (:...statuses)', {
          statuses: [CollectionStatus.PAID, CollectionStatus.PARTIAL],
        })
        .getRawOne(),
      this.collectionRepository
        .createQueryBuilder('collection')
        .select('SUM(collection.paid_amount)', 'total')
        .where('collection.paid_date >= :startOfMonth', { startOfMonth })
        .andWhere('collection.collection_status IN (:...statuses)', {
          statuses: [CollectionStatus.PAID, CollectionStatus.PARTIAL],
        })
        .getRawOne(),
      this.collectionRepository.count({
        where: {
          collectionStatus: In([CollectionStatus.PAID, CollectionStatus.PARTIAL]),
        },
      }),
    ]);

    return {
      totalCollected: parseFloat(totalResult?.total || '0'),
      todayCollected: parseFloat(todayResult?.total || '0'),
      monthCollected: parseFloat(monthResult?.total || '0'),
      totalTransactions: countResult,
    };
  }

  async findInstallments(filters?: {
    page?: number;
    limit?: number;
    memberId?: string;
    applicationId?: string;
    status?: string;
  }): Promise<{ data: LoanCollection[]; total: number }> {
    const where: FindOptionsWhere<LoanCollection> = {};

    if (filters?.status && filters.status !== 'all') {
      where.collectionStatus = In(filters.status.split(',') as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.collectionRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 20),
      take: filters?.limit || 20,
      order: { dueDate: 'ASC' },
    });

    return { data, total };
  }

  async getInstallmentStats(): Promise<{
    totalInstallments: number;
    upcomingDue: number;
    overdueCount: number;
    totalDueAmount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, upcoming, overdue] = await Promise.all([
      this.collectionRepository.count(),
      this.collectionRepository.count({
        where: { collectionStatus: CollectionStatus.PENDING },
      }),
      this.collectionRepository.count({
        where: { collectionStatus: CollectionStatus.OVERDUE },
      }),
    ]);

    const amountResult = await this.collectionRepository
      .createQueryBuilder('collection')
      .select('SUM(collection.due_amount)', 'total')
      .where('collection.collection_status IN (:...statuses)', {
        statuses: [CollectionStatus.PENDING, CollectionStatus.OVERDUE],
      })
      .getRawOne();

    return {
      totalInstallments: total,
      upcomingDue: upcoming,
      overdueCount: overdue,
      totalDueAmount: parseFloat(amountResult?.total || '0'),
    };
  }
}
