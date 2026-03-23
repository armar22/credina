import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, Max, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum TransactionType {
  PETTY_CASH_IN = 'petty_cash_in',
  PETTY_CASH_OUT = 'petty_cash_out',
  COLLECTION_IN = 'collection_in',
  COLLECTION_OUT = 'collection_out',
  DISBURSEMENT = 'disbursement',
  DEPOSIT = 'deposit',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class CreateAgentDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  idCardNumber?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  selfApprovalLimit?: number;
}

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  idCardNumber?: string;

  @IsEnum(AgentStatus)
  @IsOptional()
  status?: AgentStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  selfApprovalLimit?: number;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsUUID()
  @IsOptional()
  regionId?: string;
}

export class AgentQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(AgentStatus)
  @IsOptional()
  status?: string;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsUUID()
  @IsOptional()
  region_id?: string;
}

export class PettyCashDto {
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class DisburseToMemberDto {
  @IsUUID()
  agentId: string;

  @IsUUID()
  applicationId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class DepositToAdminDto {
  @IsUUID()
  agentId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AgentWalletResponseDto {
  id: string;
  agentCode: string;
  fullName: string;
  phoneNumber: string;
  pettyCashBalance: number;
  collectionBalance: number;
  totalBalance: number;
  status: AgentStatus;
  selfApprovalLimit: number;
}

export class AgentTransactionResponseDto {
  id: string;
  agentId: string;
  agentName: string;
  transactionType: TransactionType;
  amount: number;
  status: TransactionStatus;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  balanceBefore: number;
  balanceAfter: number;
  processedBy: string | null;
  processedAt: Date | null;
  createdAt: Date;
}
