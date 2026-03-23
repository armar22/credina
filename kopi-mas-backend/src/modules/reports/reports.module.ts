import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { LoanApplication } from '../loan-applications/entities/loan-application.entity';
import { LoanDisbursement } from '../disbursements/entities/disbursement.entity';
import { LoanCollection } from '../collections/entities/collection.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Region } from '../regions/entities/region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanApplication,
      LoanDisbursement,
      LoanCollection,
      Payment,
      User,
      Branch,
      Region,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
