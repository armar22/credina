import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(@Query('region_id') regionId?: string) {
    const where = regionId ? { regionId } : {};
    return this.branchRepository.find({ where, order: { branchName: 'ASC' } });
  }

  @Get(':branch_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findOne(@Param('branch_id') branchId: string) {
    return this.branchRepository.findOne({ where: { branch_id: branchId } });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createDto: Partial<Branch>) {
    const data = {
      ...createDto,
      regionId: createDto.regionId || undefined,
    };
    const branch = this.branchRepository.create(data);
    return this.branchRepository.save(branch);
  }

  @Patch(':branch_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(@Param('branch_id') branchId: string, @Body() updateDto: Partial<Branch>) {
    const data = {
      ...updateDto,
      regionId: updateDto.regionId || undefined,
    };
    await this.branchRepository.update(branchId, data);
    return this.branchRepository.findOne({ where: { branch_id: branchId } });
  }

  @Delete(':branch_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async remove(@Param('branch_id') branchId: string) {
    await this.branchRepository.delete(branchId);
    return { message: 'Branch deleted successfully', success: true };
  }
}
