import {
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsString,
  MaxLength,
  Max,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../entities/user.entity';
import { cpf, cnpj } from 'cpf-cnpj-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Fulano de tal' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'fulano@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'senhasecreta123' })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiPropertyOptional({
    example: 'costumer',
    description: 'Apenas ADMIN pode enviar',
  })
  role?: Role;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: '12345678900' })
  @ValidateIf((o) =>
    o.cpfCnpj.length <= 11 ? cpf.isValid(o.cpfCnpj) : cnpj.isValid(o.cpfCnpj),
  )
  cpfCnpj: number;
}
