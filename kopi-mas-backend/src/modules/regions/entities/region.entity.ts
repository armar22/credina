import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Relation } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  region_id: string;

  @Column({ name: 'region_code', unique: true, length: 20 })
  regionCode: string;

  @Column({ name: 'region_name', length: 255 })
  regionName: string;

  @Column({ name: 'head_user_id', type: 'uuid', nullable: true })
  headUserId: string;

  @OneToMany(() => Branch, branch => branch.region)
  branches: Relation<Branch>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
