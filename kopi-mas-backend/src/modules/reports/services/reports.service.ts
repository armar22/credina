import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { LoanApplication, ApplicationStatus } from '../../loan-applications/entities/loan-application.entity';
import { LoanDisbursement, TransferStatus } from '../../disbursements/entities/disbursement.entity';
import { LoanCollection } from '../../collections/entities/collection.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Region } from '../../regions/entities/region.entity';

export interface PortfolioSummary {
  totalLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalCollections: number;
  approvedLoans: number;
  pendingLoans: number;
  rejectedLoans: number;
  branchId?: string;
  byStatus?: Record<string, number>;
  byProduct?: Record<string, number>;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  applicationsProcessed: number;
  applicationsApproved: number;
  disbursementsProcessed: number;
  disbursementsAmount: number;
  collectionsCollected: number;
  successRate: number;
}

export interface CollectionReport {
  totalDue: number;
  totalCollected: number;
  collectionRate: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ReconciliationData {
  date: string;
  expected: number;
  actual: number;
  diff: number;
  status: string;
  transactions: number;
}

export interface RegionalData {
  regionId: string;
  regionName: string;
  applications: number;
  disbursed: number;
  collected: number;
  rate: number;
  branches: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(LoanApplication)
    private applicationRepository: Repository<LoanApplication>,
    @InjectRepository(LoanDisbursement)
    private disbursementRepository: Repository<LoanDisbursement>,
    @InjectRepository(LoanCollection)
    private collectionRepository: Repository<LoanCollection>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  async getPortfolioSummary(branchId?: string): Promise<PortfolioSummary> {
    const where: any = branchId ? { branchId } : {};

    const [totalLoans, disbursedApps, collections, allApps] = await Promise.all([
      this.applicationRepository.count({ where }),
      this.applicationRepository.find({
        where: { ...where, applicationStatus: ApplicationStatus.DISBURSED },
      }),
      this.collectionRepository.find(),
      this.applicationRepository.find({ where }),
    ]);

    const totalDisbursed = disbursedApps.reduce((sum, app) => sum + Number(app.loanAmount), 0);
    const totalCollections = collections.reduce((sum, col) => sum + Number(col.paidAmount || 0), 0);

    const [approved, pending, rejected] = await Promise.all([
      this.applicationRepository.count({ where: { ...where, applicationStatus: ApplicationStatus.APPROVED } }),
      this.applicationRepository.count({ where: { ...where, applicationStatus: ApplicationStatus.SUBMITTED } }),
      this.applicationRepository.count({ where: { ...where, applicationStatus: ApplicationStatus.REJECTED } }),
    ]);

    const byStatus = {
      active: disbursedApps.length,
      completed: await this.applicationRepository.count({ where: { ...where, applicationStatus: ApplicationStatus.DISBURSED } }),
      pending: pending,
      overdue: collections.filter(c => c.collectionStatus === 'overdue').length,
    };

    const byProduct: Record<string, number> = {};
    allApps.forEach(app => {
      const product = app.loanProductType || 'Other';
      byProduct[product] = (byProduct[product] || 0) + 1;
    });

    return {
      totalLoans,
      totalDisbursed,
      totalOutstanding: totalDisbursed - totalCollections,
      totalCollections,
      approvedLoans: approved,
      pendingLoans: pending,
      rejectedLoans: rejected,
      branchId,
      byStatus,
      byProduct,
    };
  }

  async getOfficerPerformance(branchId?: string): Promise<OfficerPerformance[]> {
    const where: any = branchId ? { branchId } : {};

    const officers = await this.userRepository.find({
      where: { role: 'officer' as any },
    });

    const performance: OfficerPerformance[] = [];

    for (const officer of officers) {
      const submittedApps = await this.applicationRepository.count({
        where: { createdByOfficerId: officer.user_id as any },
      });

      const approvedApps = await this.applicationRepository.count({
        where: { approvedBy: officer.user_id as any },
      });

      const disbursements = await this.disbursementRepository.find({
        where: { processedByOfficerId: officer.user_id as any },
      });
      const totalDisbursed = disbursements.reduce((sum, d) => sum + Number(d.disbursementAmount), 0);

      const collections = await this.collectionRepository.find({
        where: { collectedByOfficerId: officer.user_id as any },
      });
      const collected = collections.reduce((sum, c) => sum + Number(c.paidAmount || 0), 0);

      performance.push({
        officerId: officer.user_id,
        officerName: officer.fullName || officer.email,
        applicationsProcessed: submittedApps,
        applicationsApproved: approvedApps,
        disbursementsProcessed: disbursements.length,
        disbursementsAmount: totalDisbursed,
        collectionsCollected: collected,
        successRate: submittedApps > 0 ? (approvedApps / submittedApps) * 100 : 0,
      });
    }

    return performance;
  }

  async getCollectionReport(branchId?: string, startDate?: string, endDate?: string): Promise<CollectionReport> {
    const where: any = branchId ? { branchId } : {};
    const dateWhere: any = {};

    if (startDate && endDate) {
      dateWhere.paidDate = Between(new Date(startDate), new Date(endDate));
    }

    const collections = await this.collectionRepository.find({ 
      where: { ...where, ...dateWhere } 
    });

    const totalCollected = collections.reduce((sum, c) => sum + Number(c.paidAmount || 0), 0);
    const totalDue = collections.reduce((sum, c) => sum + Number(c.dueAmount), 0);

    const branches = await this.branchRepository.find();
    const byBranch: Record<string, number> = {};
    branches.forEach(branch => {
      byBranch[branch.branchName] = collections.filter(c => c.application?.branchId === branch.branch_id).length;
    });

    return {
      totalDue,
      totalCollected,
      collectionRate: totalDue > 0 ? (totalCollected / totalDue) * 100 : 0,
      byStatus: {
        paid: collections.filter(c => c.collectionStatus === 'paid').length,
        pending: collections.filter(c => c.collectionStatus === 'pending').length,
        overdue: collections.filter(c => c.collectionStatus === 'overdue').length,
        partial: collections.filter(c => c.collectionStatus === 'partial').length,
      },
      byBranch,
      period: {
        startDate: startDate || new Date(new Date().setDate(1)).toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    };
  }

  async getReconciliationReport(branchId?: string, startDate?: string, endDate?: string): Promise<ReconciliationData[]> {
    const data: ReconciliationData[] = [];
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const [collections, payments] = await Promise.all([
        this.collectionRepository.find({
          where: { paidDate: Between(dayStart, dayEnd) },
        }),
        this.paymentRepository.find({
          where: { paidAt: Between(dayStart, dayEnd), paymentStatus: 'completed' as any },
        }),
      ]);

      const expected = collections.reduce((sum, c) => sum + Number(c.dueAmount), 0);
      const actual = payments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
      const diff = actual - expected;

      data.push({
        date: d.toISOString().split('T')[0],
        expected,
        actual,
        diff,
        status: diff === 0 ? 'matched' : Math.abs(diff) / expected < 0.05 ? 'matched' : 'review',
        transactions: payments.length,
      });
    }

    return data;
  }

  async getRegionalReport(): Promise<RegionalData[]> {
    const regions = await this.regionRepository.find({ relations: ['branches'] });
    const data: RegionalData[] = [];

    for (const region of regions) {
      const branchIds = region.branches?.map(b => b.branch_id) || [];
      
      const applications = await this.applicationRepository
        .createQueryBuilder('app')
        .where(branchIds.length > 0 ? 'app.branch_id IN (:...branchIds)' : '1=1', { branchIds })
        .getCount();

      const disbursements = await this.disbursementRepository
        .createQueryBuilder('disb')
        .leftJoin('disb.application', 'app')
        .where(branchIds.length > 0 ? 'app.branch_id IN (:...branchIds)' : '1=1', { branchIds })
        .andWhere('disb.transfer_status = :status', { status: TransferStatus.COMPLETED })
        .getMany();
      
      const disbursed = disbursements.reduce((sum, d) => sum + Number(d.disbursementAmount), 0);

      const collections = await this.collectionRepository
        .createQueryBuilder('col')
        .where(branchIds.length > 0 ? 'col.application_id IN (SELECT application_id FROM loan_applications WHERE branch_id IN (:...branchIds))' : '1=1', { branchIds })
        .getMany();
      
      const collected = collections.reduce((sum, c) => sum + Number(c.paidAmount || 0), 0);
      const totalDue = collections.reduce((sum, c) => sum + Number(c.dueAmount), 0);

      data.push({
        regionId: region.region_id,
        regionName: region.regionName,
        applications,
        disbursed,
        collected,
        rate: totalDue > 0 ? (collected / totalDue) * 100 : 0,
        branches: region.branches?.length || 0,
      });
    }

    return data;
  }

  async exportReport(
    reportType: string,
    format: string,
    branchId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ url: string; expiresAt: Date }> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      url: `https://storage.example.com/reports/${reportType}_${Date.now()}.${format}`,
      expiresAt,
    };
  }
}
