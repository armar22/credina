import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Agent } from './agent.entity';

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

@Entity('agent_wallet_transactions')
export class AgentWalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column({ name: 'agent_id', type: 'uuid' })
  agentId: string;

  @ManyToOne(() => Agent, (agent) => agent.walletTransactions)
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<Agent>;

  @Column({ type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'description', length: 255, nullable: true })
  description: string;

  @Column({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
