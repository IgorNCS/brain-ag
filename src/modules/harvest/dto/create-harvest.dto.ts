import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Farm } from '../../farm/entities/farm.entity';
import { HarvestStatus } from '../enums/harvest-status.enum';
import { Crop } from '../../crop/entities/crop.entity';

export class CreateHarvestDto {

}


