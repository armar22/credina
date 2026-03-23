import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { Member } from '../members/entities/member.entity';
import { LoanApplicationHelpersService } from './services/loan-application-helpers.service';
import { LoanApplicationsController } from './controllers/loan-applications.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoanApplication, Member]), AuditLogsModule],
  providers: [LoanApplicationHelpersService],
  controllers: [LoanApplicationsController],
  exports: [LoanApplicationHelpersService],
})
export class LoanApplicationsModule {}
