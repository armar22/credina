import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from 'typeorm';
import { Region } from '../../regions/entities/region.entity';
import { LoanApplication } from '../../loan-applications/entities/loan-application.entity';
import { Member } from '../../members/entities/member.entity';
import { Agent } from '../../agents/entities/agent.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  branch_id: string;

  @Column({ name: 'branch_code', unique: true, length: 20 })
  branchCode: string;

  @Column({ name: 'branch_name', length: 255 })
  branchName: string;

  @Column({ name: 'region_id', type: 'uuid', nullable: true })
  regionId: string;

  @ManyToOne(() => Region, region => region.branches, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Relation<Region>;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  province: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => LoanApplication, application => application.branch)
  loanApplications: Relation<LoanApplication>[];

  @OneToMany(() => Member, member => member.branch)
  members: Relation<Member[]>;

  @OneToMany(() => Agent, agent => agent.branch)
  agents: Relation<Agent[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
