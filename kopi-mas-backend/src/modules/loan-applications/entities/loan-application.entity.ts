import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { LoanProduct } from '../../loan-products/entities/loan-product.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { LoanInstallment } from '../../installments/entities/installment.entity';
import { LoanCollection } from '../../collections/entities/collection.entity';
import { LoanDisbursement } from '../../disbursements/entities/disbursement.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum LoanProductType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EMERGENCY = 'emergency',
}

export enum InterestRateType {
  FIXED = 'fixed',
  REDUCING = 'reducing',
}

export enum IncomeSource {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self_employed',
  BUSINESS = 'business',
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  CANCELLED = 'cancelled',
}

export enum AIRecommendation {
  APPROVE = 'approve',
  REJECT = 'reject',
  REVIEW = 'review',
}

@Entity('loan_applications')
export class LoanApplication {
  @PrimaryGeneratedColumn('uuid')
  application_id: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member, member => member.loanApplications, { nullable: true })
  @JoinColumn({ name: 'member_id' })
  member: Relation<Member>;

  @Column({ name: 'loan_product_id', type: 'uuid', nullable: true })
  loanProductId: string;

  @ManyToOne(() => LoanProduct, product => product.applications, { nullable: true })
  @JoinColumn({ name: 'loan_product_id' })
  loanProduct: Relation<LoanProduct>;

  @Column({ name: 'loan_product_type', type: 'enum', enum: LoanProductType })
  loanProductType: LoanProductType;

  @Column({ name: 'loan_amount', type: 'decimal', precision: 15, scale: 2 })
  loanAmount: number;

  @Column({ name: 'loan_tenure_months', type: 'int' })
  loanTenureMonths: number;

  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 4 })
  interestRate: number;

  @Column({ name: 'interest_rate_type', type: 'enum', enum: InterestRateType })
  interestRateType: InterestRateType;

  @Column({ name: 'purpose_description', type: 'text', nullable: true })
  purposeDescription: string;

  @Column({ name: 'income_source', type: 'enum', enum: IncomeSource })
  incomeSource: IncomeSource;

  @Column({ name: 'monthly_income', type: 'decimal', precision: 15, scale: 2 })
  monthlyIncome: number;

  @Column({ name: 'debt_to_income_ratio', type: 'decimal', precision: 5, scale: 4, nullable: true })
  debtToIncomeRatio: number;

  @Column({ name: 'application_status', type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.SUBMITTED })
  applicationStatus: ApplicationStatus;

  @Column({ name: 'submitted_at', type: 'timestamp' })
  submittedAt: Date;

  @Column({ name: 'reviewed_by', length: 255, nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'credit_score', type: 'int', nullable: true })
  creditScore: number;

  @Column({ name: 'credit_score_factors', type: 'jsonb', nullable: true })
  creditScoreFactors: Record<string, any>;

  @Column({ name: 'ai_recommendation', type: 'enum', enum: AIRecommendation, nullable: true })
  aiRecommendation: AIRecommendation;

  @Column({ name: 'approval_level', default: 1 })
  approvalLevel: number;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, branch => branch.loanApplications, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @Column({ name: 'disbursed_by_agent', type: 'boolean', default: false })
  disbursedByAgent: boolean;

  @Column({ name: 'agent_disbursement_date', type: 'timestamp', nullable: true })
  agentDisbursementDate: Date;

  @Column({ name: 'created_by_officer_id', type: 'uuid', nullable: true })
  createdByOfficerId: string;

  @OneToMany(() => LoanInstallment, installment => installment.application)
  installments: Relation<LoanInstallment>[];

  @OneToMany(() => LoanCollection, collection => collection.application)
  collections: Relation<LoanCollection>[];

  @OneToMany(() => LoanDisbursement, disbursement => disbursement.application)
  disbursements: Relation<LoanDisbursement>[];

  @OneToMany(() => Payment, payment => payment.application)
  payments: Relation<Payment>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
