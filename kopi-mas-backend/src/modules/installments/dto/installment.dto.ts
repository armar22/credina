import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { InstallmentStatus } from '../entities/installment.entity';

export class CreateInstallmentDto {
  @IsUUID()
  applicationId: string;

  @IsNumber()
  @Min(1)
  installmentNumber: number;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  principalAmount: number;

  @IsNumber()
  @Min(0)
  interestAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class UpdateInstallmentDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsEnum(InstallmentStatus)
  @IsOptional()
  installmentStatus?: InstallmentStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lateFee?: number;

  @IsUUID()
  @IsOptional()
  paymentId?: string;
}

export class MemberSummaryDto {
  id: string;
  name: string;
  nik: string;
  phone: string;
}

export class LoanApplicationSummaryDto {
  id: string;
  loanAmount: number;
  loanTenureMonths: number;
}

export class InstallmentResponseDto {
  id: string;
  member: MemberSummaryDto | null;
  application: LoanApplicationSummaryDto | null;
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  paidDate: Date | null;
  installmentStatus: InstallmentStatus;
  penaltyAmount: number;
  paymentMethod: string | null;
  transactionReference: string | null;
  notes: string | null;
  createdAt: Date;
}

export class InstallmentQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
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
