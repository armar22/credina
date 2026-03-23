import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';

export enum ProductType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EMERGENCY = 'emergency',
}

export enum ProductInterestRateType {
  FIXED = 'fixed',
  REDUCING = 'reducing',
}

@Entity('loan_products')
export class LoanProduct {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column({ name: 'product_name', length: 100 })
  productName: string;

  @Column({ name: 'product_type', type: 'enum', enum: ProductType })
  productType: ProductType;

  @Column({ name: 'min_amount', type: 'decimal', precision: 15, scale: 2 })
  minAmount: number;

  @Column({ name: 'max_amount', type: 'decimal', precision: 15, scale: 2 })
  maxAmount: number;

  @Column({ name: 'min_tenure_months', type: 'int' })
  minTenureMonths: number;

  @Column({ name: 'max_tenure_months', type: 'int' })
  maxTenureMonths: number;

  @Column({ name: 'interest_rate_type', type: 'enum', enum: ProductInterestRateType })
  interestRateType: ProductInterestRateType;

  @Column({ name: 'interest_rate_min', type: 'decimal', precision: 6, scale: 2 })
  interestRateMin: number;

  @Column({ name: 'interest_rate_max', type: 'decimal', precision: 6, scale: 2 })
  interestRateMax: number;

  @Column({ name: 'eligibility_criteria', type: 'jsonb', nullable: true })
  eligibilityCriteria: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  fees: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'previous_version_id', type: 'uuid', nullable: true })
  previousVersionId: string;

  @OneToMany(() => LoanApplication, application => application.loanProduct)
  applications: Relation<LoanApplication>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
