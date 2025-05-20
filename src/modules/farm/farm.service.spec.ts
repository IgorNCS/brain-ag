import { Test, TestingModule } from '@nestjs/testing';
import { FarmService } from './farm.service';
import { CreateFarmDTO } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from './entities/farm.entity';
import { UserService } from '../user/user.service';
import { Role, User } from '../user/entities/user.entity';
import { FindAllResponseDTO } from '@/src/common/utils/dtos/findAllResponse.dto';
import {
  PaginationBodyDTO,
  PaginationQueryDTO,
} from '@/src/common/utils/dtos/findAllRequest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RelationsTypes } from '@/src/common/utils/enums/relations.type';

describe('FarmService', () => {
  let service: FarmService;
  let farmRepository: Repository<Farm>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmService,
        {
          provide: Repository,
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FarmService>(FarmService);
    farmRepository = module.get<Repository<Farm>>(Repository);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if arableArea + vegetationArea > totalArea', async () => {
      const createFarmDto: CreateFarmDTO = {
        name: 'Test Farm',
        city: 'Test City',
        state: 'Test State',
        totalArea: 100,
        arableArea: 50,
        vegetationArea: 60,
      };

      await expect(service.create(createFarmDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a farm', async () => {
      const createFarmDto: CreateFarmDTO = {
        name: 'Test Farm',
        city: 'Test City',
        state: 'Test State',
        totalArea: 100,
        arableArea: 40,
        vegetationArea: 30,
      };

      const user = new User();
      user.id = '1';
      user.role = Role.ADMIN;

      jest.spyOn(userService, 'get').mockResolvedValue(user);

      const farm = await service.create(createFarmDto);

      expect(farm).toEqual(
        expect.objectContaining({
          name: 'Test Farm',
          city: 'Test City',
          state: 'Test State',
          totalArea: 100,
          arableArea: 40,
          vegetationArea: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          user: user,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of farms', async () => {
      const paginationBody: PaginationBodyDTO = {
        relations: [RelationsTypes.USER],
        startDate: '2022-01-01',
        endDate: '2022-01-31',
        userId: ['1', '2'],
      };

      const paginationQuery: PaginationQueryDTO = {
        limit: 10,
        page: 1,
      };

      const farms = [
        {
          id: '1',
          name: 'Test Farm 1',
          city: 'Test City',
          state: 'Test State',
          totalArea: 100,
          arableArea: 40,
          vegetationArea: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          user: new User(),
        },
        {
          id: '2',
          name: 'Test Farm 2',
          city: 'Test City',
          state: 'Test State',
          totalArea: 100,
          arableArea: 40,
          vegetationArea: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          user: new User(),
        },
      ];

      jest.spyOn(farmRepository, 'findAndCount').mockResolvedValue([farms, 2]);

      const result = await service.findAll(paginationBody, paginationQuery);

      expect(result).toEqual(
        expect.objectContaining({
          totalItems: 2,
          totalPages: 1,
          itemsPerPage: 10,
          currentPage: 1,
          list: farms,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a farm', async () => {
      const id = '1';

      const farm = {
        id: '1',
        name: 'Test Farm',
        city: 'Test City',
        state: 'Test State',
        totalArea: 100,
        arableArea: 40,
        vegetationArea: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: new User(),
      };

      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(farm);

      const result = await service.findOne(id);

      expect(result).toEqual(farm);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if arableArea + vegetationArea > totalArea', async () => {
      const id = '1';
      const updateFarmDto: UpdateFarmDto = {
        arableArea: 50,
        vegetationArea: 60,
      };

      await expect(service.update(id, updateFarmDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update a farm', async () => {
      const id = '1';
      const updateFarmDto: UpdateFarmDto = {
        name: 'Test Farm Updated',
        city: 'Test City Updated',
        state: 'Test State Updated',
        totalArea: 150,
        arableArea: 70,
        vegetationArea: 40,
      };

      const farm = {
        id: '1',
        name: 'Test Farm',
        city: 'Test City',
        state: 'Test State',
        totalArea: 100,
        arableArea: 40,
        vegetationArea: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: new User(),
      };

      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(farm);
      jest.spyOn(farmRepository, 'save').mockResolvedValue(farm);

      const result = await service.update(id, updateFarmDto);

      expect(result).toEqual(
        expect.objectContaining({
          name: 'Test Farm Updated',
          city: 'Test City Updated',
          state: 'Test State Updated',
          totalArea: 150,
          arableArea: 70,
          vegetationArea: 40,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a farm', async () => {
      const id = '1';

      const farm = {
        id: '1',
        name: 'Test Farm',
        city: 'Test City',
        state: 'Test State',
        totalArea: 100,
        arableArea: 40,
        vegetationArea: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: new User(),
      };

      const user = new User();
      user.id = '1';
      user.role = Role.ADMIN;

      jest.spyOn(userService, 'get').mockResolvedValue(user);
      jest.spyOn(farmRepository, 'findOne').mockResolvedValue(farm);
      jest.spyOn(farmRepository, 'softDelete');

      await service.remove(id);

      expect(farmRepository.softDelete).toHaveBeenCalledWith({ id });
    });

    it('should throw forbidden exception if user is not the user being removed or an admin', async () => {
      const id = '2';

      const user = new User();
      user.id = '1';
      user.role = Role.ADMIN;

      jest.spyOn(userService, 'get').mockResolvedValue(user);

      await expect(service.remove(id)).rejects.toThrow(ForbiddenException);
    });
  });
});
