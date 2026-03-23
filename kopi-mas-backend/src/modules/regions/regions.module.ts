import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Branch } from '../branches/entities/branch.entity';
import { RegionsController } from './controllers/regions.controller';
import { RegionsService } from './services/region.service';

@Module({
  imports: [TypeOrmModule.forFeature([Region, Branch])],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}
