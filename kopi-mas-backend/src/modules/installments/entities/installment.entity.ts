import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';

export enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  WAIVED = 'waived',
}

@Entity('loan_installments')
export class LoanInstallment {
  @PrimaryGeneratedColumn('uuid')
  installment_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => LoanApplication, application => application.installments, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Relation<LoanApplication>;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member, member => member.installments, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: Relation<Member>;

  @Column({ name: 'disbursement_id', type: 'uuid' })
  disbursementId: string;

  @Column({ name: 'installment_number', type: 'int' })
  installmentNumber: number;

  @Column({ name: 'principal_amount', type: 'decimal', precision: 15, scale: 2 })
  principalAmount: number;

  @Column({ name: 'interest_amount', type: 'decimal', precision: 15, scale: 2 })
  interestAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate: Date;

  @Column({ name: 'installment_status', type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
  installmentStatus: InstallmentStatus;

  @Column({ name: 'penalty_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ name: 'paid_by_officer_id', type: 'uuid', nullable: true })
  paidByOfficerId: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 255, nullable: true })
  transactionReference: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
