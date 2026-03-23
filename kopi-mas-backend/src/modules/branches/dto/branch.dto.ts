import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  branchCode: string;

  @IsString()
  @MaxLength(255)
  branchName: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsString()
  address: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  province: string;

  @IsString()
  @MaxLength(20)
  phone: string;
}

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  branchName?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class RegionSummaryDto {
  id: string;
  regionName: string;
}

export class BranchResponseDto {
  id: string;
  branchCode: string;
  branchName: string;
  region: RegionSummaryDto | null;
  address: string;
  city: string;
  province: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

export class BranchQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  region_id?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
