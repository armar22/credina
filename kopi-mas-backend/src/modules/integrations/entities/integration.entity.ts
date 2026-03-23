import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IntegrationType {
  PAYMENT_GATEWAY = 'payment_gateway',
  SMS_GATEWAY = 'sms_gateway',
  EMAIL_SERVICE = 'email_service',
  CREDIT_BUREAU = 'credit_bureau',
  E_KYC = 'e_kyc',
  BANKING_API = 'banking_api',
  WHATSAPP = 'whatsapp',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
  ERROR = 'error',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  integration_id: string;

  @Column({ name: 'integration_name', length: 100 })
  integrationName: string;

  @Column({ name: 'integration_type', type: 'enum', enum: IntegrationType })
  integrationType: IntegrationType;

  @Column({ length: 255 })
  provider: string;

  @Column({ name: 'api_key', length: 500, nullable: true })
  apiKey: string;

  @Column({ name: 'api_secret', length: 500, nullable: true })
  apiSecret: string;

  @Column({ name: 'webhook_url', length: 500, nullable: true })
  webhookUrl: string;

  @Column({ name: 'callback_url', length: 500, nullable: true })
  callbackUrl: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'integration_status', type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.INACTIVE })
  integrationStatus: IntegrationStatus;

  @Column({ name: 'environment', default: 'sandbox' })
  environment: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
