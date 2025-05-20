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
import { FarmService } from './farm.service';
import { CreateFarmDTO } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Farm } from './entities/farm.entity';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import {
  PaginationBodyDTO,
  PaginationQueryDTO,
} from '@/src/common/utils/dtos/findAllRequest';

@Controller('farm')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  create(@Body() createFarm: CreateFarmDTO) {
    return this.farmService.create(createFarm);
  }

  @Get()
  async findAll(
    @Body() paginacaoBody: PaginationBodyDTO,
    @Query() paginacaoQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Farm>> {
    return this.farmService.findAll(paginacaoBody, paginacaoQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmService.update(id, updateFarmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmService.remove(id);
  }
}
