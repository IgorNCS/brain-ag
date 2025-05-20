import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import {
  DecodedToken,
  keycloakResponse,
  LoginDto,
  LoginResponse,
} from './dto/login.dto';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';
import { decode } from 'punycode';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async register(user: RegisterDto): Promise<string> {
    try {
      const adminToken = await this.getAdminToken();
      const response = await firstValueFrom(
        this.httpService
          .post<any>(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
            {
              username: user.username,
              email: user.email,
              enabled: true,
              emailVerified: true, // Isso deve ser usado apenas em TESTES
              credentials: [
                {
                  type: 'password',
                  value: user.password,
                  temporary: false,
                },
              ],
            },
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );

      const locationHeader = response.headers.location;
      const userId = locationHeader.split('/').pop();
      return userId;
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<keycloakResponse>(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID || '',
              client_secret: process.env.KEYCLOAK_SECRET || '',
              grant_type: 'password',
              username: credentials.username,
              password: credentials.password,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );

      const decoded = jwt.decode(data.access_token) as DecodedToken;
      const user = await this.userService.loginUser(decoded.sub);
      return {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async refreshToken(token: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<keycloakResponse>(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID || '',
              client_secret: process.env.KEYCLOAK_SECRET || '',
              grant_type: 'refresh_token',
              refresh_token: token,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );

      return {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar token',
        error: error.response?.data || error.message,
      };
    }
  }

  async logout(token: string) {
    try {
      await this.httpService.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID || '',
          client_secret: process.env.KEYCLOAK_SECRET || '',
          refresh_token: token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        },
      );

      this.userService.destroy();

      return { success: true, message: 'Logout realizado com sucesso' };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao fazer logout',
        error: error.response?.data || error.message,
      };
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<RegisterDto>,
  ): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      await firstValueFrom(
        this.httpService
          .put(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async softDeleteUser(userId: string): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      await firstValueFrom(
        this.httpService
          .put(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`,
            {
              enabled: false,
            },
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getAdminToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
              client_id: 'admin-cli',
              username: process.env.KEYCLOAK_ADMIN || '',
              password: process.env.KEYCLOAK_ADMIN_PASSWORD || '',
              grant_type: 'password',
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error(`Erro ao obter token de admin: ${error.message}`);
    }
  }
}
