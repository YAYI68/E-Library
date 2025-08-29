import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NODE_ENV } from 'src/common/enums/common.enum';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH', './library.db'),
        autoLoadEntities: true, 
        synchronize: configService.get<string>('NODE_ENV') !== NODE_ENV.PRODUCTION,
        logging: configService.get<string>('NODE_ENV') === NODE_ENV.DEVELOPEMENT, // Enable query logging in development
      }),
    }),
  ],
})
export class DatabaseModule {}