import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fulano' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'fulano@gmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'senhasecreta123' })
  password: string;
}

export interface RegisterSuccessResponse {
  success: true;
  userId: string;
  message: string;
}

export interface RegisterErrorResponse {
  success: false;
  message: string;
  error: any;
}
