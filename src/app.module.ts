import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
    }),
      // Throttling module which limits the number of requests per IP per minute
      ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: parseInt(config.get<string>('THROTTLE_TTL') ?? '60', 10),
            limit: parseInt(config.get<string>('THROTTLE_LIMIT') ?? '10', 10),
          },
        ],
      }),
    }),
    // Database 
    DatabaseModule,
    
    AuthModule, 
    BookModule, UserModule
  ],
  controllers: [AppController],
  providers: [AppService,
     {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }, AppService],
})
export class AppModule {}
