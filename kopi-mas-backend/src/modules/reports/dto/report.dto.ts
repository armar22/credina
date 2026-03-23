import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString } from 'class-validator';

export enum ReportType {
  PORTFOLIO = 'portfolio',
  OFFICER_PERFORMANCE = 'officer_performance',
  COLLECTION = 'collection',
  RECONCILIATION = 'reconciliation',
  REGIONAL = 'regional',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export class GetPortfolioReportDto {
  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class GetOfficerPerformanceDto {
  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class GetCollectionReportDto {
  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class ExportReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class BranchSummaryDto {
  id: string;
  branchCode: string;
  branchName: string;
}

export class LoanApplicationSummaryDto {
  id: string;
  loanAmount: number;
}

export class CollectionSummaryDto {
  id: string;
  dueAmount: number;
  paidAmount: number;
}

export class PortfolioReportResponseDto {
  totalApplications: number;
  totalDisbursed: number;
  totalCollected: number;
  outstandingAmount: number;
  branches: BranchSummaryDto[];
  byStatus: Record<string, number>;
  byProduct: Record<string, number>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export class OfficerPerformanceReportDto {
  officerId: string;
  officerName: string;
  applicationsProcessed: number;
  disbursementsProcessed: number;
  collectionsCollected: number;
  successRate: number;
}

export class CollectionReportResponseDto {
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

export class ReportQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}


