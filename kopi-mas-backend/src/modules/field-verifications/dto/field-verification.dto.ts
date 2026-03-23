import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsDateString, IsEnum, IsObject } from 'class-validator';
import { VerificationStatus } from '../entities/field-verification.entity';

export class CreateFieldVerificationDto {
  @IsUUID()
  applicationId: string;

  @IsUUID()
  officerId: string;

  @IsDateString()
  verificationDate: string;

  @IsNumber()
  gpsLatitude: number;

  @IsNumber()
  gpsLongitude: number;

  @IsBoolean()
  @IsOptional()
  addressVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  checklistCompleted?: boolean;

  @IsObject()
  @IsOptional()
  checklistData?: Record<string, any>;

  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @IsEnum(VerificationStatus)
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFieldVerificationDto {
  @IsBoolean()
  @IsOptional()
  addressVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  checklistCompleted?: boolean;

  @IsObject()
  @IsOptional()
  checklistData?: Record<string, any>;

  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @IsEnum(VerificationStatus)
  @IsOptional()
  verificationStatus?: VerificationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LoanApplicationSummaryDto {
  id: string;
  loanAmount: number;
}

export class OfficerSummaryDto {
  id: string;
  fullName: string;
  email: string;
}

export class FieldVerificationResponseDto {
  id: string;
  application: LoanApplicationSummaryDto;
  officer: OfficerSummaryDto;
  verificationDate: Date;
  gpsLatitude: number;
  gpsLongitude: number;
  addressVerified: boolean;
  checklistCompleted: boolean;
  checklistData: Record<string, any> | null;
  signatureUrl: string | null;
  verificationStatus: VerificationStatus;
  notes: string | null;
  createdAt: Date;
}

export class FieldVerificationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  application_id?: string;

  @IsOptional()
  @IsUUID()
  officer_id?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
