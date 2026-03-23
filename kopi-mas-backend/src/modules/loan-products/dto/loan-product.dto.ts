import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsEnum, IsObject, MaxLength, Min } from 'class-validator';
import { ProductType, ProductInterestRateType } from '../entities/loan-product.entity';

export class CreateLoanProductDto {
  @IsString()
  @MaxLength(100)
  productName: string;

  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  @Min(0)
  minAmount: number;

  @IsNumber()
  @Min(0)
  maxAmount: number;

  @IsNumber()
  @Min(1)
  minTenureMonths: number;

  @IsNumber()
  @Min(1)
  maxTenureMonths: number;

  @IsEnum(ProductInterestRateType)
  interestRateType: ProductInterestRateType;

  @IsNumber()
  @Min(0)
  interestRateMin: number;

  @IsNumber()
  @Min(0)
  interestRateMax: number;

  @IsObject()
  @IsOptional()
  eligibilityCriteria?: Record<string, any>;

  @IsObject()
  @IsOptional()
  fees?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}

export class UpdateLoanProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  productName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minTenureMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxTenureMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interestRateMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  interestRateMax?: number;

  @IsObject()
  @IsOptional()
  eligibilityCriteria?: Record<string, any>;

  @IsObject()
  @IsOptional()
  fees?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class BranchSummaryDto {
  id: string;
  branchCode: string;
  branchName: string;
}

export class LoanProductResponseDto {
  id: string;
  productName: string;
  productType: ProductType;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  interestRateType: ProductInterestRateType;
  interestRateMin: number;
  interestRateMax: number;
  eligibilityCriteria: Record<string, any> | null;
  fees: Record<string, any> | null;
  branch: BranchSummaryDto | null;
  isActive: boolean;
  createdAt: Date;
}

export class LoanProductQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsEnum(ProductType)
  @IsOptional()
  product_type?: ProductType;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
