import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ApprovalAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

@Entity('approval_history')
export class ApprovalHistory {
  @PrimaryGeneratedColumn('uuid')
  approval_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'approver_id', type: 'uuid' })
  approverId: string;

  @Column({ name: 'approval_level', type: 'int' })
  approvalLevel: number;

  @Column({ name: 'approval_action', type: 'enum', enum: ApprovalAction })
  approvalAction: ApprovalAction;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'approved_at', type: 'timestamp' })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
