import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('approval_workflows')
export class ApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  workflow_id: string;

  @Column({ name: 'workflow_name', length: 255 })
  workflowName: string;

  @Column({ name: 'approval_levels', type: 'jsonb' })
  approvalLevels: Record<string, any>[];

  @Column({ name: 'amount_thresholds', type: 'jsonb', nullable: true })
  amountThresholds: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
