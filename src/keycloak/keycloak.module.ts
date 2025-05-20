import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';
import keycloakConfig from './keycloak.config';

@Module({
  imports: [
    ConfigModule.forFeature(keycloakConfig),
    KeycloakConnectModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
            authServerUrl: configService.get<string>('keycloak.authServerUrl') || '',
            realm: configService.get<string>('keycloak.realm') || '',
            clientId: configService.get<string>('keycloak.clientId') || '',
            secret: configService.get<string>('keycloak.secret') || '',
            cookieKey: configService.get<string>('keycloak.cookieKey') || 'KEYCLOAK_JWT',
            logLevels: configService.get('keycloak.logLevels') || ['warn', 'error', 'debug'],
            useNestLogger: configService.get('keycloak.useNestLogger') || true,
            policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
            tokenValidation: TokenValidation.ONLINE,
          
        };
      },
    }),
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: ResourceGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RoleGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class KeycloakModule {}
