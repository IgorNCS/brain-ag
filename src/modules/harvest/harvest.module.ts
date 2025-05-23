import { Module } from '@nestjs/common';
import { HarvestService } from './harvest.service';
import { HarvestController } from './harvest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmService } from '../farm/farm.service';
import { Harvest } from './entities/harvest.entity';
import { FarmModule } from '../farm/farm.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest]), FarmModule,UserModule],
  controllers: [HarvestController],
  providers: [HarvestService],
  exports: [HarvestService],
})
export class HarvestModule {}
