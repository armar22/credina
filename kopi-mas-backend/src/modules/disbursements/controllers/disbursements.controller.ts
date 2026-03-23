import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DisbursementsService } from '../services/disbursements.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/disbursements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisbursementsController {
  constructor(private disbursementsService: DisbursementsService) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('member_id') memberId?: string,
    @Query('application_id') applicationId?: string,
  ) {
    const statusArray = status && status !== 'all' ? status.split(',') : undefined;
    return this.disbursementsService.findAllWithRelations({
      status: statusArray,
      page,
      limit,
      memberId,
      applicationId,
    });
  }

  @Get(':disbursement_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('disbursement_id') disbursementId: string) {
    return this.disbursementsService.findByIdWithRelations(disbursementId);
  }

  @Get(':disbursement_id/receipt')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getReceipt(@Param('disbursement_id') disbursementId: string) {
    return this.disbursementsService.findByIdWithRelations(disbursementId);
  }

  @Post(':disbursement_id/notify')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async sendNotification(@Param('disbursement_id') disbursementId: string) {
    return this.disbursementsService.sendNotification(disbursementId);
  }
}
