import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member_app_credentials')
export class MemberAppCredential {
  @PrimaryGeneratedColumn('uuid')
  credential_id: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column({ name: 'pin_hash', length: 255 })
  pinHash: string;

  @Column({ name: 'pin_attempts', type: 'int', default: 0 })
  pinAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'otp_code', length: 6, nullable: true })
  otpCode: string;

  @Column({ name: 'otp_expires_at', type: 'timestamp', nullable: true })
  otpExpiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
