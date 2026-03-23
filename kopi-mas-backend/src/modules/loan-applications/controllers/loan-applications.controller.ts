import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LoanApplicationHelpersService } from '../services/loan-application-helpers.service';
import { CreateLoanApplicationDto, UpdateLoanApplicationStatusDto } from '../dto/loan-application.dto';
import { LoanProductType, InterestRateType, IncomeSource, ApplicationStatus } from '../entities/loan-application.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/loan-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanApplicationsController {
  constructor(private loanAppService: LoanApplicationHelpersService) {}

  @Post()
  @Roles(UserRole.OFFICER)
  async create(@Body() createDto: CreateLoanApplicationDto, @Req() req: any) {
    const user = req.user;
    const appData = {
      ...createDto,
      loanProductType: createDto.loanProductType as LoanProductType,
      interestRateType: createDto.interestRateType as InterestRateType,
      incomeSource: createDto.incomeSource as IncomeSource,
    };
    return this.loanAppService.create(appData, user?.user_id, user?.email);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('branch_id') branchId?: string,
    @Query('agent_id') agentId?: string,
    @Query('member_id') memberId?: string,
    @Query('search') search?: string,
  ) {
    const statusArray = status && status !== 'all' ? status.split(',') : undefined;
    return this.loanAppService.findAllWithRelations({ status: statusArray, page, limit, search, branchId, agentId, memberId });
  }

  @Get(':application_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findOne(@Param('application_id') applicationId: string) {
    return this.loanAppService.findByIdWithRelations(applicationId);
  }

  @Patch(':application_id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('application_id') applicationId: string,
    @Body() updateDto: UpdateLoanApplicationStatusDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.loanAppService.updateStatus(
      applicationId, 
      updateDto.status as ApplicationStatus, 
      updateDto.reviewedBy,
      user?.user_id,
      user?.email,
    );
  }
}
