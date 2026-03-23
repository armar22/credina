import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, Like } from 'typeorm';
import { LoanApplication } from '../entities/loan-application.entity';
import { Member, MemberStatus } from '../../members/entities/member.entity';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';
import { LoanApplicationResponseDto, MemberSummaryDto, LoanProductSummaryDto, BranchSummaryDto } from '../dto/loan-application.dto';

@Injectable()
export class LoanApplicationHelpersService {
  constructor(
    @InjectRepository(LoanApplication)
    private applicationRepository: Repository<LoanApplication>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private auditLogsService: AuditLogsService,
  ) {}

  private mapToResponseDto(app: LoanApplication): LoanApplicationResponseDto {
    return {
      id: app.application_id,
      member: app.member ? {
        id: app.member.member_id,
        name: app.member.name,
        nik: app.member.nik,
        phone: app.member.phone,
      } : null,
      agentId: app.agentId,
      agentName: null,
      loanProduct: app.loanProduct ? {
        id: app.loanProduct.product_id,
        productName: app.loanProduct.productName,
        productType: app.loanProduct.productType as any,
      } : null,
      branch: app.branch ? {
        id: app.branch.branch_id,
        branchCode: app.branch.branchCode,
        branchName: app.branch.branchName,
      } : null,
      loanProductType: app.loanProductType,
      loanAmount: Number(app.loanAmount),
      loanTenureMonths: app.loanTenureMonths,
      interestRate: Number(app.interestRate),
      interestRateType: app.interestRateType,
      purposeDescription: app.purposeDescription,
      incomeSource: app.incomeSource,
      monthlyIncome: Number(app.monthlyIncome),
      debtToIncomeRatio: app.debtToIncomeRatio ? Number(app.debtToIncomeRatio) : null,
      applicationStatus: app.applicationStatus,
      submittedAt: app.submittedAt,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt,
      rejectionReason: app.rejectionReason,
      creditScore: app.creditScore,
      aiRecommendation: app.aiRecommendation,
      approvedBy: app.approvedBy,
      approvedAt: app.approvedAt,
      disbursedByAgent: app.disbursedByAgent,
      agentDisbursementDate: app.agentDisbursementDate,
      createdAt: app.createdAt,
    };
  }

  async findById(applicationId: string): Promise<LoanApplication | null> {
    return this.applicationRepository.findOne({ where: { application_id: applicationId } });
  }

  async findByIdWithRelations(applicationId: string): Promise<LoanApplicationResponseDto | null> {
    const app = await this.applicationRepository.findOne({
      where: { application_id: applicationId },
      relations: ['member', 'loanProduct', 'branch'],
    });
    return app ? this.mapToResponseDto(app) : null;
  }

  async findByMemberId(memberId: string): Promise<LoanApplication[]> {
    return this.applicationRepository.find({ where: { memberId }, order: { createdAt: 'DESC' } });
  }

  async findAll(filters?: { status?: string[]; branchId?: string; page?: number; limit?: number; search?: string }): Promise<{ data: LoanApplication[]; total: number }> {
    const where: FindOptionsWhere<LoanApplication> = {};
    if (filters?.status && filters.status.length > 0) where.applicationStatus = In(filters.status);
    if (filters?.branchId) where.branchId = filters.branchId;
    if (filters?.search) where.memberId = Like(`%${filters.search}%`);

    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findAllWithRelations(filters?: { status?: string[]; branchId?: string; agentId?: string; memberId?: string; page?: number; limit?: number; search?: string }): Promise<{ data: LoanApplicationResponseDto[]; total: number }> {
    const where: FindOptionsWhere<LoanApplication> = {};
    if (filters?.status && filters.status.length > 0) where.applicationStatus = In(filters.status);
    if (filters?.branchId) where.branchId = filters.branchId;
    if (filters?.agentId) where.agentId = filters.agentId;
    if (filters?.memberId) where.memberId = filters.memberId;
    if (filters?.search) where.memberId = Like(`%${filters.search}%`);

    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      relations: ['member', 'loanProduct', 'branch'],
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data: data.map(app => this.mapToResponseDto(app)), total };
  }

  async create(data: Partial<LoanApplication>, userId?: string, userEmail?: string): Promise<LoanApplication> {
    // Check if member is active
    const member = await this.memberRepository.findOne({ where: { member_id: data.memberId } });
    if (!member) {
      throw new BadRequestException('Member not found');
    }
    if (member.status !== MemberStatus.ACTIVE) {
      throw new BadRequestException('Only active members can apply for loans');
    }

    const application = this.applicationRepository.create({
      ...data,
      submittedAt: new Date(),
    });
    const savedApp = await this.applicationRepository.save(application);
    
    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      userId,
      userEmail,
      entityType: 'LoanApplication',
      entityId: savedApp.application_id,
      newValues: { amount: savedApp.loanAmount, product: savedApp.loanProductType },
      description: `Created loan application for member ${savedApp.memberId}: ${savedApp.loanAmount}`,
    });
    
    return savedApp;
  }

  async update(applicationId: string, data: Partial<LoanApplication>, userId?: string, userEmail?: string): Promise<LoanApplication> {
    const oldApp = await this.findById(applicationId);
    await this.applicationRepository.update(applicationId, data);
    const updatedApp = await this.findById(applicationId);
    
    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'LoanApplication',
      entityId: applicationId,
      oldValues: { status: oldApp?.applicationStatus },
      newValues: { status: updatedApp?.applicationStatus },
      description: `Updated loan application ${applicationId}`,
    });
    
    return updatedApp;
  }

  async updateStatus(applicationId: string, status: any, reviewedBy?: string, userId?: string, userEmail?: string): Promise<LoanApplication> {
    const oldApp = await this.findById(applicationId);
    const updateData: Partial<LoanApplication> = {
      applicationStatus: status,
    };
    
    if (status === 'under_review' || status === 'reviewed') {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = reviewedBy;
    }
    
    await this.applicationRepository.update(applicationId, updateData);
    const updatedApp = await this.findById(applicationId);
    
    const auditAction = status === 'approved' ? AuditAction.APPROVE : 
                        status === 'rejected' ? AuditAction.REJECT : 
                        AuditAction.UPDATE;
    
    await this.auditLogsService.create({
      action: auditAction,
      userId,
      userEmail,
      entityType: 'LoanApplication',
      entityId: applicationId,
      oldValues: { status: oldApp?.applicationStatus },
      newValues: { status },
      description: `Loan application ${applicationId} status changed to ${status}`,
    });
    
    return updatedApp;
  }

  async delete(applicationId: string, userId?: string, userEmail?: string): Promise<void> {
    const app = await this.findById(applicationId);
    await this.applicationRepository.delete(applicationId);
    
    await this.auditLogsService.create({
      action: AuditAction.DELETE,
      userId,
      userEmail,
      entityType: 'LoanApplication',
      entityId: applicationId,
      oldValues: { amount: app?.loanAmount },
      description: `Deleted loan application ${applicationId}`,
    });
  }
}
