import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        await AppDataSource.initialize();
        return AppDataSource.options;
      },
      dataSourceFactory: async (options) => {
        return AppDataSource;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
