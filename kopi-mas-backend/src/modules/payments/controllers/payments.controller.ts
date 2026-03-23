import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { PaymentStatus } from '../entities/payment.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createDto: CreatePaymentDto, @Req() req: any) {
    const user = req.user;
    return this.paymentsService.create(createDto, user?.user_id, user?.email);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('member_id') memberId?: string,
    @Query('application_id') applicationId?: string,
  ) {
    return this.paymentsService.findAllWithRelations({
      status,
      page,
      limit,
      memberId,
      applicationId,
    });
  }

  @Get('stats')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats() {
    return this.paymentsService.getStats();
  }

  @Get('member/:member_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findByMember(@Param('member_id') memberId: string) {
    const payments = await this.paymentsService.findByMember(memberId);
    return { data: payments, total: payments.length };
  }

  @Get('application/:application_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findByApplication(@Param('application_id') applicationId: string) {
    const payments = await this.paymentsService.findByApplication(applicationId);
    return { data: payments, total: payments.length };
  }

  @Get(':payment_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('payment_id') paymentId: string) {
    return this.paymentsService.findOneWithRelations(paymentId);
  }

  @Patch(':payment_id/status')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async updateStatus(
    @Param('payment_id') paymentId: string,
    @Body() updateDto: UpdatePaymentDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.paymentsService.updateStatus(
      paymentId,
      updateDto.paymentStatus as PaymentStatus,
      user?.user_id,
      user?.email,
    );
  }
}
