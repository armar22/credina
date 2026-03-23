import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(filters: AuditLogFilters): Promise<{ data: AuditLog[]; total: number }> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action as AuditAction;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      take: filters.limit || 20,
    });

    return { data, total };
  }

  async findOne(logId: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findOne({ where: { log_id: logId } });
  }

  async create(createDto: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(createDto);
    return this.auditLogRepository.save(log);
  }

  async getStats(): Promise<AuditStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, allLogs] = await Promise.all([
      this.auditLogRepository.count(),
      this.auditLogRepository.count({ where: { createdAt: MoreThanOrEqual(today) } }),
      this.auditLogRepository.find(),
    ]);

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};

    allLogs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      if (log.entityType) {
        byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      }
    });

    return { totalLogs, todayLogs, byAction, byEntityType };
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
