import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RiskCategory {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AIRecommendation {
  APPROVE = 'approve',
  REJECT = 'reject',
  REVIEW = 'review',
}

@Entity('credit_scores')
export class CreditScore {
  @PrimaryGeneratedColumn('uuid')
  score_id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'credit_score', type: 'int' })
  creditScore: number;

  @Column({ name: 'risk_category', type: 'enum', enum: RiskCategory })
  riskCategory: RiskCategory;

  @Column({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2 })
  confidenceLevel: number;

  @Column({ name: 'model_version', length: 50 })
  modelVersion: string;

  @Column({ type: 'jsonb', nullable: true })
  factors: Record<string, any>;

  @Column({ name: 'data_sources', type: 'jsonb', nullable: true })
  dataSources: Record<string, any>;

  @Column({ name: 'ai_recommendation', type: 'enum', enum: AIRecommendation })
  aiRecommendation: AIRecommendation;

  @Column({ name: 'calculated_at', type: 'timestamp' })
  calculatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
