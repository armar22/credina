import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { MemberHelpersService } from '../services/member-helpers.service';
import { KtpOcrService } from '../services/ktp-ocr.service';
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto';
import { ProcessKtpOcrDto, VerifyKtpDto } from '../dto/ktp-ocr.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { KtpVerificationStatus } from '../entities/member.entity';

@Controller('api/v1/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(
    private memberService: MemberHelpersService,
    private ktpOcrService: KtpOcrService,
  ) {}

  @Post()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async create(@Body() createMemberDto: CreateMemberDto, @Req() req: any) {
    const user = req.user;
    const memberData = {
      ...createMemberDto,
      dob: new Date(createMemberDto.dob),
    };
    return this.memberService.create(memberData, user?.user_id, user?.email);
  }

  @Get()
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.memberService.findAll({ 
      page: page ? parseInt(page, 10) : 1, 
      limit: limit ? parseInt(limit, 10) : 10, 
      status, 
      city 
    });
  }

  @Get(':member_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async findOne(@Param('member_id') memberId: string) {
    const member = await this.memberService.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  }

  @Patch(':member_id')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async update(@Param('member_id') memberId: string, @Body() updateMemberDto: UpdateMemberDto, @Req() req: any) {
    const user = req.user;
    return this.memberService.update(memberId, updateMemberDto, user?.user_id, user?.email);
  }

  @Delete(':member_id')
  @Roles(UserRole.SYSTEM_ADMIN)
  async remove(@Param('member_id') memberId: string, @Req() req: any) {
    const user = req.user;
    return this.memberService.delete(memberId, user?.user_id, user?.email);
  }

  @Patch(':member_id/activate')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async activate(@Param('member_id') memberId: string, @Req() req: any) {
    const user = req.user;
    return this.memberService.updateStatus(memberId, 'active', user?.user_id, user?.email);
  }

  @Patch(':member_id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async deactivate(@Param('member_id') memberId: string, @Req() req: any) {
    const user = req.user;
    return this.memberService.updateStatus(memberId, 'inactive', user?.user_id, user?.email);
  }

  @Patch(':member_id/suspend')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async suspend(@Param('member_id') memberId: string, @Req() req: any) {
    const user = req.user;
    return this.memberService.updateStatus(memberId, 'suspended', user?.user_id, user?.email);
  }

  @Get('approvals/pending')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async getPendingApprovals() {
    return this.memberService.getPendingApprovals();
  }

  @Patch(':member_id/approve')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async approve(@Param('member_id') memberId: string, @Body() body: { notes?: string }, @Req() req: any) {
    const user = req.user;
    return this.memberService.approveMember(memberId, user?.user_id, user?.email, body.notes);
  }

  @Patch(':member_id/reject')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async reject(@Param('member_id') memberId: string, @Body() body: { notes?: string }, @Req() req: any) {
    const user = req.user;
    return this.memberService.rejectMember(memberId, user?.user_id, user?.email, body.notes);
  }

  @Post(':member_id/ocr')
  @Roles(UserRole.OFFICER, UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async processOcr(
    @Param('member_id') memberId: string,
    @Body() dto: ProcessKtpOcrDto,
  ) {
    const member = await this.memberService.findById(memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    const ocrResult = await this.ktpOcrService.processKtpImage(
      dto.ktpImageUrl,
      dto.submittedNik || member.nik,
      dto.submittedName || member.name,
      dto.submittedDob || member.dob?.toISOString(),
      dto.submittedGender || member.gender,
    );

    // Update member with OCR results
    const ocrDob = ocrResult.ocrDob ? new Date(ocrResult.ocrDob) : null;
    if (ocrDob && isNaN(ocrDob.getTime())) {
      throw new BadRequestException('Invalid date format in OCR result');
    }

    await this.memberService.updateOcrData(memberId, {
      ocrNik: ocrResult.ocrNik,
      ocrName: ocrResult.ocrName,
      ocrDob: ocrDob,
      ocrGender: ocrResult.ocrGender,
      ocrAddress: ocrResult.ocrAddress,
      ocrConfidence: ocrResult.ocrConfidence,
      ktpVerificationStatus: ocrResult.verificationStatus as any,
    });

    return {
      memberId,
      ...ocrResult,
    };
  }

  @Patch(':member_id/verify-ktp')
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN)
  async verifyKtp(
    @Param('member_id') memberId: string,
    @Body() dto: VerifyKtpDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.memberService.verifyKtp(memberId, dto.status, dto.notes, user?.user_id);
  }
}
