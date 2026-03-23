import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LoanInstallment, InstallmentStatus } from '../entities/installment.entity';
import { InstallmentResponseDto } from '../dto/installment.dto';

export interface InstallmentStats {
  totalInstallments: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  totalDueAmount: number;
  totalPaidAmount: number;
}

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(LoanInstallment)
    private installmentRepository: Repository<LoanInstallment>,
  ) {}

  private mapToResponseDto(inst: LoanInstallment): InstallmentResponseDto {
    return {
      id: inst.installment_id,
      member: inst.member ? {
        id: inst.member.member_id,
        name: inst.member.name,
        nik: inst.member.nik,
        phone: inst.member.phone,
      } : null,
      application: inst.application ? {
        id: inst.application.application_id,
        loanAmount: Number(inst.application.loanAmount),
        loanTenureMonths: inst.application.loanTenureMonths,
      } : null,
      installmentNumber: inst.installmentNumber,
      dueDate: inst.dueDate,
      principalAmount: Number(inst.principalAmount),
      interestAmount: Number(inst.interestAmount),
      totalAmount: Number(inst.totalAmount),
      paidAmount: Number(inst.paidAmount),
      paidDate: inst.paidDate,
      installmentStatus: inst.installmentStatus,
      penaltyAmount: Number(inst.penaltyAmount),
      paymentMethod: inst.paymentMethod,
      transactionReference: inst.transactionReference,
      notes: inst.notes,
      createdAt: inst.createdAt,
    };
  }

  async findAll(filters?: {
    status?: string;
    page?: number;
    limit?: number;
    memberId?: string;
    applicationId?: string;
  }): Promise<{ data: LoanInstallment[]; total: number }> {
    const where: FindOptionsWhere<LoanInstallment> = {};

    if (filters?.status && filters.status !== 'all') {
      where.installmentStatus = In(filters.status.split(',') as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.installmentRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 20),
      take: filters?.limit || 20,
      order: { dueDate: 'ASC' },
    });

    return { data, total };
  }

  async findAllWithRelations(filters?: {
    status?: string;
    page?: number;
    limit?: number;
    memberId?: string;
    applicationId?: string;
  }): Promise<{ data: InstallmentResponseDto[]; total: number }> {
    const where: FindOptionsWhere<LoanInstallment> = {};

    if (filters?.status && filters.status !== 'all') {
      where.installmentStatus = In(filters.status.split(',') as any);
    }
    if (filters?.memberId) {
      where.memberId = filters.memberId as any;
    }
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId as any;
    }

    const [data, total] = await this.installmentRepository.findAndCount({
      where,
      relations: ['member', 'application'],
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 20),
      take: filters?.limit || 20,
      order: { dueDate: 'ASC' },
    });

    return { data: data.map(inst => this.mapToResponseDto(inst)), total };
  }

  async findOne(installmentId: string): Promise<LoanInstallment | null> {
    return this.installmentRepository.findOne({
      where: { installment_id: installmentId },
    });
  }

  async findOneWithRelations(installmentId: string): Promise<InstallmentResponseDto | null> {
    const inst = await this.installmentRepository.findOne({
      where: { installment_id: installmentId },
      relations: ['member', 'application'],
    });
    return inst ? this.mapToResponseDto(inst) : null;
  }

  async getStats(): Promise<InstallmentStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, paid, overdue] = await Promise.all([
      this.installmentRepository.count({
        where: { installmentStatus: InstallmentStatus.PENDING },
      }),
      this.installmentRepository.count({
        where: { installmentStatus: InstallmentStatus.PAID },
      }),
      this.installmentRepository.count({
        where: { installmentStatus: InstallmentStatus.OVERDUE },
      }),
    ]);

    const amountResult = await this.installmentRepository
      .createQueryBuilder('installment')
      .select('SUM(installment.total_amount)', 'totalDue')
      .addSelect('SUM(installment.paid_amount)', 'totalPaid')
      .getRawOne();

    return {
      totalInstallments: pending + paid + overdue,
      pendingCount: pending,
      paidCount: paid,
      overdueCount: overdue,
      totalDueAmount: parseFloat(amountResult?.totalDue || '0'),
      totalPaidAmount: parseFloat(amountResult?.totalPaid || '0'),
    };
  }

  async recordPayment(
    installmentId: string,
    paidAmount: number,
    officerId?: string,
    paymentMethod?: string,
    transactionReference?: string,
  ): Promise<LoanInstallment> {
    const installment = await this.installmentRepository.findOne({
      where: { installment_id: installmentId },
    });

    if (!installment) {
      throw new Error('Installment not found');
    }

    const newPaidAmount = installment.paidAmount + paidAmount;
    const isFullyPaid = newPaidAmount >= installment.totalAmount;

    await this.installmentRepository.update(installmentId, {
      paidAmount: newPaidAmount,
      paidDate: new Date(),
      installmentStatus: isFullyPaid ? InstallmentStatus.PAID : InstallmentStatus.PARTIAL,
      paidByOfficerId: officerId,
      paymentMethod,
      transactionReference,
    });

    return this.installmentRepository.findOne({ where: { installment_id: installmentId } });
  }

  async findOverdue(): Promise<LoanInstallment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.installmentRepository
      .createQueryBuilder('installment')
      .where('installment.due_date < :today', { today })
      .andWhere('installment.installment_status IN (:...statuses)', {
        statuses: [InstallmentStatus.PENDING, InstallmentStatus.OVERDUE],
      })
      .orderBy('installment.due_date', 'ASC')
      .limit(50)
      .getMany();
  }

  async findByApplication(applicationId: string): Promise<LoanInstallment[]> {
    return this.installmentRepository.find({
      where: { applicationId: applicationId as any },
      order: { installmentNumber: 'ASC' },
    });
  }

  async findByApplicationWithRelations(applicationId: string): Promise<InstallmentResponseDto[]> {
    const installments = await this.installmentRepository.find({
      where: { applicationId: applicationId as any },
      relations: ['member', 'application'],
      order: { installmentNumber: 'ASC' },
    });
    return installments.map(inst => this.mapToResponseDto(inst));
  }

  async findByMember(memberId: string): Promise<LoanInstallment[]> {
    return this.installmentRepository.find({
      where: { memberId: memberId as any },
      order: { dueDate: 'ASC' },
    });
  }

  async findByMemberWithRelations(memberId: string): Promise<InstallmentResponseDto[]> {
    const installments = await this.installmentRepository.find({
      where: { memberId: memberId as any },
      relations: ['member', 'application'],
      order: { dueDate: 'ASC' },
    });
    return installments.map(inst => this.mapToResponseDto(inst));
  }

  async createInstallments(data: {
    applicationId: string;
    memberId: string;
    disbursementId: string;
    installments: Array<{
      installmentNumber: number;
      principalAmount: number;
      interestAmount: number;
      totalAmount: number;
      dueDate: Date;
    }>;
  }): Promise<LoanInstallment[]> {
    const installments = data.installments.map((inst) =>
      this.installmentRepository.create({
        applicationId: data.applicationId,
        memberId: data.memberId,
        disbursementId: data.disbursementId,
        installmentNumber: inst.installmentNumber,
        principalAmount: inst.principalAmount,
        interestAmount: inst.interestAmount,
        totalAmount: inst.totalAmount,
        dueDate: inst.dueDate,
        paidAmount: 0,
        installmentStatus: InstallmentStatus.PENDING,
      }),
    );

    return this.installmentRepository.save(installments);
  }

  async updateOverdueStatus(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.installmentRepository
      .createQueryBuilder()
      .update(LoanInstallment)
      .set({ installmentStatus: InstallmentStatus.OVERDUE })
      .where('due_date < :today', { today })
      .andWhere('installment_status = :status', { status: InstallmentStatus.PENDING })
      .execute();
  }
}
