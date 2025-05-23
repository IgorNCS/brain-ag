import { ApiProperty } from '@nestjs/swagger';
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
import { CropStatus } from '../enums/crop-status.enum';
import { Harvest } from '../../harvest/entities/harvest.entity';

@Entity()
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Milho' })
  seed: string;

  @Column('float')
  @ApiProperty({ example: 20.5 })
  plantedArea: number;

  @Column({ type: 'enum', enum: CropStatus, default: CropStatus.PLANTED })
  @ApiProperty({ example: 'planted', enum: CropStatus })
  status: CropStatus;

  @Column('int')
  @ApiProperty({ example: 1 })
  monthPlanted: number;

  @Column('int')
  @ApiProperty({ example: 2025 })
  yearPlanted: number;

  @Column('int', { nullable: true })
  @ApiProperty({ example: 5, nullable: true })
  monthHarvested?: number;
  
  @Column('int', { nullable: true })
  @ApiProperty({ example: 2025, nullable: true })
  yearHarvested?: number;

  @ManyToOne(() => Harvest, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'harvest_id', referencedColumnName: 'id' })
  harvest: Harvest;

  @CreateDateColumn()
  @ApiProperty({ example: '2025-05-20T14:30:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2025-05-22T14:30:00.000Z' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  @ApiProperty({ example: '2025-05-24T14:30:00.000Z', nullable: true })
  deletedAt: Date | null;
}
