import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { LoanProductType, InterestRateType, IncomeSource, ApplicationStatus } from '../entities/loan-application.entity';

export class CreateLoanApplicationDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  @IsOptional()
  agentId?: string;

  @IsUUID()
  @IsOptional()
  loanProductId?: string;

  @IsEnum(LoanProductType)
  loanProductType: LoanProductType;

  @IsNumber()
  @Min(100000)
  loanAmount: number;

  @IsNumber()
  @Min(1)
  @Max(60)
  loanTenureMonths: number;

  @IsNumber()
  interestRate: number;

  @IsEnum(InterestRateType)
  interestRateType: InterestRateType;

  @IsString()
  @IsOptional()
  purposeDescription?: string;

  @IsEnum(IncomeSource)
  incomeSource: IncomeSource;

  @IsNumber()
  monthlyIncome: number;

  @IsNumber()
  @IsOptional()
  debtToIncomeRatio?: number;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}

export class UpdateLoanApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsString()
  @IsOptional()
  reviewedBy?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsNumber()
  @IsOptional()
  creditScore?: number;
}

export class MemberSummaryDto {
  id: string;
  name: string;
  nik: string;
  phone: string;
}

export class LoanProductSummaryDto {
  id: string;
  productName: string;
  productType: LoanProductType;
}

export class BranchSummaryDto {
  id: string;
  branchCode: string;
  branchName: string;
}

export class LoanApplicationResponseDto {
  id: string;
  member: MemberSummaryDto;
  agentId: string | null;
  agentName: string | null;
  loanProduct: LoanProductSummaryDto | null;
  branch: BranchSummaryDto | null;
  loanProductType: LoanProductType;
  loanAmount: number;
  loanTenureMonths: number;
  interestRate: number;
  interestRateType: InterestRateType;
  purposeDescription: string | null;
  incomeSource: IncomeSource;
  monthlyIncome: number;
  debtToIncomeRatio: number | null;
  applicationStatus: ApplicationStatus;
  submittedAt: Date;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  creditScore: number | null;
  aiRecommendation: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  disbursedByAgent: boolean;
  agentDisbursementDate: Date | null;
  createdAt: Date;
}

export class LoanApplicationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsUUID()
  agent_id?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
