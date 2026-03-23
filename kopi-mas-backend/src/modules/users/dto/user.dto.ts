import { IsString, IsEmail, IsEnum, IsOptional, MaxLength, MinLength, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username must not exceed 100 characters' })
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;

  @IsEnum(UserRole, { message: 'Invalid role specified' })
  role: UserRole;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  fullName: string;

  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  officerId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  branchId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  regionId?: string;
}

export class UpdateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
  @Transform(({ value }) => value || undefined)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Transform(({ value }) => value || undefined)
  phone?: string;

  @IsEnum(UserRole, { message: 'Invalid role specified' })
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  regionId?: string;
}

export class BranchSummaryDto {
  id: string;
  branchCode: string;
  branchName: string;
}

export class RegionSummaryDto {
  id: string;
  regionCode: string;
  regionName: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  branch: BranchSummaryDto | null;
  region: RegionSummaryDto | null;
  isActive: boolean;
  createdAt: Date;
}

export class UserQueryDto {
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  page?: number;

  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined), { toClassOnly: true })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  branch_id?: string;

  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value, { toClassOnly: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
