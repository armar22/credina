import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PaymentResponseDto } from '../dto/payment.dto';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';

export interface PaymentStats {
  totalPayments: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  totalAmount: number;
  collectedAmount: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private auditLogsService: AuditLogsService,
  ) {}

  private mapToResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.payment_id,
      member: payment.member ? {
        id: payment.member.member_id,
        name: payment.member.name,
        nik: payment.member.nik,
        phone: payment.member.phone,
      } : null,
      application: payment.application ? {
        id: payment.application.application_id,
        loanAmount: Number(payment.application.loanAmount),
      } : null,
      collectionId: payment.collectionId,
      installmentId: payment.installmentId,
      paymentAmount: Number(payment.paymentAmount),
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionReference: payment.transactionReference,
      externalReference: payment.externalReference,
      paidAt: payment.paidAt,
      processedByOfficerId: payment.processedByOfficerId,
      senderAccountNumber: payment.senderAccountNumber,
      senderBankName: payment.senderBankName,
      senderName: payment.senderName,
      notes: payment.notes,
      proofUrl: payment.proofUrl,
      createdAt: payment.createdAt,
    };
  }

  async findAll(filters?: {
    status?: string;
    method?: string;
    page?: number;
    limit?: number;
    memberId?: string;
    applicationId?: string;
  }): Promise<{ data: Payment[]; total: number }> {
    const where: FindOptionsWhere<Payment> = {};

    if (filters?.status && filters.status !== 'all') {
      where.paymentStatus = In(filters.status.split(',') as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findAllWithRelations(filters?: {
    status?: string;
    method?: string;
    page?: number;
    limit?: number;
    memberId?: string;
    applicationId?: string;
  }): Promise<{ data: PaymentResponseDto[]; total: number }> {
    const where: FindOptionsWhere<Payment> = {};

    if (filters?.status && filters.status !== 'all') {
      where.paymentStatus = In(filters.status.split(',') as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['member', 'application'],
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data: data.map(p => this.mapToResponseDto(p)), total };
  }

  async findOne(paymentId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { payment_id: paymentId },
    });
  }

  async findOneWithRelations(paymentId: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
      relations: ['member', 'application'],
    });
    return payment ? this.mapToResponseDto(payment) : null;
  }

  async create(createDto: Partial<Payment>, userId?: string, userEmail?: string): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createDto,
    });
    const saved = await this.paymentRepository.save(payment);

    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      userId,
      userEmail,
      entityType: 'Payment',
      entityId: saved.payment_id,
      newValues: { amount: saved.paymentAmount, method: saved.paymentMethod },
      description: `Created payment: ${saved.paymentAmount}`,
    });

    return saved;
  }

  async update(paymentId: string, updateDto: Partial<Payment>): Promise<Payment> {
    await this.paymentRepository.update(paymentId, updateDto);
    return this.findOne(paymentId);
  }

  async updateStatus(
    paymentId: string,
    status: PaymentStatus,
    userId?: string,
    userEmail?: string,
  ): Promise<Payment> {
    const oldPayment = await this.findOne(paymentId);
    const updateData: Partial<Payment> = {
      paymentStatus: status,
    };

    if (status === PaymentStatus.COMPLETED) {
      updateData.paidAt = new Date();
    }

    await this.paymentRepository.update(paymentId, updateData);
    const updated = await this.findOne(paymentId);

    await this.auditLogsService.create({
      action: status === PaymentStatus.COMPLETED ? AuditAction.PAY : AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'Payment',
      entityId: paymentId,
      oldValues: { status: oldPayment?.paymentStatus },
      newValues: { status },
      description: `Payment ${paymentId} status changed to ${status}`,
    });

    return updated;
  }

  async findByMember(memberId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { memberId: memberId as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findByApplication(applicationId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { applicationId: applicationId as any },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<PaymentStats> {
    const [pending, completed, failed, amountStats] = await Promise.all([
      this.paymentRepository.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      this.paymentRepository.count({
        where: { paymentStatus: PaymentStatus.COMPLETED },
      }),
      this.paymentRepository.count({
        where: { paymentStatus: PaymentStatus.FAILED },
      }),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.payment_amount)', 'total')
        .getRawOne(),
    ]);

    return {
      totalPayments: pending + completed + failed,
      pendingCount: pending,
      completedCount: completed,
      failedCount: failed,
      totalAmount: parseFloat(amountStats?.total || '0'),
      collectedAmount: parseFloat(amountStats?.total || '0'),
    };
  }
}
