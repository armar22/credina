import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualAccount } from './entities/virtual-account.entity';
import { VirtualAccountsController } from './controllers/virtual-accounts.controller';
import { VirtualAccountsService } from './services/virtual-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([VirtualAccount])],
  controllers: [VirtualAccountsController],
  providers: [VirtualAccountsService],
  exports: [VirtualAccountsService],
})
export class VirtualAccountsModule {}
