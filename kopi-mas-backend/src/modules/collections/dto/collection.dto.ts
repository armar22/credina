import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';

export enum CollectionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

export class CreateCollectionDto {
  @IsUUID()
  applicationId: string;

  @IsUUID()
  memberId: string;

  @IsUUID()
  disbursementId: string;

  @IsNumber()
  @Min(1)
  installmentNumber: number;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  dueAmount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCollectionDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @IsEnum(CollectionStatus)
  @IsOptional()
  collectionStatus?: CollectionStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(1)
  paidAmount: number;

  @IsUUID()
  @IsOptional()
  officerId?: string;
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

export class CollectionResponseDto {
  id: string;
  member: MemberSummaryDto;
  application: LoanApplicationSummaryDto;
  installmentNumber: number;
  dueDate: Date;
  dueAmount: number;
  paidAmount: number;
  collectionStatus: CollectionStatus;
  paidDate: Date | null;
  collectedByOfficerId: string | null;
  notes: string | null;
  createdAt: Date;
}

export class CollectionQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  member_id?: string;

  @IsOptional()
  @IsUUID()
  application_id?: string;
}
