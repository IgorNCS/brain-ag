import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './modules/user/user.module';
import { KeycloakUserMiddleware } from './keycloak/keycloakAuthGuard';
import { FarmModule } from './modules/farm/farm.module';
import { AuthModule } from './auth/auth.module';
import { CropModule } from './modules/crop/crop.module';
import { HarvestModule } from './modules/harvest/harvest.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        await AppDataSource.initialize();
        return AppDataSource.options;
      },
      dataSourceFactory: async (options) => {
        return AppDataSource;
      },
    }),
    // CacheModule.register(),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      interceptor: { mount: false },
    }),
    AuthModule,
    UserModule,
    FarmModule,
    CropModule,
    HarvestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(KeycloakUserMiddleware).forRoutes('*');
  }
}
