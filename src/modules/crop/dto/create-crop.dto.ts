import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CropStatus } from '../enums/crop-status.enum';

export class CreateCropDto {
    @ApiProperty({ example: 'Milho' })
    @IsString()
    seed: string;

    @ApiProperty({ example: 20.5 })
    @IsNumber()
    plantedArea: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    @Max(12)
    monthPlanted: number;

    @ApiProperty({ example: 2025 })
    @IsInt()
    yearPlanted: number;
}

