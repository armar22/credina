import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
}

@Entity('member_devices')
export class MemberDevice {
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ name: 'device_token', length: 500 })
  deviceToken: string;

  @Column({ name: 'device_type', type: 'enum', enum: DeviceType })
  deviceType: DeviceType;

  @Column({ name: 'app_version', length: 20, nullable: true })
  appVersion: string;

  @Column({ name: 'last_active', type: 'timestamp' })
  lastActive: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
