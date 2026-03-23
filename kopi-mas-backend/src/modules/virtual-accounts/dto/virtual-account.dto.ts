import { IsString, IsBoolean, IsOptional, IsUUID, MaxLength, MinLength, IsNumber } from 'class-validator';

export class CreateVirtualAccountDto {
  @IsUUID()
  memberId: string;

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  vaNumber: string;

  @IsString()
  @MaxLength(100)
  bankName: string;
}

export class MemberSummaryDto {
  id: string;
  name: string;
  nik: string;
  phone: string;
}

export class VirtualAccountResponseDto {
  id: string;
  member: MemberSummaryDto;
  vaNumber: string;
  bankName: string;
  isActive: boolean;
  createdAt: Date;
}

export class VirtualAccountQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsUUID()
  @IsOptional()
  member_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
