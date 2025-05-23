import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateHarvestDto } from './create-harvest.dto';
import { HarvestStatus } from '../enums/harvest-status.enum';

export class UpdateHarvestDto {
  @ApiPropertyOptional({
    example: 20.5,
    description: 'Total area of the farm that was harvested.',
  })
  plantedArea?: number;

  @ApiPropertyOptional({ example: 80.0 })
  enabledArea?: number;

  @ApiPropertyOptional({
    example: HarvestStatus.PREPARING_LAND,
    enum: HarvestStatus,
    description: 'Status of the harvest.',
  })
  status?: HarvestStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Month when the harvest was planted.',
  })
  monthPlanted?: number;

  @ApiPropertyOptional({
    example: 2025,
    description: 'Year when the harvest was planted.',
  })
  yearPlanted?: number;

  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description: 'Month when the harvest was harvested.',
  })
  monthHarvested?: number;

  @ApiPropertyOptional({
    example: 2025,
    nullable: true,
    description: 'Year when the harvest was harvested.',
  })
  yearHarvested?: number;
}

