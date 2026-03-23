import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanInstallment } from './entities/installment.entity';
import { InstallmentsService } from './services/installments.service';
import { InstallmentsController } from './controllers/installments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LoanInstallment])],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
