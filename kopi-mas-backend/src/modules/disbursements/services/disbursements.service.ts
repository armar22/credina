import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { LoanDisbursement, TransferStatus } from '../entities/disbursement.entity';
import { DisbursementResponseDto } from '../dto/disbursement.dto';

export interface DisbursementStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
  disbursedAmount: number;
}

@Injectable()
export class DisbursementsService {
  constructor(
    @InjectRepository(LoanDisbursement)
    private disbursementRepository: Repository<LoanDisbursement>,
  ) {}

  private mapToResponseDto(disb: LoanDisbursement): DisbursementResponseDto {
    return {
      id: disb.disbursement_id,
      member: disb.member ? {
        id: disb.member.member_id,
        name: disb.member.name,
        nik: disb.member.nik,
        phone: disb.member.phone,
        bankName: disb.bankName,
        bankAccountNumber: disb.bankAccountNumber,
        bankAccountHolder: disb.bankAccountHolder,
      } : null,
      application: disb.application ? {
        id: disb.application.application_id,
        loanAmount: Number(disb.application.loanAmount),
        loanTenureMonths: disb.application.loanTenureMonths,
      } : null,
      disbursementAmount: Number(disb.disbursementAmount),
      disbursementDate: disb.disbursementDate,
      transferStatus: disb.transferStatus,
      transferReference: disb.transferReference,
      bankName: disb.bankName,
      bankAccountNumber: disb.bankAccountNumber,
      bankAccountHolder: disb.bankAccountHolder,
      receiptUrl: disb.receiptUrl,
      notificationSent: disb.notificationSent,
      processedByOfficerId: disb.processedByOfficerId,
      createdAt: disb.createdAt,
    };
  }

  async findAll(filters?: {
    status?: string[];
    memberId?: string;
    applicationId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: LoanDisbursement[]; total: number }> {
    const where: FindOptionsWhere<LoanDisbursement> = {};

    if (filters?.status && filters.status.length > 0) {
      where.transferStatus = In(filters.status as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.disbursementRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findAllWithRelations(filters?: {
    status?: string[];
    memberId?: string;
    applicationId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: DisbursementResponseDto[]; total: number }> {
    const where: FindOptionsWhere<LoanDisbursement> = {};

    if (filters?.status && filters.status.length > 0) {
      where.transferStatus = In(filters.status as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.disbursementRepository.findAndCount({
      where,
      relations: ['member', 'application'],
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data: data.map(disb => this.mapToResponseDto(disb)), total };
  }

  async findById(disbursementId: string): Promise<LoanDisbursement | null> {
    return this.disbursementRepository.findOne({
      where: { disbursement_id: disbursementId },
    });
  }

  async findByIdWithRelations(disbursementId: string): Promise<DisbursementResponseDto | null> {
    const disb = await this.disbursementRepository.findOne({
      where: { disbursement_id: disbursementId },
      relations: ['member', 'application'],
    });
    return disb ? this.mapToResponseDto(disb) : null;
  }

  async findByApplicationId(applicationId: string): Promise<LoanDisbursement | null> {
    return this.disbursementRepository.findOne({
      where: { applicationId: applicationId as any },
    });
  }

  async findByApplicationIdWithRelations(applicationId: string): Promise<DisbursementResponseDto | null> {
    const disb = await this.disbursementRepository.findOne({
      where: { applicationId: applicationId as any },
      relations: ['member', 'application'],
    });
    return disb ? this.mapToResponseDto(disb) : null;
  }

  async findByMemberId(memberId: string): Promise<LoanDisbursement[]> {
    return this.disbursementRepository.find({
      where: { memberId: memberId as any },
      order: { disbursementDate: 'DESC' },
    });
  }

  async findByMemberIdWithRelations(memberId: string): Promise<DisbursementResponseDto[]> {
    const disbursements = await this.disbursementRepository.find({
      where: { memberId: memberId as any },
      relations: ['member', 'application'],
      order: { disbursementDate: 'DESC' },
    });
    return disbursements.map(disb => this.mapToResponseDto(disb));
  }

  async create(createDto: Partial<LoanDisbursement>): Promise<LoanDisbursement> {
    const disbursement = this.disbursementRepository.create({
      ...createDto,
      disbursementDate: new Date(),
    });
    return this.disbursementRepository.save(disbursement);
  }

  async update(disbursementId: string, updateDto: Partial<LoanDisbursement>): Promise<LoanDisbursement> {
    await this.disbursementRepository.update(disbursementId, updateDto);
    return this.findById(disbursementId);
  }

  async updateStatus(
    disbursementId: string,
    status: TransferStatus,
    transferReference?: string,
  ): Promise<LoanDisbursement> {
    await this.disbursementRepository.update(disbursementId, {
      transferStatus: status,
      transferReference,
    });
    return this.findById(disbursementId);
  }

  async delete(disbursementId: string): Promise<void> {
    await this.disbursementRepository.delete(disbursementId);
  }

  async sendNotification(disbursementId: string): Promise<DisbursementResponseDto | null> {
    await this.disbursementRepository.update(disbursementId, {
      notificationSent: true,
    });
    return this.findByIdWithRelations(disbursementId);
  }

  async getStats(): Promise<DisbursementStats> {
    const [total, pending, processing, completed, failed, amountStats] = await Promise.all([
      this.disbursementRepository.count(),
      this.disbursementRepository.count({
        where: { transferStatus: TransferStatus.PENDING },
      }),
      this.disbursementRepository.count({
        where: { transferStatus: TransferStatus.PROCESSING },
      }),
      this.disbursementRepository.count({
        where: { transferStatus: TransferStatus.COMPLETED },
      }),
      this.disbursementRepository.count({
        where: { transferStatus: TransferStatus.FAILED },
      }),
      this.disbursementRepository
        .createQueryBuilder('disbursement')
        .select('SUM(disbursement.disbursement_amount)', 'total')
        .getRawOne(),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      totalAmount: parseFloat(amountStats?.total || '0'),
      disbursedAmount: parseFloat(amountStats?.total || '0'),
    };
  }

  async getReceipt(disbursementId: string): Promise<LoanDisbursement | null> {
    return this.findById(disbursementId);
  }
}
