import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DocumentType {
  KTP = 'ktp',
  INCOME_PROOF = 'income_proof',
  COLLATERAL = 'collateral',
  OTHER = 'other',
}

@Entity('loan_documents')
export class LoanDocument {
  @PrimaryGeneratedColumn('uuid')
  document_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'capture_timestamp', type: 'timestamp' })
  captureTimestamp: Date;

  @Column({ name: 'uploaded_by_officer_id', type: 'uuid' })
  uploadedByOfficerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
