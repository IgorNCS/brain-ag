import { Test, TestingModule } from '@nestjs/testing';
import { HarvestService } from './harvest.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { FarmService } from '../farm/farm.service';
import { UserService } from '../user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Farm } from '../farm/entities/farm.entity';
import { User, Role } from '../user/entities/user.entity';
import { HarvestStatus } from './enums/harvest-status.enum';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { CropStatus } from '../crop/enums/crop-status.enum';
import { Crop } from '../crop/entities/crop.entity';
import { UpdateStatusHarvestDto } from './dto/update-harvest-status.dto';

describe('HarvestService', () => {
  let service: HarvestService;
  let harvestRepository: Repository<Harvest>;
  let farmService: FarmService;
  let userService: UserService;

  const mockUser: User = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    role: Role.COSTUMER,
    keycloakId: 'keycloak123',
    cpfCnpj: 12345678901,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    farms: [],
  };

  const mockAdminUser: User = {
    ...mockUser,
    id: 'admin1',
    role: Role.ADMIN,
  };

  let managerMock: {
    findOne: jest.Mock;
    save: jest.Mock;
  };

  const mockFarm: Farm = {
    id: 'farm1',
    name: 'Test Farm',
    arableArea: 100,
    totalArea: 120,
    city: 'Farmville',
    state: 'FS',
    user: mockUser,
    vegetationArea: 20,
    harvest: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockHarvest: Harvest = {
    id: 'harvest1',
    farm: mockFarm,
    totalArea: 100,
    enabledArea: 100,
    plantedArea: 0,
    status: HarvestStatus.PLANTED,
    monthHarvested: 5,
    yearHarvested: 2025,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    crop: [],
  };

  const mockHarvestWithCrops: Harvest = {
    ...mockHarvest,
    crop: [
      {
        id: 'crop1',
        harvest: mockHarvest,
        seed: 'Corn',
        monthPlanted: 1,
        yearPlanted: 2024,
        plantedArea: 50,
        status: CropStatus.PLANTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'crop2',
        harvest: mockHarvest,
        seed: 'Soy',
        monthPlanted: 2,
        yearPlanted: 2024,
        plantedArea: 30,
        status: CropStatus.PLANTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  };

  const mockHarvestWithHarvestedCrops: Harvest = {
    ...mockHarvest,
    crop: [
      {
        id: 'crop1',
        harvest: mockHarvest,
        seed: 'Corn',
        monthPlanted: 1,
        yearPlanted: 2024,
        plantedArea: 50,
        status: CropStatus.HARVESTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'crop2',
        harvest: mockHarvest,
        seed: 'Soy',
        monthPlanted: 2,
        yearPlanted: 2024,
        plantedArea: 30,
        status: CropStatus.HARVESTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  };

  const mockHarvestWithMixedCrops: Harvest = {
    ...mockHarvest,
    crop: [
      {
        id: 'crop1',
        harvest: mockHarvest,
        seed: 'Corn',
        monthPlanted: 1,
        yearPlanted: 2024,
        plantedArea: 50,
        status: CropStatus.HARVESTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'crop2',
        harvest: mockHarvest,
        seed: 'Soy',
        monthPlanted: 2,
        yearPlanted: 2024,
        plantedArea: 30,
        status: CropStatus.PLANTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ],
  };

  const mockHarvestRepository = () => ({
    save: jest.fn(),
    findOne: jest.fn(),
    manager: {
      transaction: jest.fn((cb) =>
        cb({
          findOne: jest.fn(), // <--- This mock is incorrect
          save: jest.fn(),
        }),
      ),
    },
  });

  const mockFarmService = () => ({
    findOne: jest.fn(),
  });

  const mockUserService = () => ({
    get: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HarvestService,
        {
          provide: getRepositoryToken(Harvest),
          useFactory: mockHarvestRepository,
        },
        { provide: FarmService, useFactory: mockFarmService },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<HarvestService>(HarvestService);
    harvestRepository = module.get<Repository<Harvest>>(
      getRepositoryToken(Harvest),
    );
    farmService = module.get<FarmService>(FarmService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new harvest for a farm', async () => {
      jest.spyOn(farmService, 'findOne').mockResolvedValue(mockFarm);
      jest.spyOn(harvestRepository, 'save').mockResolvedValue(mockHarvest);

      const result = await service.create(mockFarm.id);

      expect(farmService.findOne).toHaveBeenCalledWith(mockFarm.id);
      expect(harvestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          farm: mockFarm,
          totalArea: mockFarm.arableArea,
          enabledArea: mockFarm.arableArea,
        }),
      );
      expect(result).toEqual(mockHarvest);
    });

    it('should throw an error if farm not found', async () => {
      jest
        .spyOn(farmService, 'findOne')
        .mockRejectedValue(new NotFoundException('Farm not found'));

      await expect(service.create('nonexistent-farm-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(farmService.findOne).toHaveBeenCalledWith('nonexistent-farm-id');
      expect(harvestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a string indicating all harvests', () => {
      expect(service.findAll()).toEqual('This action returns all harvest');
    });
  });

  describe('findOne', () => {
    it('should return a harvest by ID for an ADMIN user', async () => {
      jest.spyOn(userService, 'get').mockResolvedValue(mockAdminUser);
      jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(mockHarvest);

      const result = await service.findOne(mockHarvest.id);

      expect(userService.get).toHaveBeenCalled();
      expect(harvestRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockHarvest.id },
        relations: ['crop', 'farm'],
      });
      expect(result).toEqual(mockHarvest);
    });

    it('should return a harvest by ID for a COSTUMER user, filtered by user ID', async () => {
      jest.spyOn(userService, 'get').mockResolvedValue(mockUser);
      jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(mockHarvest);

      const result = await service.findOne(mockHarvest.id);

      expect(userService.get).toHaveBeenCalled();
      expect(harvestRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockHarvest.id, farm: { user: { id: mockUser.id } } },
        relations: ['crop', 'farm'],
      });
      expect(result).toEqual(mockHarvest);
    });

    it('should throw NotFoundException if harvest not found', async () => {
      jest.spyOn(userService, 'get').mockResolvedValue(mockUser);
      jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(harvestRepository.findOne).toHaveBeenCalled();
    });

    it('should rethrow error from userService.get', async () => {
      const error = new Error('User service error');
      jest.spyOn(userService, 'get').mockRejectedValue(error);

      await expect(service.findOne(mockHarvest.id)).rejects.toThrow(error);
    });
  });

  describe('hasEnableArea', () => {
    it('should return true if area is less than or equal to enabledArea', async () => {
      const result = await service.hasEnableArea(mockHarvest, 50);
      expect(result).toBe(true);
    });

    it('should return false if area is greater than enabledArea', async () => {
      const result = await service.hasEnableArea(mockHarvest, 150);
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a harvest', async () => {
      const updateDto: UpdateHarvestDto = { plantedArea: 150 };
      const updatedHarvest = { ...mockHarvest, plantedArea: 150 };

      (
        harvestRepository.manager.transaction as jest.Mock
      ).mockImplementationOnce(async (callback) => {
        const managerMock = {
          findOne: jest.fn().mockResolvedValue(mockHarvest),
          save: jest.fn().mockResolvedValue(updatedHarvest),
        };
        return callback(managerMock);
      });

      const result = await service.update(mockHarvest.id, updateDto);

      expect(harvestRepository.manager.transaction).toHaveBeenCalled();
      const managerArg = (harvestRepository.manager.transaction as jest.Mock)
        .mock.calls[0][0];
      expect(managerArg({}).findOne).toHaveBeenCalledWith(Harvest, {
        where: { id: mockHarvest.id },
      });
      expect(managerArg({}).save).toHaveBeenCalledWith(
        expect.objectContaining(updatedHarvest),
      );
      expect(result).toEqual(updatedHarvest);
    });

    it('should throw NotFoundException if harvest to update is not found', async () => {
      const updateDto: UpdateHarvestDto = { plantedArea: 150 };

      (
        harvestRepository.manager.transaction as jest.Mock
      ).mockImplementationOnce(async (callback) => {
        const managerMock = {
          findOne: jest.fn().mockResolvedValue(undefined),
          save: jest.fn(),
        };
        return callback(managerMock);
      });

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeStatus', () => {
    it('should change harvest status to HARVESTED if all crops are harvested', async () => {
      const updateStatusDto: UpdateStatusHarvestDto = {
        monthHarvested: 5,
        yearHarvested: 2025,
      };
      const updatedHarvest = {
        ...mockHarvestWithHarvestedCrops,
        status: HarvestStatus.HARVESTED,
        monthHarvested: 5,
        yearHarvested: 2025,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockHarvestWithHarvestedCrops)
        .mockResolvedValueOnce(updatedHarvest);

      jest.spyOn(service, 'update').mockResolvedValue(updatedHarvest);

      const result = await service.changeStatus(
        mockHarvest.id,
        HarvestStatus.HARVESTED,
        updateStatusDto,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockHarvest.id);
      expect(service.update).toHaveBeenCalledWith(
        mockHarvest.id,
        expect.objectContaining({
          status: HarvestStatus.HARVESTED,
          monthHarvested: 5,
          yearHarvested: 2025,
        }),
      );
      expect(result.status).toEqual(HarvestStatus.HARVESTED);
      expect(result.monthHarvested).toEqual(5);
      expect(result.yearHarvested).toEqual(2025);
    });

    it('should change harvest status to CANCELED if all crops are harvested or canceled', async () => {
      const updateStatusDto: UpdateStatusHarvestDto = {};
      const canceledCropsHarvest = {
        ...mockHarvest,
        crop: [
          {
            ...mockHarvestWithHarvestedCrops.crop![0],
            status: CropStatus.HARVESTED,
          },
          {
            ...mockHarvestWithHarvestedCrops.crop![1],
            status: CropStatus.CANCELED,
          },
        ],
      };
      const updatedHarvest = {
        ...canceledCropsHarvest,
        status: HarvestStatus.CANCELED,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(canceledCropsHarvest)
        .mockResolvedValueOnce(updatedHarvest);

      jest.spyOn(service, 'update').mockResolvedValue(updatedHarvest);

      const result = await service.changeStatus(
        mockHarvest.id,
        HarvestStatus.CANCELED,
        updateStatusDto,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockHarvest.id);
      expect(service.update).toHaveBeenCalledWith(
        mockHarvest.id,
        expect.objectContaining({ status: HarvestStatus.CANCELED }),
      );
      expect(result.status).toEqual(HarvestStatus.CANCELED);
    });

    it('should throw BadRequestException if harvest is already in the target status', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ ...mockHarvest, status: HarvestStatus.PLANTED });

      await expect(
        service.changeStatus(mockHarvest.id, HarvestStatus.PLANTED, {}),
      ).rejects.toThrow(BadRequestException);
      expect(service.findOne).toHaveBeenCalledWith(mockHarvest.id);
    });

    it('should throw BadRequestException if harvest is already HARVESTED or CANCELED', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ ...mockHarvest, status: HarvestStatus.HARVESTED });
      await expect(
        service.changeStatus(mockHarvest.id, HarvestStatus.CANCELED, {}),
      ).rejects.toThrow(BadRequestException);

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ ...mockHarvest, status: HarvestStatus.CANCELED });
      await expect(
        service.changeStatus(mockHarvest.id, HarvestStatus.HARVESTED, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to harvest with unharvested crops', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockHarvestWithMixedCrops);

      await expect(
        service.changeStatus(mockHarvest.id, HarvestStatus.HARVESTED, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to cancel with active crops', async () => {
      const activeCropsHarvest = {
        ...mockHarvest,
        crop: [
          {
            ...mockHarvestWithHarvestedCrops.crop![0],
            status: CropStatus.HARVESTED,
          },
          {
            ...mockHarvestWithHarvestedCrops.crop![1],
            status: CropStatus.PLANTED,
          },
        ],
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(activeCropsHarvest);

      await expect(
        service.changeStatus(mockHarvest.id, HarvestStatus.CANCELED, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set monthHarvested and yearHarvested if status is HARVESTED', async () => {
      const updateStatusDto: UpdateStatusHarvestDto = {
        monthHarvested: 7,
        yearHarvested: 2023,
      };
      const updatedHarvest = {
        ...mockHarvestWithHarvestedCrops,
        status: HarvestStatus.HARVESTED,
        monthHarvested: 7,
        yearHarvested: 2023,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockHarvestWithHarvestedCrops)
        .mockResolvedValueOnce(updatedHarvest);

      jest.spyOn(service, 'update').mockResolvedValue(updatedHarvest);

      const result = await service.changeStatus(
        mockHarvest.id,
        HarvestStatus.HARVESTED,
        updateStatusDto,
      );

      expect(result.monthHarvested).toBe(7);
      expect(result.yearHarvested).toBe(2023);
    });

    it('should set current month/year if status is HARVESTED and no specific dates provided', async () => {
      const updateStatusDto: UpdateStatusHarvestDto = {};
      const expectedMonth = new Date().getMonth() + 1;
      const expectedYear = new Date().getFullYear();
      const updatedHarvest = {
        ...mockHarvestWithHarvestedCrops,
        status: HarvestStatus.HARVESTED,
        monthHarvested: expectedMonth,
        yearHarvested: expectedYear,
      };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockHarvestWithHarvestedCrops)
        .mockResolvedValueOnce(updatedHarvest);

      jest.spyOn(service, 'update').mockResolvedValue(updatedHarvest);

      const result = await service.changeStatus(
        mockHarvest.id,
        HarvestStatus.HARVESTED,
        updateStatusDto,
      );

      expect(result.monthHarvested).toBe(expectedMonth);
      expect(result.yearHarvested).toBe(expectedYear);
    });

    it('should rethrow any caught error', async () => {
      const error = new Error('Test error');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      await expect(
        service.changeStatus('any-id', HarvestStatus.CANCELED, {}),
      ).rejects.toThrow(error);
    });
  });
});
