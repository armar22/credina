import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldVerification, VerificationStatus } from '../entities/field-verification.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('api/v1/field-verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FieldVerificationsController {
  constructor(
    @InjectRepository(FieldVerification)
    private verificationRepository: Repository<FieldVerification>,
  ) {}

  @Post()
  @Roles(UserRole.OFFICER)
  async create(@Body() createDto: any) {
    const verification = this.verificationRepository.create({
      ...createDto,
      verificationStatus: (createDto.verificationStatus || 'pending') as VerificationStatus,
      verificationDate: new Date(),
    });
    return this.verificationRepository.save(verification);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(@Query('application_id') applicationId?: string) {
    const where = applicationId ? { applicationId } : {};
    return this.verificationRepository.find({ where });
  }

  @Get('stats/summary')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getStats() {
    const [total, pending, passed, failed] = await Promise.all([
      this.verificationRepository.count(),
      this.verificationRepository.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.verificationRepository.count({ where: { verificationStatus: VerificationStatus.PASSED } }),
      this.verificationRepository.count({ where: { verificationStatus: VerificationStatus.FAILED } }),
    ]);
    return { total, pending, passed, failed };
  }

  @Get(':verification_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN)
  async findOne(@Param('verification_id') verificationId: string) {
    return this.verificationRepository.findOne({ where: { verification_id: verificationId } });
  }

  @Patch(':verification_id')
  @Roles(UserRole.OFFICER)
  async update(@Param('verification_id') verificationId: string, @Body() updateDto: any) {
    if (updateDto.verificationStatus) {
      updateDto.verificationStatus = updateDto.verificationStatus as VerificationStatus;
    }
    await this.verificationRepository.update(verificationId, updateDto);
    return this.verificationRepository.findOne({ where: { verification_id: verificationId } });
  }
}
