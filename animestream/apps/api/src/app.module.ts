/**
 * Главный модуль приложения
 * Импортирует и конфигурирует все функциональные модули
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// Модули функциональности
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AnimeModule } from './modules/anime/anime.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { AdminModule } from './modules/admin/admin.module';

// Конфигурация
import { configuration } from './config/configuration';

@Module({
  imports: [
    // ============================================
    // КОНФИГУРАЦИЯ
    // ============================================
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    // ============================================
    // RATE LIMITING (защита от DDoS и злоупотреблений)
    // ============================================
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 секунда
        limit: 3,  // 3 запроса
      },
      {
        name: 'medium',
        ttl: 60000, // 1 минута
        limit: 30,  // 30 запросов
      },
      {
        name: 'long',
        ttl: 3600000, // 1 час
        limit: 500,   // 500 запросов
      },
    ]),

    // ============================================
    // КЭШИРОВАНИЕ (Redis)
    // ============================================
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const isRedisEnabled = process.env.REDIS_ENABLED === 'true';
        
        if (isRedisEnabled) {
          return {
            store: redisStore,
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD,
            ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 час по умолчанию
          };
        }
        
        // Fallback на in-memory кэш для разработки
        return {
          ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
          max: 100, // Максимум 100 элементов в кэше
        };
      },
    }),

    // ============================================
    // ФУНКЦИОНАЛЬНЫЕ МОДУЛИ
    // ============================================
    AuthModule,
    UsersModule,
    AnimeModule,
    EpisodesModule,
    CommentsModule,
    FavoritesModule,
    WatchHistoryModule,
    AdminModule,
  ],
})
export class AppModule {}
