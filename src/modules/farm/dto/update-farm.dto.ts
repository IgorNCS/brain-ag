import { OmitType,PartialType } from '@nestjs/swagger';
import { CreateFarmDTO } from './create-farm.dto';

export class UpdateFarmDto extends PartialType(OmitType(CreateFarmDTO, ['userId'])) {}
