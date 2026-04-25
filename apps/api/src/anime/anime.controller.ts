// ==========================================
// Контроллер аниме
// ==========================================

import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete,
  Param, 
  Query, 
  Body, 
  UseGuards,
  Req,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { AnimeService } from './anime.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnimeStatus } from '@prisma/client';

@Controller('anime')
export class AnimeController {
  constructor(private animeService: AnimeService) {}

  // ------------------------------------------
  // Каталог аниме с фильтрами
  // GET /api/anime?page=1&limit=20&search=Naruto&genres=action,comedy&status=ONGOING
  // ------------------------------------------
  @Get()
  async getCatalog(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('search') search?: string,
    @Query('genres') genres?: string,
    @Query('status') status?: AnimeStatus,
    @Query('yearFrom', new ParseIntPipe({ optional: true })) yearFrom?: number,
    @Query('yearTo', new ParseIntPipe({ optional: true })) yearTo?: number,
    @Query('ratingFrom', new ParseIntPipe({ optional: true })) ratingFrom?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.animeService.findAll({
      page,
      limit,
      search,
      genres: genres ? genres.split(',') : undefined,
      status,
      yearFrom,
      yearTo,
      ratingFrom,
      sortBy,
      sortOrder,
    });
  }

  // ------------------------------------------
  // Поиск во внешнем API
  // GET /api/anime/search/external?query=Naruto&limit=10
  // ------------------------------------------
  @Get('search/external')
  async searchExternal(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.animeService.searchExternal(query, limit);
  }

  // ------------------------------------------
  // Импорт из внешнего API (админ)
  // POST /api/anime/import/:externalId
  // ------------------------------------------
  @Post('import/:externalId')
  async importFromExternal(@Param('externalId') externalId: string) {
    return this.animeService.importFromExternal(externalId);
  }

  // ------------------------------------------
  // Детальная страница аниме
  // GET /api/anime/:id
  // ------------------------------------------
  @Get(':id')
  async getAnime(@Param('id') id: string) {
    return this.animeService.findOne(id);
  }

  // ------------------------------------------
  // Обновление прогресса просмотра (авторизованным)
  // PATCH /api/anime/:id/watch
  // ------------------------------------------
  @Patch(':id/watch')
  @UseGuards(JwtAuthGuard)
  async updateWatchProgress(
    @Param('id') animeId: string,
    @Body('episodeNumber', new ParseIntPipe()) episodeNumber: number,
    @Body('progress') progress: number,
    @Req() req: any,
  ) {
    return this.animeService.updateWatchProgress(
      req.user.userId,
      animeId,
      episodeNumber,
      progress,
    );
  }

  // ------------------------------------------
  // Добавить/удалить из избранного (авторизованным)
  // POST /api/anime/:id/favorite
  // ------------------------------------------
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Param('id') animeId: string, @Req() req: any) {
    return this.animeService.toggleFavorite(req.user.userId, animeId);
  }

  // ------------------------------------------
  // Избранное пользователя (авторизованным)
  // GET /api/anime/favorites
  // ------------------------------------------
  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Req() req: any,
  ) {
    return this.animeService.getFavorites(req.user.userId, page, limit);
  }

  // ------------------------------------------
  // История просмотров (авторизованным)
  // GET /api/anime/history
  // ------------------------------------------
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getWatchHistory(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Req() req: any,
  ) {
    return this.animeService.getWatchHistory(req.user.userId, page, limit);
  }
}
