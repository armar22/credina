import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VirtualAccountsService } from '../services/virtual-accounts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/virtual-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VirtualAccountsController {
  constructor(private vaService: VirtualAccountsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OFFICER)
  async findAll(@Query('member_id') memberId?: string) {
    return this.vaService.findAll({ memberId });
  }

  @Get(':va_id')
  @Roles(UserRole.ADMIN, UserRole.OFFICER)
  async findOne(@Param('va_id') vaId: string) {
    return this.vaService.findById(vaId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: any) {
    return this.vaService.create(createDto);
  }

  @Delete(':va_id')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('va_id') vaId: string) {
    return this.vaService.deactivate(vaId);
  }
}
