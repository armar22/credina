import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { TransferStatus } from '../entities/disbursement.entity';

export class CreateDisbursementDto {
  @IsUUID()
  applicationId: string;

  @IsUUID()
  memberId: string;

  @IsNumber()
  disbursementAmount: number;

  @IsDateString()
  disbursementDate: string;

  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @MaxLength(50)
  bankAccountNumber: string;

  @IsString()
  @MaxLength(255)
  bankAccountHolder: string;

  @IsUUID()
  processedByOfficerId: string;
}

export class UpdateDisbursementDto {
  @IsEnum(TransferStatus)
  @IsOptional()
  transferStatus?: TransferStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  transferReference?: string;

  @IsBoolean()
  @IsOptional()
  notificationSent?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  receiptUrl?: string;
}

export class MemberSummaryDto {
  id: string;
  name: string;
  nik: string;
  phone: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

export class LoanApplicationSummaryDto {
  id: string;
  loanAmount: number;
  loanTenureMonths: number;
}

export class DisbursementResponseDto {
  id: string;
  member: MemberSummaryDto | null;
  application: LoanApplicationSummaryDto | null;
  disbursementAmount: number;
  disbursementDate: Date;
  transferStatus: TransferStatus;
  transferReference: string | null;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  receiptUrl: string | null;
  notificationSent: boolean;
  processedByOfficerId: string;
  createdAt: Date;
}

export class DisbursementQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  member_id?: string;

  @IsOptional()
  @IsUUID()
  application_id?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
