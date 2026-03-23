import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/regions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegionsController {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll() {
    return this.regionRepository.find({ order: { regionName: 'ASC' } });
  }

  @Get(':region_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findOne(@Param('region_id') regionId: string) {
    return this.regionRepository.findOne({ where: { region_id: regionId } });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createDto: Partial<Region>) {
    const region = this.regionRepository.create(createDto);
    return this.regionRepository.save(region);
  }

  @Patch(':region_id')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(@Param('region_id') regionId: string, @Body() updateDto: Partial<Region>) {
    await this.regionRepository.update(regionId, updateDto);
    return this.regionRepository.findOne({ where: { region_id: regionId } });
  }

  @Delete(':region_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async remove(@Param('region_id') regionId: string) {
    await this.regionRepository.delete(regionId);
    return { message: 'Region deleted successfully', success: true };
  }
}
