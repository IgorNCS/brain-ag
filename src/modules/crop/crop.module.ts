import { Module } from '@nestjs/common';
import { CropService } from './crop.service';
import { CropController } from './crop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './entities/crop.entity';
import { UserModule } from '../user/user.module';
import { HarvestModule } from '../harvest/harvest.module';

@Module({
  imports: [TypeOrmModule.forFeature([Crop]), HarvestModule,UserModule],
  controllers: [CropController],
  providers: [CropService],
})
export class CropModule {}
