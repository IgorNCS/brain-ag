import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginationUserRequest } from './dto/request/findall-user.dto';
import { UserResponseDTO } from './dto/response/user.response.dto';
import { Role, User } from './entities/user.entity';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });

  const mockUser: User = { id: '1', name: 'Test User', email: 'test@example.com', role: Role.COSTUMER, keycloakId: '123', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,companies: [], ownerCompanies: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const expectedResult = 'This action adds a new user';

      (userService.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const query: PaginationUserRequest = { page: 1, limit: 10 };
      const expectedResult: UserResponseDTO = { current_page: 1, total_pages: 1, total_per_pages: 10, list: [mockUser], totalItems: 1 };

      (userService.findAll as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(userService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const id = '1';

      (userService.getById as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findOne(id);

      expect(userService.getById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };

      (userService.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.update(id, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';

      (userService.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove(id);

      expect(userService.remove).toHaveBeenCalledWith(id);
    });
  });
});