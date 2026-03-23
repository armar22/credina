import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { AgentsService } from '../services/agents.service';
import { 
  CreateAgentDto, 
  UpdateAgentDto, 
  AgentQueryDto,
  PettyCashDto,
  DisburseToMemberDto,
  DepositToAdminDto
} from '../dto/agent.dto';

@Controller('api/v1/agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('branch_id') branch_id?: string,
    @Query('region_id') region_id?: string,
  ) {
    return this.agentsService.findAll({ 
      page: page ? parseInt(page, 10) : 1, 
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
      branch_id,
      region_id,
    });
  }

  @Get('wallets')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getAllAgentWallets(
    @Query('branch_id') branchId?: string,
    @Query('region_id') regionId?: string,
  ) {
    return this.agentsService.getAllAgentWallets(branchId, regionId);
  }

  @Get(':id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Get(':id/wallet')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getAgentWallet(@Param('id') id: string) {
    return this.agentsService.getAgentWallet(id);
  }

  @Get(':id/transactions')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getAgentTransactions(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.agentsService.getAgentTransactions(id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }

  @Post(':id/petty-cash')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async releasePettyCash(
    @Param('id') id: string,
    @Body() pettyCashDto: PettyCashDto,
    @Query('processed_by') processedBy?: string,
  ) {
    return this.agentsService.releasePettyCash(
      id, 
      Number(pettyCashDto.amount), 
      pettyCashDto.description,
      processedBy
    );
  }

  @Post(':id/collection')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async receiveFromCollection(
    @Param('id') id: string,
    @Body() body: { amount: number; collectionId: string; description?: string },
  ) {
    return this.agentsService.receiveFromCollection(
      id,
      body.amount,
      body.collectionId,
      body.description
    );
  }

  @Post(':id/disburse')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async disburseToMember(
    @Param('id') id: string,
    @Body() disburseDto: DisburseToMemberDto,
  ) {
    return this.agentsService.disburseToMember(
      id,
      disburseDto.applicationId,
      disburseDto.amount,
      disburseDto.notes
    );
  }

  @Post(':id/deposit')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async depositToAdmin(
    @Param('id') id: string,
    @Body() depositDto: DepositToAdminDto,
    @Query('processed_by') processedBy?: string,
  ) {
    return this.agentsService.depositToAdmin(
      id,
      depositDto.amount,
      depositDto.notes,
      processedBy
    );
  }

  @Post(':id/check-self-approval')
  async checkSelfApproval(
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.agentsService.checkSelfApprovalLimit(id, body.amount);
  }
}
