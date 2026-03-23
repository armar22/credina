import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('portfolio')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getPortfolioSummary(@Query('branch_id') branchId?: string) {
    return this.reportsService.getPortfolioSummary(branchId);
  }

  @Get('officer-performance')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getOfficerPerformance(@Query('branch_id') branchId?: string) {
    return this.reportsService.getOfficerPerformance(branchId);
  }

  @Get('collections')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getCollectionReport(
    @Query('branch_id') branchId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.reportsService.getCollectionReport(branchId, startDate, endDate);
  }

  @Get('reconciliation')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getReconciliationReport(
    @Query('branch_id') branchId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.reportsService.getReconciliationReport(branchId, startDate, endDate);
  }

  @Get('regional')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getRegionalReport() {
    return this.reportsService.getRegionalReport();
  }

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async exportReport(@Body() body: { reportType: string; format: string; branch_id?: string; start_date?: string; end_date?: string }) {
    return this.reportsService.exportReport(
      body.reportType,
      body.format,
      body.branch_id,
      body.start_date,
      body.end_date,
    );
  }
}
