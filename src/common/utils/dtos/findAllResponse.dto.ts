import { IsNumber, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindAllResponseDTO<T> {
  @ApiProperty({
    example: 1,
    description: 'Page number to be returned (starts at 1)',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  currentPage: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page (max 100)',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  itemsPerPage: number = 10;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  totalPages: number = 10;

  @ApiProperty({
    example: 10,
    description: 'Total number of items',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  totalItems: number;

  @ApiProperty({
    description: 'List of items',
  })
  @IsArray()
  list: T[];
}

