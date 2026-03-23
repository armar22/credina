import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max } from 'class-validator';

export enum NotificationType {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export class CreateNotificationDto {
  @IsUUID()
  memberId: string;

  @IsString()
  phone: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsUUID()
  member_id?: string;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}

export class MemberSummaryDto {
  id: string;
  name: string;
  phone: string;
}

export class NotificationResponseDto {
  id: string;
  member: MemberSummaryDto;
  phone: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  sentAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
}
