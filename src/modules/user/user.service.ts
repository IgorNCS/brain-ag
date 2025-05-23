import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Like, Repository } from 'typeorm';
import { Role, User } from './entities/user.entity';
import { AuthService } from '../../auth/auth.service';
import { RegisterDto } from '../../auth/dto/register.dto';
import { ClsService } from 'nestjs-cls';
import { PaginationUserRequest } from './dto/request/findall-user.dto';
import { UserResponseDTO } from './dto/response/user.response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private modelRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private readonly clsService: ClsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.modelRepository.manager.transaction(async (manager) => {
      try {
        const userKeycloak: RegisterDto = {
          username: createUserDto.name,
          email: createUserDto.email,
          password: createUserDto.password,
        };
        const responseKeycloak = await this.authService.register(userKeycloak);
        const user = new User();
        user.name = createUserDto.name;
        user.email = createUserDto.email;
        user.keycloakId = responseKeycloak;
        user.role = Role.COSTUMER;
        await manager.save(user);
        return 'User created successfully';
      } catch (error) {
        throw error;
      }
    });
  }

  async loginUser(sub: string) {
    try {
      const user = await this.getBySub(sub);
      if (!user) throw new Error('User not found');
      this.set(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: PaginationUserRequest):Promise<UserResponseDTO> {
    try {
      this.getAdmin();

      const { initialDate, finalDate, page = 1, limit = 10,name ,role} = query;
      const where: any = {};
      if (initialDate && finalDate) {
        where.createdAt = Between(initialDate, finalDate);
      }
      if(name) where.name = Like(`%${name}%`);
      if(role) where.role = role;
      
      const skip = this.calculateSkip(page, limit);

      const findOptions: FindManyOptions<User> = {
        order: {
          createdAt: 'DESC',
        },
        where: where,
        take: limit,
        skip: skip,
        
      };

      const [result, total] =
        await this.modelRepository.findAndCount(findOptions);

      return {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_per_pages: limit,
        list: result,
        totalItems: total,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return this.modelRepository.manager.transaction(async (manager) => {
        const userLogged = await this.get();

        if (userLogged.id !== id && userLogged.role !== Role.ADMIN)
          throw new ForbiddenException(
            'You do not have permission to update this user',
          );

        if (userLogged.role !== Role.ADMIN && updateUserDto.role)
          delete updateUserDto.role;

        const user = await this.getById(id);
        await this.authService.updateUser(user.keycloakId, updateUserDto);
        const result = await manager.update(
          this.modelRepository.target,
          id,
          updateUserDto,
        );
        if (result.affected === 0)
          throw new InternalServerErrorException(
            'Failure to update user in the database',
          );
        return await this.getById(id);
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.modelRepository.manager.transaction(async (manager) => {
        const userLogged = await this.get();

        if (userLogged.id !== id && userLogged.role !== Role.ADMIN) {
          throw new ForbiddenException(
            'You do not have permission to delete this user',
          );
        }

        const user = await this.getById(id);
        await this.authService.softDeleteUser(user.keycloakId);
        await manager.softDelete(this.modelRepository.target, id);
      });
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string): Promise<User> {
    const user = await this.modelRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  getBySub(sub: string) {
    const user = this.modelRepository.findOne({ where: { keycloakId: sub } });
    return user;
  }

  async get(): Promise<User> {
    try {
      const user = await this.clsService.get('user');
      if (!user) throw new NotFoundException('User not found');
      const userSaved = await this.modelRepository.findOne({ where: { keycloakId: user.sub },relations: ['farms'] });
      if (!userSaved) throw new NotFoundException('User not found');
      return userSaved;
    } catch (error) {
      throw error;
    }
  }

  getAdmin():User {
    try {
      const user = this.clsService.get('user');
      if (!user) throw new NotFoundException('User not found');
      if (user.role !== Role.ADMIN) throw new ForbiddenException();
      return user;
    } catch (error) {
      throw error;
    }
  }

  set(user: User) {
    try {
      this.clsService.set('user', user);
    } catch (error) {
      throw error;
    }
  }

  destroy() {
    try {
      this.clsService.set('user', undefined);
    } catch (error) {
      throw error;
    }
  }

  calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
