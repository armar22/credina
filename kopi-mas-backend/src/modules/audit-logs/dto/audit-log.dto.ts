import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuditAction } from '../entities/audit-log.entity';

export class AuditLogQueryDto {
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
  action?: string;

  @IsOptional()
  @IsString()
  entity_type?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;
}

export class AuditLogResponseDto {
  id: string;
  action: AuditAction;
  userId: string | null;
  userEmail: string | null;
  entityType: string;
  entityId: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
