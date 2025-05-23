import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { HarvestService } from '../harvest/harvest.service';
import { Crop } from './entities/crop.entity';
import { Between, FindManyOptions, FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CropStatus } from './enums/crop-status.enum';
import { HarvestStatus } from '../harvest/enums/harvest-status.enum';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import { PaginationBodyDTO, PaginationQueryDTO } from '@/src/common/utils/dtos/findAllRequest';

@Injectable()
export class CropService {
  constructor(
    @InjectRepository(Crop)
    private modelRepository: Repository<Crop>,
    private readonly harvestService: HarvestService,
    private readonly userService: UserService,
  ) {}

  async create(harvestId: string, createCropDto: CreateCropDto): Promise<Crop> {
    return this.modelRepository.manager.transaction(async (manager) => {
      const harvest = await this.harvestService.findOne(harvestId);
      const hasEnoughArea = await this.harvestService.hasEnableArea(
        harvest,
        createCropDto.plantedArea,
      );

      if (!hasEnoughArea) {
        throw new BadRequestException('Not enough available area for planting');
      }
      const crop = new Crop();
      crop.harvest = harvest;
      crop.seed = createCropDto.seed;
      crop.monthPlanted = createCropDto.monthPlanted;
      crop.yearPlanted = createCropDto.yearPlanted;
      crop.plantedArea = createCropDto.plantedArea;

      harvest.enabledArea -= createCropDto.plantedArea;
      harvest.plantedArea += createCropDto.plantedArea;
      harvest.status = HarvestStatus.PLANTED;
      await this.harvestService.update(harvestId, harvest);

      return manager.save(crop);
    });
  }

  async findAll(
    paginationBody: PaginationBodyDTO<Crop>,
    paginationQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Crop>> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Crop> = {};
      const relations: FindOptionsRelations<Crop> = {};

      if (paginationBody.relations && paginationBody.relations.length > 0) {
        paginationBody.relations.forEach((relation) => {
          relations[relation] = true;
        });
      }

      if (user.role !== Role.ADMIN) {
        where.harvest = { farm: { user: { id: user.id } } };
      } else if (paginationBody.userId) {
        where.harvest = { farm: { user: { id: In(paginationBody.userId) } } };
      }

      if (paginationBody.startDate && paginationBody.endDate) {
        where.createdAt = Between(
          new Date(new Date(paginationBody.startDate).setHours(0, 0, 0, 0)),
          new Date(new Date(paginationBody.endDate).setHours(23, 59, 59, 999)),
        );
      }

      const filters = Object.keys(paginationBody).filter(
        (key) => !['startDate', 'endDate', 'relations', 'userId'].includes(key),
      );

      filters.forEach((filter) => {
        if (
          paginationBody[filter] !== undefined &&
          paginationBody[filter] !== null
        ) {
          where[filter] = paginationBody[filter];
        }
      });

      if (paginationBody.entityFilters) {
        Object.keys(paginationBody.entityFilters).forEach((key) => {
          const value = paginationBody.entityFilters?.[key];
          if (value !== undefined && value !== null) {
            where[key] = value;
          }
        });
      }

      const options: FindManyOptions<Crop> = {
        relations: relations,
        where: where,
        order: { createdAt: 'DESC' },
        take: paginationQuery.limit,
        skip: (paginationQuery.page - 1) * paginationQuery.limit,
      };

      const [farms, total] = await this.modelRepository.findAndCount(options);

      return {
        totalItems: total,
        totalPages: Math.ceil(total / paginationQuery.limit),
        itemsPerPage: paginationQuery.limit,
        currentPage: paginationQuery.page,
        list: farms,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<Crop> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Crop> = { id };

      if (user.role !== Role.ADMIN) {
        where.harvest = { farm: { user: { id: user.id } } };
      }

      const farm = await this.modelRepository.findOne({
        where,
        relations: ['harvest'],
      });

      if (!farm) {
        throw new NotFoundException(`Harvest not found`);
      }

      return farm;
    } catch (error) {
      throw error;
    }
  }

  private async update(id: string, crop: Crop): Promise<Crop> {
    try {
      return this.modelRepository.manager.transaction(async (manager) => {
        const cropToUpdate = await manager.findOne(Crop, { where: { id } });

        if (!cropToUpdate) {
          throw new NotFoundException(`Crop not found`);
        }

        Object.assign(cropToUpdate, crop);

        return manager.save(cropToUpdate);
      });
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(id: string, status: CropStatus): Promise<Crop> {
    try {
      const crop = await this.findOne(id);

      if (crop.status === status) {
        throw new BadRequestException('Crop is already in this status');
      }

      if (
        crop.status === CropStatus.HARVESTED ||
        crop.status === CropStatus.CANCELED
      ) {
        throw new BadRequestException(`Crop is already ${status}`);
      }

      crop.status = status;

      await this.update(id, crop);

      return crop;
    } catch (error) {
      throw error;
    }
  }
}
