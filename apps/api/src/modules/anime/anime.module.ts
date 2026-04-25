import { Module } from '@nestjs/common';
import { AnimeController } from './anime.controller';
import { AnimeService } from './anime.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

/**
 * Модуль управления аниме-контентом
 * Предоставляет endpoints для:
 * - Просмотра каталога аниме
 * - Поиска и фильтрации
 * - Просмотра деталей аниме и эпизодов
 * - Управления контентом (для администраторов)
 */
@Module({
  controllers: [AnimeController],
  providers: [AnimeService],
  exports: [AnimeService],
})
export class AnimeModule {}
