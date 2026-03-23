import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { LoanApplication } from '../loan-applications/entities/loan-application.entity';
import { LoanDisbursement } from '../disbursements/entities/disbursement.entity';
import { LoanCollection } from '../collections/entities/collection.entity';
import { LoanInstallment } from '../installments/entities/installment.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Region } from '../regions/entities/region.entity';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Member, 
    LoanApplication, 
    LoanDisbursement,
    LoanCollection,
    LoanInstallment,
    Branch,
    Region,
  ])],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
