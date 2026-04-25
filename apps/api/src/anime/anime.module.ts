// ==========================================
// Модуль аниме (каталог, поиск, плеер)
// ==========================================

import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { PrismaService } from '../../common/prisma.service';
import { ExternalApiAdapter } from './adapters/external-api.adapter';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule],
  controllers: [AnimeController],
  providers: [AnimeService, PrismaService, ExternalApiAdapter],
  exports: [AnimeService],
})
export class AnimeModule {}
