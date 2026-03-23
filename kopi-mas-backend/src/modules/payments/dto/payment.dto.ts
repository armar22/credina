import { IsString, IsNumber, IsOptional, IsUUID, IsEnum, Min } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsUUID()
  @IsOptional()
  collectionId?: string;

  @IsUUID()
  @IsOptional()
  installmentId?: string;

  @IsNumber()
  @Min(1)
  paymentAmount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  externalReference?: string;

  @IsString()
  @IsOptional()
  senderAccountNumber?: string;

  @IsString()
  @IsOptional()
  senderBankName?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  proofUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
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
}

export class PaymentResponseDto {
  id: string;
  member: MemberSummaryDto | null;
  application: LoanApplicationSummaryDto | null;
  collectionId: string | null;
  installmentId: string | null;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference: string | null;
  externalReference: string | null;
  paidAt: Date | null;
  processedByOfficerId: string | null;
  senderAccountNumber: string | null;
  senderBankName: string | null;
  senderName: string | null;
  notes: string | null;
  proofUrl: string | null;
  createdAt: Date;
}

export class PaymentQueryDto {
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
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
