import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreateFarmDTO {
  @ApiProperty({ example: 'Colheita feliz' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.totalArea > o.arableArea + o.vegetationArea)
  totalArea: number;

  @ApiProperty({ example: 80.0 })
  @IsNumber()
  @IsNotEmpty()
  arableArea: number;

  @ApiProperty({ example: 20.5 })
  @IsNumber()
  @IsNotEmpty()
  vegetationArea: number;

  @ApiPropertyOptional({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  @IsString()
  @IsOptional()
  userId?: string;
}

