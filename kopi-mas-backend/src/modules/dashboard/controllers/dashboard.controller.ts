import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { DashboardService } from '../services/dashboard.service';

@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats(@Query('branch_id') branchId?: string) {
    return this.dashboardService.getStats(branchId);
  }

  @Get('daily')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getDailyStats(@Query('date') date?: string) {
    return this.dashboardService.getDailyStats(date);
  }

  @Get('trend')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getTrendStats(@Query('period') period: string = 'week') {
    return this.dashboardService.getTrendStats(period);
  }
}
