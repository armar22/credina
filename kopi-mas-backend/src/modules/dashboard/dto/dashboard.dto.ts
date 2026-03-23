import { IsOptional, IsUUID, IsNumber } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsUUID()
  region_id?: string;
}

export class MemberStatsDto {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export class LoanApplicationStatsDto {
  total: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  disbursed: number;
}

export class DisbursementStatsDto {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
  disbursedAmount: number;
}

export class CollectionStatsDto {
  totalDue: number;
  totalCollected: number;
  collectionRate: number;
  pending: number;
  paid: number;
  overdue: number;
}

export class DashboardResponseDto {
  memberStats: MemberStatsDto;
  loanApplicationStats: LoanApplicationStatsDto;
  disbursementStats: DisbursementStatsDto;
  collectionStats: CollectionStatsDto;
  recentApplications: {
    id: string;
    memberName: string;
    loanAmount: number;
    status: string;
    submittedAt: Date;
  }[];
  recentDisbursements: {
    id: string;
    memberName: string;
    amount: number;
    status: string;
    disbursedAt: Date;
  }[];
}
