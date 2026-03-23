import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanProductsController } from './controllers/loan-products.controller';
import { LoanProductsService } from './services/loan-product.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoanProduct]), AuditLogsModule],
  controllers: [LoanProductsController],
  providers: [LoanProductsService],
  exports: [LoanProductsService],
})
export class LoanProductsModule {}
