import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberApproval } from './entities/member-approval.entity';
import { MemberHelpersService } from './services/member-helpers.service';
import { KtpOcrService } from './services/ktp-ocr.service';
import { MembersController } from './controllers/members.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberApproval]), AuditLogsModule],
  providers: [MemberHelpersService, KtpOcrService],
  controllers: [MembersController],
  exports: [MemberHelpersService, KtpOcrService],
})
export class MembersModule {}
