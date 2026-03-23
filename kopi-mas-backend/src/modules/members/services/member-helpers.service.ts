import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Member, MemberStatus, KtpVerificationStatus } from '../entities/member.entity';
import { MemberApproval, MemberApprovalStatus } from '../entities/member-approval.entity';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AuditAction } from '../../audit-logs/entities/audit-log.entity';

@Injectable()
export class MemberHelpersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberApproval)
    private memberApprovalRepository: Repository<MemberApproval>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findById(memberId: string): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { member_id: memberId } });
  }

  async findByNik(nik: string): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { nik } });
  }

  async findByPhone(phone: string): Promise<Member | null> {
    return this.memberRepository.findOne({ where: { phone } });
  }

  async findAll(filters?: { status?: string; city?: string; page?: number; limit?: number }): Promise<{ data: Member[]; total: number }> {
    const where: FindOptionsWhere<Member> = {};
    if (filters?.status) where.status = filters.status as any;
    if (filters?.city) where.city = Like(`%${filters.city}%`);

    const [data, total] = await this.memberRepository.findAndCount({
      where,
      skip: ((filters?.page || 1) - 1) * (filters?.limit || 10),
      take: filters?.limit || 10,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async create(data: Partial<Member>, userId?: string, userEmail?: string): Promise<Member> {
    const member = this.memberRepository.create({
      ...data,
      registrationDate: new Date(),
      status: MemberStatus.UNDER_REVIEW,
    });
    const savedMember = await this.memberRepository.save(member);

    // Create approval request
    const approval = this.memberApprovalRepository.create({
      memberId: savedMember.member_id,
      requestedBy: userId,
      status: MemberApprovalStatus.PENDING,
      notes: 'New member registration pending approval',
    });
    await this.memberApprovalRepository.save(approval);
    
    await this.auditLogsService.create({
      action: AuditAction.CREATE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: savedMember.member_id,
      newValues: { name: savedMember.name, nik: savedMember.nik, phone: savedMember.phone },
      description: `Created member: ${savedMember.name} (${savedMember.nik}) - pending approval`,
    });
    
    return savedMember;
  }

  async update(memberId: string, data: Partial<Member>, userId?: string, userEmail?: string): Promise<Member> {
    const oldMember = await this.findById(memberId);
    await this.memberRepository.update(memberId, data);
    const updatedMember = await this.findById(memberId);
    
    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: memberId,
      oldValues: { name: oldMember?.name, status: oldMember?.status },
      newValues: { name: updatedMember?.name, status: updatedMember?.status },
      description: `Updated member: ${updatedMember?.name} (${updatedMember?.nik})`,
    });
    
    return updatedMember;
  }

  async delete(memberId: string, userId?: string, userEmail?: string): Promise<void> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    if (member.status !== MemberStatus.INACTIVE) {
      throw new BadRequestException('Only INACTIVE members can be deleted');
    }
    await this.memberApprovalRepository.delete({ memberId });
    await this.memberRepository.delete(memberId);
    
    await this.auditLogsService.create({
      action: AuditAction.DELETE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: memberId,
      oldValues: { name: member?.name, nik: member?.nik },
      description: `Deleted member: ${member?.name} (${member?.nik})`,
    });
  }

  async updateStatus(memberId: string, status: string, userId?: string, userEmail?: string): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const oldStatus = member.status;
    let newStatus: MemberStatus;

    switch (status) {
      case 'active':
        newStatus = MemberStatus.ACTIVE;
        break;
      case 'inactive':
        newStatus = MemberStatus.INACTIVE;
        break;
      case 'suspended':
        newStatus = MemberStatus.SUSPENDED;
        break;
      case 'under_review':
        newStatus = MemberStatus.UNDER_REVIEW;
        break;
      default:
        throw new BadRequestException('Invalid status');
    }

    await this.memberRepository.update(memberId, { status: newStatus });
    const updatedMember = await this.findById(memberId);

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: memberId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      description: `Changed member status: ${member.name} from ${oldStatus} to ${newStatus}`,
    });

    return updatedMember;
  }

  async approveMember(memberId: string, userId?: string, userEmail?: string, notes?: string): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const oldStatus = member.status;
    
    // Update member status to active
    await this.memberRepository.update(memberId, { status: MemberStatus.ACTIVE });
    const updatedMember = await this.findById(memberId);

    // Update approval record
    await this.memberApprovalRepository.update(
      { memberId, status: MemberApprovalStatus.PENDING },
      { status: MemberApprovalStatus.APPROVED, approvedBy: userId, approvedAt: new Date(), notes }
    );

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: memberId,
      oldValues: { status: oldStatus },
      newValues: { status: MemberStatus.ACTIVE },
      description: `Approved member registration: ${member.name}`,
    });

    return updatedMember;
  }

  async rejectMember(memberId: string, userId?: string, userEmail?: string, notes?: string): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const oldStatus = member.status;
    
    // Update member status to inactive
    await this.memberRepository.update(memberId, { status: MemberStatus.INACTIVE });
    const updatedMember = await this.findById(memberId);

    // Update approval record
    await this.memberApprovalRepository.update(
      { memberId, status: MemberApprovalStatus.PENDING },
      { status: MemberApprovalStatus.REJECTED, approvedBy: userId, approvedAt: new Date(), notes }
    );

    await this.auditLogsService.create({
      action: AuditAction.UPDATE,
      userId,
      userEmail,
      entityType: 'Member',
      entityId: memberId,
      oldValues: { status: oldStatus },
      newValues: { status: MemberStatus.INACTIVE },
      description: `Rejected member registration: ${member.name}`,
    });

    return updatedMember;
  }

  async getPendingApprovals(): Promise<MemberApproval[]> {
    return this.memberApprovalRepository.find({
      where: { status: MemberApprovalStatus.PENDING },
      relations: ['member'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOcrData(memberId: string, ocrData: {
    ocrNik?: string;
    ocrName?: string;
    ocrDob?: Date;
    ocrGender?: string;
    ocrAddress?: string;
    ocrConfidence?: number;
    ktpVerificationStatus?: KtpVerificationStatus;
  }): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.memberRepository.update(memberId, ocrData);
    return this.findById(memberId);
  }

  async verifyKtp(memberId: string, status: string, notes?: string, userId?: string): Promise<Member> {
    const member = await this.findById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    let ktpStatus: KtpVerificationStatus;
    switch (status) {
      case 'match':
        ktpStatus = KtpVerificationStatus.MATCH;
        break;
      case 'manual_verification':
        ktpStatus = KtpVerificationStatus.MANUAL_VERIFICATION;
        break;
      case 'low_result':
        ktpStatus = KtpVerificationStatus.LOW_RESULT;
        break;
      default:
        throw new BadRequestException('Invalid verification status');
    }

    await this.memberRepository.update(memberId, {
      ktpVerificationStatus: ktpStatus,
      ktpVerificationNotes: notes,
      verifiedBy: userId,
      verifiedAt: new Date(),
    });

    return this.findById(memberId);
  }
}
