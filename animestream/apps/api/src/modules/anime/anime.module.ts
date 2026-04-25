/**
 * Модуль аниме
 * CRUD операции с аниме, поиск, фильтры
 */

import { Module } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { AnimeController } from './anime.controller';
import { ExternalApiModule } from '../../external-api/external-api.module';

@Module({
  imports: [ExternalApiModule],
  providers: [AnimeService],
  controllers: [AnimeController],
  exports: [AnimeService],
})
export class AnimeModule {}
