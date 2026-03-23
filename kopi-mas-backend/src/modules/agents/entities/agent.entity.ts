import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { AgentWalletTransaction } from './agent-wallet.entity';
import { Member } from '../../members/entities/member.entity';
import { Branch } from '../../branches/entities/branch.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  agent_id: string;

  @Column({ name: 'agent_code', length: 20, unique: true })
  agentCode: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ name: 'id_card_number', length: 30, nullable: true })
  idCardNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pettyCashBalance: number;

  @Column({ name: 'collection_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  collectionBalance: number;

  @Column({ type: 'enum', enum: AgentStatus, default: AgentStatus.ACTIVE })
  status: AgentStatus;

  @Column({ name: 'self_approval_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  selfApprovalLimit: number;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @OneToMany(() => AgentWalletTransaction, (transaction) => transaction.agent)
  walletTransactions: AgentWalletTransaction[];

  @OneToMany(() => Member, (member) => member.agent)
  members: Relation<Member[]>;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Relation<Branch>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
