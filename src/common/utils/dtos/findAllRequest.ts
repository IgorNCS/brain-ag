import {
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsBoolean,
  IsString,
  Max,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationsTypes } from '../enums/relations.type';
import { transformKeyToEnum } from '../../transforms/transformKeyAndEnum';

export class PaginationQueryDTO {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number to be returned (starts at 1)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page (maximum 100)',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class PaginationBodyDTO {
  @ApiPropertyOptional({
    example: ['b7f0c5a0-0a1e-11ec-9621-0242ac130002'],
    description: 'Client Id.',
    isArray: true,
  })
  @IsOptional()
  @IsString({ each: true })
  userId?: string[] = [];

  @ApiPropertyOptional({
    example: '2022-01-01',
    pattern: '/^\d{4}-\d{2}-\d{2}$/',
    description:
      'Restricts the query to authorizations with Start Date greater than or equal to the informed. Format: yyyy-mm-dd',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2022-01-01',
    pattern: '/^\d{4}-\d{2}-\d{2}$/',
    description:
      'Restricts the query to authorizations with End Date less than or equal to the informed. Format: yyyy-mm-dd',
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: [RelationsTypes.USER],
    enum: RelationsTypes,
    isArray: true,
    description: 'Relations that will be returned.',
  })
  @IsArray()
  @IsOptional()
  @IsEnum(RelationsTypes, { each: true })
  @Transform(({ value }) => transformKeyToEnum(value, RelationsTypes))
  relations?: RelationsTypes[];
}
