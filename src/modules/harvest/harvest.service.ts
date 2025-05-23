import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { FarmService } from '../farm/farm.service';
import { Harvest } from './entities/harvest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { UserService } from '../user/user.service';
import { Role } from '../user/entities/user.entity';
import { HarvestStatus } from './enums/harvest-status.enum';
import { UpdateStatusHarvestDto } from './dto/update-harvest-status.dto';
import { CropStatus } from '../crop/enums/crop-status.enum';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import {
  PaginationBodyDTO,
  PaginationQueryDTO,
} from '@/src/common/utils/dtos/findAllRequest';

@Injectable()
export class HarvestService {
  constructor(
    @InjectRepository(Harvest)
    private modelRepository: Repository<Harvest>,
    private readonly farmService: FarmService,
    private readonly userService: UserService,
  ) {}
  async create(farmId: string) {
    try {
      const farm = await this.farmService.findOne(farmId);
      const harvest = new Harvest();
      harvest.farm = farm;
      harvest.totalArea = farm.arableArea;
      harvest.enabledArea = farm.arableArea;
      await this.modelRepository.save(harvest);
      return harvest;
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    paginationBody: PaginationBodyDTO<Harvest>,
    paginationQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Harvest>> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Harvest> = {};
      const relations: FindOptionsRelations<Harvest> = {};

      if (paginationBody.relations && paginationBody.relations.length > 0) {
        paginationBody.relations.forEach((relation) => {
          relations[relation] = true;
        });
      }

      if (user.role !== Role.ADMIN) {
        where.farm = { user: { id: user.id } };
      } else if (paginationBody.userId) {
        where.farm = { user: { id: In(paginationBody.userId) } };
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

      const options: FindManyOptions<Harvest> = {
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

  async findOne(id: string): Promise<Harvest> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Harvest> = { id };

      if (user.role !== Role.ADMIN) {
        where.farm = { user: { id: user.id } };
      }

      const farm = await this.modelRepository.findOne({
        where,
        relations: ['crop', 'farm'],
      });

      if (!farm) {
        throw new NotFoundException(`Harvest not found`);
      }

      return farm;
    } catch (error) {
      throw error;
    }
  }

  async hasEnableArea(harvest: Harvest, area: number): Promise<boolean> {
    return area <= harvest.enabledArea;
  }

  async update(
    id: string,
    updateHarvestDto: UpdateHarvestDto,
  ): Promise<Harvest> {
    try {
      return this.modelRepository.manager.transaction(async (manager) => {
        const harvestToUpdate = await manager.findOne(Harvest, {
          where: { id },
        });

        if (!harvestToUpdate) {
          throw new NotFoundException(`Harvest not found`);
        }

        Object.assign(harvestToUpdate, updateHarvestDto);

        return manager.save(harvestToUpdate);
      });
    } catch (error) {
      throw error;
    }
  }

  async changeStatus(
    id: string,
    status: HarvestStatus,
    updateHarvest: UpdateStatusHarvestDto,
  ): Promise<Harvest> {
    try {
      const harvest = await this.findOne(id);

      if (harvest.status === status) {
        throw new BadRequestException('Harvest is already in this status');
      }

      if (
        harvest.status === HarvestStatus.HARVESTED ||
        harvest.status === HarvestStatus.CANCELED
      ) {
        throw new BadRequestException(`Harvest is already ${status}`);
      }

      if (
        status === HarvestStatus.HARVESTED &&
        (!harvest.crop ||
          harvest.crop.some((crop) => crop.status !== CropStatus.HARVESTED))
      ) {
        throw new BadRequestException('Harvest has no harvested crops');
      }

      if (
        status === HarvestStatus.CANCELED &&
        harvest?.crop?.some(
          (crop) =>
            crop.status !== CropStatus.HARVESTED &&
            crop.status !== CropStatus.CANCELED,
        )
      ) {
        throw new BadRequestException(
          'Harvest has no fully harvested or canceled crops',
        );
      }

      if (status === HarvestStatus.HARVESTED) {
        harvest.monthHarvested =
          updateHarvest.monthHarvested || new Date().getMonth() + 1;
        harvest.yearHarvested =
          updateHarvest.yearHarvested || new Date().getFullYear();
      }

      harvest.status = status;

      await this.update(id, harvest);

      return harvest;
    } catch (error) {
      throw error;
    }
  }

  private verifyHarvestFinish() {}
}
