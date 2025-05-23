import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CropService } from './crop.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CropStatus } from './enums/crop-status.enum';
import { PaginationBodyDTO, PaginationQueryDTO } from '@/src/common/utils/dtos/findAllRequest';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import { Crop } from './entities/crop.entity';

@Controller('crop')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Post(':harvestId')
  create(@Param('harvestId') harvestId: string,@Body() createCropDto: CreateCropDto) {
    return this.cropService.create(harvestId,createCropDto);
  }

  @Get()
  async findAll(
    @Body() paginacaoBody: PaginationBodyDTO<Crop>,
    @Query() paginacaoQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Crop>> {
    return this.cropService.findAll(paginacaoBody, paginacaoQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cropService.findOne(id);
  }

  @Patch(':id/status/:status')
  changeStatus(@Param('id') id: string, @Param('status') newStatus: CropStatus) {
    return this.cropService.changeStatus(id, newStatus);
  }

}
