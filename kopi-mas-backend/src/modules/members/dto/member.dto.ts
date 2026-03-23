import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, MaxLength, MinLength, IsNumber } from 'class-validator';
import { Gender, MemberStatus } from '../entities/member.entity';

export class CreateMemberDto {
  @IsString()
  @MinLength(16)
  @MaxLength(16)
  nik: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsDateString()
  dob: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  address: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  province: string;

  @IsString()
  @MaxLength(10)
  postalCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  photoUrl?: string;

  @IsString()
  @MaxLength(500)
  ktpImageUrl: string;

  @IsString()
  createdByOfficerId: string;
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;
}

export class BranchSummaryDto {
  id: string;
  branchCode: string;
  branchName: string;
}

export class MemberResponseDto {
  id: string;
  nik: string;
  name: string;
  dob: Date;
  gender: Gender;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  photoUrl: string | null;
  ktpImageUrl: string;
  registrationDate: Date;
  status: MemberStatus;
  branch: BranchSummaryDto | null;
  createdAt: Date;
  // OCR Fields
  ocrNik: string | null;
  ocrName: string | null;
  ocrDob: Date | null;
  ocrGender: string | null;
  ocrAddress: string | null;
  ocrConfidence: number | null;
  ktpVerificationStatus: string;
  ktpVerificationNotes: string | null;
}

export class MemberQueryDto {
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
  @IsString()
  city?: string;
}
