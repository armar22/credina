import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from '../services/audit-logs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AuditLogQueryDto } from '../dto/audit-log.dto';

@Controller('api/v1/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogsService.findAll({
      userId: query.user_id,
      action: query.action,
      entityType: query.entity_type,
      entityId: query.entity_id,
      startDate: query.start_date ? new Date(query.start_date) : undefined,
      endDate: query.end_date ? new Date(query.end_date) : undefined,
      page: query.page || 1,
      limit: query.limit || 20,
    });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats() {
    return this.auditLogsService.getStats();
  }

  @Get(':log_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('log_id') logId: string) {
    return this.auditLogsService.findOne(logId);
  }

  @Get('user/:user_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findByUser(
    @Param('user_id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogsService.findByUser(userId, limit);
  }

  @Get('entity/:entity_type/:entity_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findByEntity(
    @Param('entity_type') entityType: string,
    @Param('entity_id') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }
}
