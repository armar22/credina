import { IsString, IsOptional, IsUUID, MaxLength, MinLength, IsNumber } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  regionCode: string;

  @IsString()
  @MaxLength(255)
  regionName: string;

  @IsUUID()
  @IsOptional()
  headUserId?: string;
}

export class UpdateRegionDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  regionName?: string;

  @IsUUID()
  @IsOptional()
  headUserId?: string;
}

export class RegionResponseDto {
  id: string;
  regionCode: string;
  regionName: string;
  headUserId: string | null;
  createdAt: Date;
}

export class RegionQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
