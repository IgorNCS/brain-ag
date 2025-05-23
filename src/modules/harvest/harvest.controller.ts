import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HarvestService } from './harvest.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { HarvestStatus } from './enums/harvest-status.enum';
import { UpdateStatusHarvestDto } from './dto/update-harvest-status.dto';
import { Harvest } from './entities/harvest.entity';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import {
  PaginationBodyDTO,
  PaginationQueryDTO,
} from '@/src/common/utils/dtos/findAllRequest';

@Controller('harvest')
export class HarvestController {
  constructor(private readonly harvestService: HarvestService) {}

  @Post(':farmId')
  create(@Param('farmId') farmId: string) {
    return this.harvestService.create(farmId);
  }

  @Get()
  async findAll(
    @Body() paginacaoBody: PaginationBodyDTO<Harvest>,
    @Query() paginacaoQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Harvest>> {
    return this.harvestService.findAll(paginacaoBody, paginacaoQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.harvestService.findOne(id);
  }

  @Patch(':id/status/:status')
  changeStatus(
    @Param('id') id: string,
    @Param('status') newStatus: HarvestStatus,
    @Body() updateHarvest: UpdateStatusHarvestDto,
  ) {
    return this.harvestService.changeStatus(id, newStatus, updateHarvest);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHarvestDto: UpdateHarvestDto) {
    return this.harvestService.update(id, updateHarvestDto);
  }
}
