import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InstallmentsService } from '../services/installments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/installments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstallmentsController {
  constructor(private installmentsService: InstallmentsService) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('member_id') memberId?: string,
    @Query('application_id') applicationId?: string,
  ) {
    return this.installmentsService.findAllWithRelations({
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
    return this.installmentsService.getStats();
  }

  @Get('overdue')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async getOverdue() {
    return this.installmentsService.findOverdue();
  }

  @Get('application/:application_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getByApplication(@Param('application_id') applicationId: string) {
    return this.installmentsService.findByApplicationWithRelations(applicationId);
  }

  @Get('member/:member_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getByMember(@Param('member_id') memberId: string) {
    return this.installmentsService.findByMemberWithRelations(memberId);
  }

  @Get(':installment_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('installment_id') installmentId: string) {
    return this.installmentsService.findOneWithRelations(installmentId);
  }

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async generateInstallments(
    @Body()
    body: {
      applicationId: string;
      memberId: string;
      disbursementId: string;
      installments: Array<{
        installmentNumber: number;
        principalAmount: number;
        interestAmount: number;
        totalAmount: number;
        dueDate: Date;
      }>;
    },
  ) {
    return this.installmentsService.createInstallments(body);
  }

  @Patch(':installment_id/pay')
  @Roles(UserRole.OFFICER)
  async recordPayment(
    @Param('installment_id') installmentId: string,
    @Body()
    body: {
      paidAmount: number;
      officerId?: string;
      paymentMethod?: string;
      transactionReference?: string;
    },
  ) {
    return this.installmentsService.recordPayment(
      installmentId,
      body.paidAmount,
      body.officerId,
      body.paymentMethod,
      body.transactionReference,
    );
  }
}
