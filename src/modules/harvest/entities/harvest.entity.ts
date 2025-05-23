import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Farm } from '../../farm/entities/farm.entity';
import { HarvestStatus } from '../enums/harvest-status.enum';
import { Crop } from '../../crop/entities/crop.entity';

@Entity()
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f',
    description: 'Unique identifier for the harvest.',
  })
  id: string;
  
  @Column('float')
  @ApiProperty({ example: 100.5 })
  totalArea: number;

  @Column('float')
  @ApiProperty({
    example: 20.5,
    description: 'Total area of the farm that was harvested.',
  })
  plantedArea: number;

  @Column('float')
  @ApiProperty({ example: 80.0 })
  enabledArea: number;

  @Column({
    type: 'enum',
    enum: HarvestStatus,
    default: HarvestStatus.PREPARING_LAND,
  })
  @ApiProperty({
    example: 'planted',
    enum: HarvestStatus,
    description: 'Status of the harvest.',
  })
  status: HarvestStatus;

  @Column('int',{ nullable: true })
  @ApiPropertyOptional({
    example: 1,
    description: 'Month when the harvest was planted.',
  })
  monthPlanted?: number;

  @Column('int',{ nullable: true })
  @ApiPropertyOptional({
    example: 2025,
    description: 'Year when the harvest was planted.',
  })
  yearPlanted?: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional({
    example: 5,
    nullable: true,
    description: 'Month when the harvest was harvested.',
  })
  monthHarvested?: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional({
    example: 2025,
    nullable: true,
    description: 'Year when the harvest was harvested.',
  })
  yearHarvested?: number;

  @ManyToOne(() => Crop, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'crop_id', referencedColumnName: 'id' })
  crop: Crop[] | null;

  @ManyToOne(() => Farm, (Farm) => Farm.user)
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farm: Farm;

  @CreateDateColumn()
  @ApiProperty({
    example: '2025-05-20T14:30:00.000Z',
    description: 'Date when the harvest was created.',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    example: '2025-05-22T14:30:00.000Z',
    description: 'Date when the harvest was last updated.',
  })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  @ApiProperty({
    example: '2025-05-24T14:30:00.000Z',
    nullable: true,
    description: 'Date when the harvest was deleted.',
  })
  deletedAt: Date | null;
}
