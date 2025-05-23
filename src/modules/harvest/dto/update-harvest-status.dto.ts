import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateHarvestDto } from './create-harvest.dto';
import { HarvestStatus } from '../enums/harvest-status.enum';

export class UpdateStatusHarvestDto {
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
