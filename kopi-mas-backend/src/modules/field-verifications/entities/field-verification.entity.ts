import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum VerificationStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
}

@Entity('field_verifications')
export class FieldVerification {
  @PrimaryGeneratedColumn('uuid')
  verification_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'officer_id', type: 'uuid' })
  officerId: string;

  @Column({ name: 'verification_date', type: 'timestamp' })
  verificationDate: Date;

  @Column({ name: 'gps_latitude', type: 'decimal', precision: 10, scale: 8 })
  gpsLatitude: number;

  @Column({ name: 'gps_longitude', type: 'decimal', precision: 11, scale: 8 })
  gpsLongitude: number;

  @Column({ name: 'address_verified', default: false })
  addressVerified: boolean;

  @Column({ name: 'checklist_completed', default: false })
  checklistCompleted: boolean;

  @Column({ name: 'checklist_data', type: 'jsonb', nullable: true })
  checklistData: Record<string, any>;

  @Column({ name: 'signature_url', length: 500, nullable: true })
  signatureUrl: string;

  @Column({ name: 'verification_status', type: 'enum', enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
