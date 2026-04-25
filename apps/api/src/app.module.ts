// ==========================================
// Корневой модуль приложения
// ==========================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';

// Модули приложения
import { AuthModule } from './auth/auth.module';
import { AnimeModule } from './anime/anime.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';

// Prisma сервис
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    // ------------------------------------------
    // Конфигурация
    // ------------------------------------------
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // ------------------------------------------
    // Rate Limiting
    // ------------------------------------------
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('RATE_LIMIT_TTL', 60),
        limit: config.get('RATE_LIMIT_MAX', 100),
      }),
    }),

    // ------------------------------------------
    // Кэширование (Redis)
    // ------------------------------------------
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        password: config.get('REDIS_PASSWORD'),
        ttl: config.get('EXTERNAL_CACHE_TTL', 3600),
      }),
    }),

    // ------------------------------------------
    // Модули приложения
    // ------------------------------------------
    AuthModule,
    AnimeModule,
    CommentsModule,
    UsersModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
