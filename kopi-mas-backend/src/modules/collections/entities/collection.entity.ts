import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';
import { Agent } from '../../agents/entities/agent.entity';

export enum CollectionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
}

@Entity('loan_collections')
export class LoanCollection {
  @PrimaryGeneratedColumn('uuid')
  collection_id: string;

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

  @Column({ name: 'disbursement_id', type: 'uuid' })
  disbursementId: string;

  @Column({ name: 'installment_number', type: 'int' })
  installmentNumber: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'due_amount', type: 'decimal', precision: 15, scale: 2 })
  dueAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate: Date;

  @Column({ name: 'collection_status', type: 'enum', enum: CollectionStatus, default: CollectionStatus.PENDING })
  collectionStatus: CollectionStatus;

  @Column({ name: 'collected_by_officer_id', type: 'uuid', nullable: true })
  collectedByOfficerId: string;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @ManyToOne(() => Agent, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<Agent>;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
