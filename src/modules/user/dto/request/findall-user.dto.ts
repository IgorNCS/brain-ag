import {
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsString,
  MaxLength,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../entities/user.entity';

export class PaginationUserRequest {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: 'Data inicial de criação do usuario',
  })
  initialDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: 'Data final de criação do usuario',
  })
  finalDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 1 })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 10 })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'Fulano de tal' })
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  @MaxLength(255)
  @ApiProperty({ example: 'admin' })
  role?: Role;
}
