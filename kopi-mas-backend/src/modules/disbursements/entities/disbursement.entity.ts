import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';
import { Agent } from '../../agents/entities/agent.entity';

export enum TransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('loan_disbursements')
export class LoanDisbursement {
  @PrimaryGeneratedColumn('uuid')
  disbursement_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => LoanApplication, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Relation<LoanApplication>;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: Relation<Member>;

  @Column({ name: 'disbursement_amount', type: 'decimal', precision: 15, scale: 2 })
  disbursementAmount: number;

  @Column({ name: 'disbursement_date', type: 'date' })
  disbursementDate: Date;

  @Column({ name: 'bank_name', length: 100 })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50 })
  bankAccountNumber: string;

  @Column({ name: 'bank_account_holder', length: 255 })
  bankAccountHolder: string;

  @Column({ name: 'transfer_status', type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  transferStatus: TransferStatus;

  @Column({ name: 'transfer_reference', length: 100, nullable: true })
  transferReference: string;

  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  @Column({ name: 'receipt_url', length: 500, nullable: true })
  receiptUrl: string;

  @Column({ name: 'processed_by_officer_id', type: 'uuid' })
  processedByOfficerId: string;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<Agent>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
