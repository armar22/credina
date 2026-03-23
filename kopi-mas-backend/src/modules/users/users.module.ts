import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserHelpersService } from './services/user-helpers.service';
import { UsersController } from './controllers/users.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuditLogsModule],
  providers: [UserHelpersService],
  controllers: [UsersController],
  exports: [UserHelpersService],
})
export class UsersModule {}
