import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { IntegrationsService } from '../services/integrations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.integrationsService.findAll({ type, status });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats() {
    return this.integrationsService.getStats();
  }

  @Get(':integration_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('integration_id') integrationId: string) {
    return this.integrationsService.findOne(integrationId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createDto: any) {
    return this.integrationsService.create(createDto);
  }

  @Patch(':integration_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(
    @Param('integration_id') integrationId: string,
    @Body() updateDto: any,
  ) {
    return this.integrationsService.update(integrationId, updateDto);
  }

  @Delete(':integration_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async delete(@Param('integration_id') integrationId: string) {
    await this.integrationsService.delete(integrationId);
    return { message: 'Integration deleted successfully' };
  }

  @Post(':integration_id/test')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async testConnection(@Param('integration_id') integrationId: string) {
    return this.integrationsService.testConnection(integrationId);
  }

  @Patch(':integration_id/toggle')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async toggleActive(
    @Param('integration_id') integrationId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.integrationsService.toggleActive(integrationId, body.isActive);
  }
}
