import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Farm } from '../../farm/entities/farm.entity';

export enum Role {
  ADMIN = 'admin',
  COSTUMER = 'costumer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Fulano de tal' })
  name: string;

  @Column()
  @ApiProperty({ example: 'fulano@gmail.com' })
  email: string;

  @Column({ unique: true })
  @ApiProperty({ example: 13245678900 })
  cpfCnpj: number;

  @IsEnum(Role)
  @Column({ type: 'enum', enum: Role, default: Role.COSTUMER })
  @ApiProperty({ example: 'admin', enum: Role })
  role: Role;

  @Column('uuid', { unique: true, nullable: false })
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  keycloakId: string;

  @OneToMany(() => Farm, (Farm) => Farm.user, { nullable: true })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id' })
  farms: Farm[];

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
