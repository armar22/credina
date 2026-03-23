import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanApplication, ApplicationStatus } from '../../loan-applications/entities/loan-application.entity';
import { LoanDisbursement, TransferStatus } from '../../disbursements/entities/disbursement.entity';
import { LoanCollection } from '../../collections/entities/collection.entity';
import { LoanInstallment } from '../../installments/entities/installment.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Region } from '../../regions/entities/region.entity';

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface LoanApplicationStats {
  total: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  disbursed: number;
}

export interface DisbursementStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
  disbursedAmount: number;
}

export interface CollectionStats {
  totalDue: number;
  totalCollected: number;
  collectionRate: number;
  pending: number;
  paid: number;
  overdue: number;
}

export interface DailyStats {
  date: string;
  newApplications: number;
  disbursedAmount: number;
  collectedAmount: number;
  approvedApplications: number;
  disbursementChange?: number;
  collectionChange?: number;
}

export interface TrendData {
  period: string;
  disbursement: number;
  collection: number;
}

export interface DashboardStats {
  memberStats: MemberStats;
  loanApplicationStats: LoanApplicationStats;
  disbursementStats: DisbursementStats;
  collectionStats: CollectionStats;
  recentApplications: any[];
  recentDisbursements: any[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(LoanApplication)
    private applicationRepository: Repository<LoanApplication>,
    @InjectRepository(LoanDisbursement)
    private disbursementRepository: Repository<LoanDisbursement>,
    @InjectRepository(LoanCollection)
    private collectionRepository: Repository<LoanCollection>,
    @InjectRepository(LoanInstallment)
    private installmentRepository: Repository<LoanInstallment>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  async getStats(branchId?: string): Promise<DashboardStats> {
    const whereBranch = branchId ? { branchId } : {};

    const [memberStats, loanApplicationStats, disbursementStats, collectionStats, recentApplications, recentDisbursements] =
      await Promise.all([
        this.getMemberStats(),
        this.getLoanApplicationStats(whereBranch),
        this.getDisbursementStats(whereBranch),
        this.getCollectionStats(whereBranch),
        this.getRecentApplications(whereBranch),
        this.getRecentDisbursements(whereBranch),
      ]);

    return {
      memberStats,
      loanApplicationStats,
      disbursementStats,
      collectionStats,
      recentApplications,
      recentDisbursements,
    };
  }

  async getDailyStats(date?: string): Promise<DailyStats> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfLastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);

    const [newApplications, disbursements, collections, approvedApps, lastMonthDisbursements, lastMonthCollections] = await Promise.all([
      this.applicationRepository.count({
        where: {
          createdAt: Between(startOfDay, endOfDay),
        },
      }),
      this.disbursementRepository
        .createQueryBuilder('d')
        .select('SUM(d.disbursement_amount)', 'total')
        .where('d.disbursement_date BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
        .andWhere('d.transfer_status = :status', { status: TransferStatus.COMPLETED })
        .getRawOne(),
      this.collectionRepository
        .createQueryBuilder('c')
        .select('SUM(c.paid_amount)', 'total')
        .where('c.paid_date BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
        .getRawOne(),
      this.applicationRepository.count({
        where: {
          applicationStatus: ApplicationStatus.APPROVED,
          approvedAt: Between(startOfDay, endOfDay),
        },
      }),
      this.disbursementRepository
        .createQueryBuilder('d')
        .select('SUM(d.disbursement_amount)', 'total')
        .where('d.disbursement_date BETWEEN :start AND :end', { start: startOfLastMonth, end: endOfLastMonth })
        .andWhere('d.transfer_status = :status', { status: TransferStatus.COMPLETED })
        .getRawOne(),
      this.collectionRepository
        .createQueryBuilder('c')
        .select('SUM(c.paid_amount)', 'total')
        .where('c.paid_date BETWEEN :start AND :end', { start: startOfLastMonth, end: endOfLastMonth })
        .getRawOne(),
    ]);

    const disbursedAmount = parseFloat(disbursements?.total || '0');
    const collectedAmount = parseFloat(collections?.total || '0');
    const lastMonthDisbursed = parseFloat(lastMonthDisbursements?.total || '0');
    const lastMonthCollected = parseFloat(lastMonthCollections?.total || '0');

    return {
      date: targetDate.toISOString().split('T')[0],
      newApplications,
      disbursedAmount,
      collectedAmount,
      approvedApplications: approvedApps,
      disbursementChange: lastMonthDisbursed > 0 ? ((disbursedAmount - lastMonthDisbursed) / lastMonthDisbursed) * 100 : 0,
      collectionChange: lastMonthCollected > 0 ? ((collectedAmount - lastMonthCollected) / lastMonthCollected) * 100 : 0,
    };
  }

  async getTrendStats(period: string = 'week'): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const now = new Date();

    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [disbursement, collection] = await Promise.all([
        this.disbursementRepository
          .createQueryBuilder('d')
          .select('SUM(d.disbursement_amount)', 'total')
          .where('d.disbursement_date BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
          .andWhere('d.transfer_status = :status', { status: TransferStatus.COMPLETED })
          .getRawOne(),
        this.collectionRepository
          .createQueryBuilder('c')
          .select('SUM(c.paid_amount)', 'total')
          .where('c.paid_date BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
          .getRawOne(),
      ]);

      const periodLabel = period === 'week' 
        ? date.toLocaleDateString('id-ID', { weekday: 'short' })
        : period === 'month'
        ? date.toLocaleDateString('id-ID', { day: 'numeric' })
        : date.toLocaleDateString('id-ID', { month: 'short' });

      trends.push({
        period: periodLabel,
        disbursement: parseFloat(disbursement?.total || '0'),
        collection: parseFloat(collection?.total || '0'),
      });
    }

    return trends;
  }

  private async getMemberStats(): Promise<MemberStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, inactive, newThisMonth] = await Promise.all([
      this.memberRepository.count(),
      this.memberRepository.count({ where: { status: 'active' as any } }),
      this.memberRepository.count({ where: { status: 'inactive' as any } }),
      this.memberRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
    ]);

    return { total, active, inactive: inactive || (total - active), newThisMonth };
  }

  private async getLoanApplicationStats(whereBranch: any): Promise<LoanApplicationStats> {
    const [total, submitted, underReview, approved, rejected, disbursed] = await Promise.all([
      this.applicationRepository.count({ where: whereBranch }),
      this.applicationRepository.count({ where: { ...whereBranch, applicationStatus: ApplicationStatus.SUBMITTED } }),
      this.applicationRepository.count({ where: { ...whereBranch, applicationStatus: ApplicationStatus.UNDER_REVIEW } }),
      this.applicationRepository.count({ where: { ...whereBranch, applicationStatus: ApplicationStatus.APPROVED } }),
      this.applicationRepository.count({ where: { ...whereBranch, applicationStatus: ApplicationStatus.REJECTED } }),
      this.applicationRepository.count({ where: { ...whereBranch, applicationStatus: ApplicationStatus.DISBURSED } }),
    ]);

    return { total, submitted, underReview, approved, rejected, disbursed };
  }

  private async getDisbursementStats(whereBranch: any): Promise<DisbursementStats> {
    const branchCondition = whereBranch.branchId ? 'app.branch_id = :branchId' : '1=1';
    
    const [total, pending, processing, completed, failed, totalAmount, disbursedAmount] = await Promise.all([
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where(branchCondition, { branchId: whereBranch.branchId })
        .getCount(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where('disb.transfer_status = :status', { status: TransferStatus.PENDING })
        .andWhere(branchCondition, { branchId: whereBranch.branchId })
        .getCount(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where('disb.transfer_status = :status', { status: TransferStatus.PROCESSING })
        .andWhere(branchCondition, { branchId: whereBranch.branchId })
        .getCount(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where('disb.transfer_status = :status', { status: TransferStatus.COMPLETED })
        .andWhere(branchCondition, { branchId: whereBranch.branchId })
        .getCount(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where('disb.transfer_status = :status', { status: TransferStatus.FAILED })
        .andWhere(branchCondition, { branchId: whereBranch.branchId })
        .getCount(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .select('SUM(disb.disbursement_amount)', 'total')
        .where(branchCondition, { branchId: whereBranch.branchId })
        .getRawOne(),
      this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .select('SUM(disb.disbursement_amount)', 'total')
        .where('disb.transfer_status = :status', { status: TransferStatus.COMPLETED })
        .andWhere(branchCondition, { branchId: whereBranch.branchId })
        .getRawOne(),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      totalAmount: parseFloat(totalAmount?.total || '0'),
      disbursedAmount: parseFloat(disbursedAmount?.total || '0'),
    };
  }

  private async getCollectionStats(whereBranch: any): Promise<CollectionStats> {
    const [totalDue, totalCollected, pending, paid, overdue] = await Promise.all([
      this.collectionRepository
        .createQueryBuilder('c')
        .select('SUM(c.due_amount)', 'total')
        .getRawOne(),
      this.collectionRepository
        .createQueryBuilder('c')
        .select('SUM(c.paid_amount)', 'total')
        .getRawOne(),
      this.collectionRepository.count({ where: { collectionStatus: 'pending' as any } }),
      this.collectionRepository.count({ where: { collectionStatus: 'paid' as any } }),
      this.collectionRepository.count({ where: { collectionStatus: 'overdue' as any } }),
    ]);

    const due = parseFloat(totalDue?.total || '0');
    const collected = parseFloat(totalCollected?.total || '0');

    return {
      totalDue: due,
      totalCollected: collected,
      collectionRate: due > 0 ? (collected / due) * 100 : 0,
      pending,
      paid,
      overdue,
    };
  }

  private async getRecentApplications(whereBranch: any): Promise<any[]> {
    const applications = await this.applicationRepository.find({
      where: whereBranch,
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['member'],
    });

    return applications.map((app) => ({
      id: app.application_id,
      memberName: app.member?.name || 'Unknown',
      loanAmount: app.loanAmount,
      status: app.applicationStatus,
      submittedAt: app.createdAt?.toISOString() || '',
      productName: app.loanProductType,
    }));
  }

  private async getRecentDisbursements(whereBranch: any): Promise<any[]> {
    const disbursements = await this.disbursementRepository.find({
      where: whereBranch,
      order: { disbursementDate: 'DESC' },
      take: 10,
      relations: ['member'],
    });

    return disbursements.map((disb) => ({
      id: disb.disbursement_id,
      memberName: disb.member?.name || 'Unknown',
      amount: disb.disbursementAmount,
      status: disb.transferStatus,
      disbursedAt: disb.disbursementDate ? new Date(disb.disbursementDate).toISOString() : '',
    }));
  }
}
