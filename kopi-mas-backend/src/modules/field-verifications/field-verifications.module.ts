import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldVerification } from './entities/field-verification.entity';
import { FieldVerificationsController } from './controllers/field-verifications.controller';
import { FieldVerificationService } from './services/field-verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldVerification])],
  controllers: [FieldVerificationsController],
  providers: [FieldVerificationService],
  exports: [FieldVerificationService],
})
export class FieldVerificationsModule {}
