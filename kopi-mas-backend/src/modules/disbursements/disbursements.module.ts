import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanDisbursement } from './entities/disbursement.entity';
import { DisbursementsController } from './controllers/disbursements.controller';
import { DisbursementsService } from './services/disbursements.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoanDisbursement]), AuditLogsModule],
  controllers: [DisbursementsController],
  providers: [DisbursementsService],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
