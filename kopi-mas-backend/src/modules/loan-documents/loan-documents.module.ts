import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanDocument } from './entities/loan-document.entity';
import { LoanDocumentsController, ApplicationDocumentsController } from './controllers/loan-documents.controller';
import { LoanDocumentsService } from './services/loan-document.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoanDocument])],
  controllers: [LoanDocumentsController, ApplicationDocumentsController],
  providers: [LoanDocumentsService],
  exports: [LoanDocumentsService],
})
export class LoanDocumentsModule {}
