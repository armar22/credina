import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean, IsEnum, MaxLength } from 'class-validator';

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export class CreateIntegrationDto {
  @IsString()
  @MaxLength(100)
  integrationName: string;

  @IsString()
  @MaxLength(50)
  provider: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateIntegrationDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  integrationName?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class IntegrationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class IntegrationResponseDto {
  id: string;
  integrationName: string;
  provider: string;
  apiKey: string | null;
  webhookUrl: string | null;
  status: IntegrationStatus;
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
}
