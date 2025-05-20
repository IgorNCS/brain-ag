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
import { User } from '../../user/entities/user.entity';

@Entity()
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Colheita feliz' })
  name: string;

  @Column()
  @ApiProperty({ example: 'New York' })
  city: string;

  @Column()
  @ApiProperty({ example: 'NY' })
  state: string;

  @Column('float')
  @ApiProperty({ example: 100.5 })
  totalArea: number;

  @Column('float')
  @ApiProperty({ example: 80.0 })
  arableArea: number;

  @Column('float')
  @ApiProperty({ example: 20.5 })
  vegetationArea: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

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
