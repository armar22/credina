import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CollectionsService } from '../services/collections.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('member_id') memberId?: string,
  ) {
    const statusArray = status && status !== 'all' ? status.split(',') : undefined;
    return this.collectionsService.findAllWithRelations({ 
      status: statusArray, 
      page, 
      limit,
      memberId 
    });
  }

  @Get('stats')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats() {
    return this.collectionsService.getStats();
  }

  @Get('overdue')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async getOverdue() {
    return this.collectionsService.findOverdue();
  }

  @Get('history')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getPaymentHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('member_id') memberId?: string,
  ) {
    return this.collectionsService.findPaymentHistory({ page, limit, memberId });
  }

  @Get('payment-stats')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getPaymentStats() {
    return this.collectionsService.getPaymentStats();
  }

  @Patch(':collection_id/pay')
  @Roles(UserRole.OFFICER)
  async recordPayment(
    @Param('collection_id') collectionId: string,
    @Body() body: { paidAmount: number; officerId?: string },
    @Req() req: any,
  ) {
    const user = req.user;
    return this.collectionsService.recordPayment(
      collectionId, 
      body.paidAmount,
      body.officerId,
      user?.user_id,
      user?.email,
    );
  }
}
