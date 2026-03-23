import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';
import { Agent } from '../../agents/entities/agent.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  VIRTUAL_ACCOUNT = 'virtual_account',
  QRIS = 'qris',
  GOPAY = 'gopay',
  OVO = 'ovo',
  DANA = 'dana',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  @Column({ name: 'application_id', type: 'uuid', nullable: true })
  applicationId: string;

  @ManyToOne(() => LoanApplication, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Relation<LoanApplication>;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member, member => member.payments, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: Relation<Member>;

  @Column({ name: 'collection_id', type: 'uuid', nullable: true })
  collectionId: string;

  @Column({ name: 'installment_id', type: 'uuid', nullable: true })
  installmentId: string;

  @Column({ name: 'payment_amount', type: 'decimal', precision: 15, scale: 2 })
  paymentAmount: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'transaction_reference', length: 255, nullable: true })
  transactionReference: string;

  @Column({ name: 'external_reference', length: 255, nullable: true })
  externalReference: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'processed_by_officer_id', type: 'uuid', nullable: true })
  processedByOfficerId: string;

  @Column({ name: 'receiver_account_number', length: 50, nullable: true })
  receiverAccountNumber: string;

  @Column({ name: 'receiver_bank_name', length: 100, nullable: true })
  receiverBankName: string;

  @Column({ name: 'sender_account_number', length: 50, nullable: true })
  senderAccountNumber: string;

  @Column({ name: 'sender_bank_name', length: 100, nullable: true })
  senderBankName: string;

  @Column({ name: 'sender_name', length: 255, nullable: true })
  senderName: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'proof_url', length: 500, nullable: true })
  proofUrl: string;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<Agent>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
