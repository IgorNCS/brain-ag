import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fulano' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'senhasecreta123' })
  password: string;
}

export class LoginResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIjoiMjA5ZjhlNmMtZTVhNC00ZmFmLWE5ODItODkyMmRiNjVhN2Y3In0' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIjoiMjA5ZjhlNmMtZTVhNC00ZmFmLWE5ODItODkyMmRiNjVhN2Y3In0' })
  refresh_token: string;

  @ApiProperty({ example: 1800 })
  expires_in: number;
}

export interface keycloakResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  sid: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  email_verified: boolean;
  preferred_username: string;
}
