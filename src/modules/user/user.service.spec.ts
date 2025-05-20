import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Role, User } from './entities/user.entity';
import { AuthService } from '../../auth/auth.service';
import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '../../auth/dto/register.dto';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginationUserRequest } from './dto/request/findall-user.dto';
import { UserResponseDTO } from './dto/response/user.response.dto';
import { ClsService } from 'nestjs-cls';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let authService: AuthService;
  let clsService: ClsService;

  const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: Role.COSTUMER, keycloakId: '123', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,companies: [], ownerCompanies: [] };
  const mockAdmin = { id: '1', name: 'Test User', email: 'test@example.com', role: Role.ADMIN, keycloakId: '123', createdAt: new Date(), updatedAt: new Date(), deletedAt: null,companies:[], ownerCompanies: [] };
  const mockUserRepository = () => ({
    manager: { transaction: jest.fn() },
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  });

  const mockAuthService = () => ({
    register: jest.fn(),
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
  });

  const mockClsService = () => ({
    get: jest.fn(),
    set: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: AuthService, useFactory: mockAuthService },
        { provide: ClsService, useFactory: mockClsService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    authService = module.get<AuthService>(AuthService);
    clsService = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpfCnpj:12344567890,
      };
      const registerDto: RegisterDto = {
        username: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      };
      const keycloakId = 'keycloak-user-id';

      (authService.register as jest.Mock).mockResolvedValue(keycloakId);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ save: jest.fn() }),
      );

      const result = await service.create(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(userRepository.manager.transaction).toHaveBeenCalled();
      expect(result).toEqual('This action adds a new user');
    });

    it('should throw an error if registration fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        cpfCnpj:12344567890,
      };

      (authService.register as jest.Mock).mockRejectedValue(new Error('Registration failed'));
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ save: jest.fn() }),
      );

      await expect(service.create(createUserDto)).rejects.toThrow('Registration failed');
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination and filters', async () => {
      const query: PaginationUserRequest = {
        page: 1,
        limit: 10,
        initialDate: '2025-01-01',
        finalDate: '2025-12-31',
        name: 'Test',
        role: Role.COSTUMER,
      };

      const users: User[] = [mockUser];
      const total = 1;

      (userRepository.findAndCount as jest.Mock).mockResolvedValue([users, total]);
      (clsService.get as jest.Mock).mockReturnValue({ role: Role.ADMIN });

      const result: UserResponseDTO = await service.findAll(query);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        where: {
          createdAt: Between(query.initialDate, query.finalDate),
          name: Like(`%${query.name}%`),
          role: query.role,
        },
        take: query.limit,
        skip: 0,
        relations: ['companies'],
      });

      expect(result).toEqual({
        current_page: 1,
        total_pages: 1,
        total_per_pages: 10,
        list: users,
        totalItems: total,
      });
    });
    it('should throw a forbidden exception if the user is not an admin', async () => {
      const query: PaginationUserRequest = {
        page: 1,
        limit: 10,
      };
      (clsService.get as jest.Mock).mockReturnValue({ role: Role.COSTUMER });
      await expect(service.findAll(query)).rejects.toThrow(ForbiddenException);

    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const user: User = mockUser;

      (clsService.get as jest.Mock).mockReturnValue(user);
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (authService.updateUser as jest.Mock).mockResolvedValue(undefined);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ update: jest.fn().mockResolvedValue({ affected: 1 }), findOne: jest.fn().mockResolvedValue(user) }),
      );

      const result = await service.update(id, updateUserDto);

      expect(authService.updateUser).toHaveBeenCalledWith(user.keycloakId, updateUserDto);
      expect(result).toEqual(user);
    });

    it('should throw ForbiddenException if user is not admin and tries to update another user', async () => {
      const id = '2';
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };

      (clsService.get as jest.Mock).mockReturnValue(mockUser);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ update: jest.fn(), findOne: jest.fn().mockResolvedValue(mockUser) }),
      );

      await expect(service.update(id, updateUserDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { name: 'Updated User' };
      const user: User = mockUser;

      (clsService.get as jest.Mock).mockReturnValue(user);
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (authService.updateUser as jest.Mock).mockResolvedValue(undefined);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ update: jest.fn().mockResolvedValue({ affected: 0 }), findOne: jest.fn().mockResolvedValue(user) }),
      );

      await expect(service.update(id, updateUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      const user: User = mockUser;

      (clsService.get as jest.Mock).mockReturnValue(user);
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (authService.softDeleteUser as jest.Mock).mockResolvedValue(undefined);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ softDelete: jest.fn() }),
      );

      await service.remove(id);

      expect(authService.softDeleteUser).toHaveBeenCalledWith(user.keycloakId);
    });
    it('Should throw forbidden exception if user is not the user being removed or an admin', async () => {
      const id = '2';
      const user: User = mockUser;
      (clsService.get as jest.Mock).mockReturnValue(user);
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userRepository.manager.transaction as jest.Mock).mockImplementation(
        (callback) => callback({ softDelete: jest.fn() }),
      );

      await expect(service.remove(id)).rejects.toThrow(ForbiddenException);
    })
  });

  describe('getById', () => {
    it('should find a user by id', async () => {
      const id = '1';
      const user: User = mockUser;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.getById(id);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const id = '1';

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getById(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBySub', () => {
    it('should return a user by sub', async () => {
      const sub = '123';
      const user: User = mockUser;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      const result = await service.getBySub(sub);
      expect(result).toEqual(user);
    })
  })
  describe('get', () => {
    it('should get the user from clsService', async () => {
      const user: User = mockUser;
      (clsService.get as jest.Mock).mockReturnValue(user);
      const result = service.get();
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found in clsService', async () => {
      (clsService.get as jest.Mock).mockReturnValue(undefined);
      expect(() => service.get()).toThrow(NotFoundException);
    });
  });
  describe('getAdmin', () => {
    it('Should return the user if they are an admin', async () => {
      const user: User = mockAdmin;
      (clsService.get as jest.Mock).mockReturnValue(user);
      const result = service.getAdmin();
      expect(result).toEqual(user);
    })
    it('Should throw a Forbidden exception when the user is not an admin', async () => {
      const user: User = mockUser;
      (clsService.get as jest.Mock).mockReturnValue(user);
      expect(() => service.getAdmin()).toThrow(ForbiddenException);
    })
  })
});