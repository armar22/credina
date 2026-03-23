import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Agent } from '../../agents/entities/agent.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';
import { LoanInstallment } from '../../installments/entities/installment.entity';
import { LoanCollection } from '../../collections/entities/collection.entity';
import { LoanDisbursement } from '../../disbursements/entities/disbursement.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum KtpVerificationStatus {
  PENDING = 'pending',
  MATCH = 'match',
  MANUAL_VERIFICATION = 'manual_verification',
  LOW_RESULT = 'low_result',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @Column({ unique: true, length: 16 })
  nik: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  province: string;

  @Column({ name: 'postal_code', length: 10 })
  postalCode: string;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'ktp_image_url', length: 500 })
  ktpImageUrl: string;

  // OCR Fields
  @Column({ name: 'ocr_nik', length: 20, nullable: true })
  ocrNik: string;

  @Column({ name: 'ocr_name', length: 255, nullable: true })
  ocrName: string;

  @Column({ name: 'ocr_dob', type: 'date', nullable: true })
  ocrDob: Date;

  @Column({ name: 'ocr_gender', length: 20, nullable: true })
  ocrGender: string;

  @Column({ name: 'ocr_address', type: 'text', nullable: true })
  ocrAddress: string;

  @Column({ name: 'ocr_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  ocrConfidence: number;

  @Column({ name: 'ktp_verification_status', type: 'enum', enum: KtpVerificationStatus, default: KtpVerificationStatus.PENDING })
  ktpVerificationStatus: KtpVerificationStatus;

  @Column({ name: 'ktp_verification_notes', type: 'text', nullable: true })
  ktpVerificationNotes: string;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'registration_date', type: 'timestamp' })
  registrationDate: Date;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.INACTIVE })
  status: MemberStatus;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, branch => branch.members, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @ManyToOne(() => Agent, agent => agent.members, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<Agent>;

  @Column({ name: 'created_by_officer_id', type: 'uuid' })
  createdByOfficerId: string;

  @OneToMany(() => LoanApplication, application => application.member)
  loanApplications: Relation<LoanApplication>[];

  @OneToMany(() => LoanInstallment, installment => installment.member)
  installments: Relation<LoanInstallment>[];

  @OneToMany(() => LoanCollection, collection => collection.member)
  collections: Relation<LoanCollection>[];

  @OneToMany(() => LoanDisbursement, disbursement => disbursement.member)
  disbursements: Relation<LoanDisbursement>[];

  @OneToMany(() => Payment, payment => payment.member)
  payments: Relation<Payment>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
