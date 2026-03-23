import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';

@Injectable()
export class UserHelpersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { user_id: userId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(query: { page?: number; limit?: number; search?: string; role?: string; branch_id?: string; is_active?: boolean }): Promise<{ data: User[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.branch_id) where.branchId = query.branch_id;
    if (query.is_active !== undefined) where.isActive = query.is_active;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (query.search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    if (query.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    if (query.branch_id) {
      queryBuilder.andWhere('user.branchId = :branch_id', { branch_id: query.branch_id });
    }

    if (query.is_active !== undefined) {
      queryBuilder.andWhere('user.isActive = :is_active', { is_active: query.is_active });
    }

    const [data, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async create(data: Partial<User>, password: string, createdByUserId?: string, createdByEmail?: string): Promise<User> {
    const existingByUsername = await this.findByUsername(data.username);
    if (existingByUsername) {
      throw new BadRequestException('Username is already taken');
    }

    const existingByEmail = await this.findByEmail(data.email);
    if (existingByEmail) {
      throw new BadRequestException('Email is already registered');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      ...data,
      passwordHash: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    
    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      userId: createdByUserId,
      userEmail: createdByEmail,
      entityType: 'User',
      entityId: savedUser.user_id,
      newValues: { email: savedUser.email, role: savedUser.role, fullName: savedUser.fullName },
      description: `Created user: ${savedUser.email} (${savedUser.role})`,
    });
    
    return savedUser;
  }

  async update(userId: string, data: Partial<User>, updatedByUserId?: string, updatedByEmail?: string): Promise<User> {
    const existingUser = await this.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== existingUser.email) {
      const existingByEmail = await this.findByEmail(data.email);
      if (existingByEmail) {
        throw new BadRequestException('Email is already registered');
      }
    }

    if (data.username && data.username !== existingUser.username) {
      const existingByUsername = await this.findByUsername(data.username);
      if (existingByUsername) {
        throw new BadRequestException('Username is already taken');
      }
    }

    const oldValues = { email: existingUser.email, role: existingUser.role, fullName: existingUser.fullName };
    await this.userRepository.update(userId, data);
    const updatedUser = await this.findById(userId);
    
    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId: updatedByUserId,
      userEmail: updatedByEmail,
      entityType: 'User',
      entityId: userId,
      oldValues,
      newValues: { email: updatedUser?.email, role: updatedUser?.role, fullName: updatedUser?.fullName },
      description: `Updated user: ${updatedUser?.email}`,
    });
    
    return updatedUser;
  }

  async delete(userId: string, deletedByUserId?: string, deletedByEmail?: string): Promise<void> {
    const existingUser = await this.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(userId);
    
    await this.auditLogsService.create({
      action: AuditAction.DELETE,
      userId: deletedByUserId,
      userEmail: deletedByEmail,
      entityType: 'User',
      entityId: userId,
      oldValues: { email: existingUser.email, role: existingUser.role },
      description: `Deleted user: ${existingUser.email}`,
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
