import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum FileCategory {
  KTP = 'ktp',
  PHOTO = 'photo',
  DOCUMENT = 'document',
  SIGNATURE = 'signature',
  RECEIPT = 'receipt',
  OTHER = 'other',
}

export class UploadResponseDto {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: FileCategory;
  memberId: string | null;
  applicationId: string | null;
  uploadedBy: string | null;
  createdAt: Date;
}

export class FileQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  member_id?: string;

  @IsOptional()
  @IsString()
  application_id?: string;
}
