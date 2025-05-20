import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { CacheModule } from '@nestjs/cache-manager';


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
    CacheModule.register(),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      interceptor: { mount: false },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
