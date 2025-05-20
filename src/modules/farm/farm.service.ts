import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFarmDTO } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Farm } from './entities/farm.entity';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import {
  PaginationBodyDTO,
  PaginationQueryDTO,
} from '@/src/common/utils/dtos/findAllRequest';

@Injectable()
export class FarmService {
  constructor(
    @InjectRepository(Farm)
    private modelRepository: Repository<Farm>,
    private readonly userService: UserService,
  ) {}
  async create(createFarm: CreateFarmDTO): Promise<Farm> {
    try {
      const user = await this.userService.get();
      if (
        createFarm.arableArea + createFarm.vegetationArea >
        createFarm.totalArea
      ) {
        throw new BadRequestException(
          'The sum of arable and vegetation areas cannot exceed the farms total area.',
        );
      }
      if (user.role !== Role.ADMIN || !createFarm.userId)
        createFarm.userId = user.id;
      const farm = new Farm();
      farm.name = createFarm.name;
      farm.city = createFarm.city;
      farm.state = createFarm.state;
      farm.totalArea = createFarm.totalArea;
      farm.arableArea = createFarm.arableArea;
      farm.vegetationArea = createFarm.vegetationArea;
      farm.user = { id: createFarm.userId } as User;
      await this.modelRepository.save(farm);
      return farm;
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    paginationBody: PaginationBodyDTO,
    paginationQuery: PaginationQueryDTO,
  ): Promise<FindAllResponseDTO<Farm>> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Farm> = {};
      const relations: FindOptionsRelations<Farm> = {};

      if (paginationBody.relations && paginationBody.relations.length > 0) {
        paginationBody.relations.forEach((relation) => {
          relations[relation] = true;
        });
      }

      if (user.role !== Role.ADMIN) {
        // Usuário regular só vê suas próprias farms
        where.user = { id: user.id };
      } else if (paginationBody.userId) {
        where.user = { id: In(paginationBody.userId) };
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

      const options: FindManyOptions<Farm> = {
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

  async findOne(id: string): Promise<Farm> {
    try {
      const user = await this.userService.get();
      const where: FindOptionsWhere<Farm> = { id };

      if (user.role !== Role.ADMIN) {
        where.user = { id: user.id };
      }

      const farm = await this.modelRepository.findOne({
        where,
        relations: ['user'],
      });

      if (!farm) {
        throw new NotFoundException(`Farm not found`);
      }

      return farm;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    try {
      const farm = await this.findOne(id);

      if (
        (updateFarmDto.arableArea !== undefined ||
          updateFarmDto.vegetationArea !== undefined) &&
        updateFarmDto.totalArea !== undefined
      ) {
        const newArableArea = updateFarmDto.arableArea ?? farm.arableArea;
        const newVegetationArea =
          updateFarmDto.vegetationArea ?? farm.vegetationArea;
        const newTotalArea = updateFarmDto.totalArea ?? farm.totalArea;

        if (newArableArea + newVegetationArea > newTotalArea) {
          throw new BadRequestException(
            'The sum of arable and vegetation areas cannot exceed the farms total area.',
          );
        }
      } else if (
        updateFarmDto.arableArea !== undefined ||
        updateFarmDto.vegetationArea !== undefined
      ) {
        const newArableArea = updateFarmDto.arableArea ?? farm.arableArea;
        const newVegetationArea =
          updateFarmDto.vegetationArea ?? farm.vegetationArea;

        if (newArableArea + newVegetationArea > farm.totalArea) {
          throw new BadRequestException(
            'The sum of arable and vegetation areas cannot exceed the farms total area.',
          );
        }
      }

      if (updateFarmDto.name) farm.name = updateFarmDto.name;
      if (updateFarmDto.city) farm.city = updateFarmDto.city;
      if (updateFarmDto.state) farm.state = updateFarmDto.state;
      if (updateFarmDto.totalArea) farm.totalArea = updateFarmDto.totalArea;
      if (updateFarmDto.arableArea) farm.arableArea = updateFarmDto.arableArea;
      if (updateFarmDto.vegetationArea)
        farm.vegetationArea = updateFarmDto.vegetationArea;

      await this.modelRepository.save(farm);

      return farm;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<Farm> {
    try {
      const farm = await this.findOne(id);

      await this.modelRepository.softDelete({ id });
      return farm;
    } catch (error) {
      throw error;
    }
  }
}
