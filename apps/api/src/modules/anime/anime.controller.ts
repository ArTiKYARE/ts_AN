import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { AnimeService } from './anime.service';
import { CreateAnimeDto, UpdateAnimeDto, FilterAnimeDto } from './dto/anime.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Контроллер для управления аниме-контентом
 * Публичные endpoints доступны без авторизации
 * Административные endpoints требуют роли ADMIN или MODERATOR
 */
@ApiTags('Аниме')
@Controller('api/anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  // ------------------------------------------
  // Публичные endpoints
  // ------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Получить список аниме с фильтрами' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'genres', required: false, type: [String] })
  @ApiQuery({ name: 'year', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ONGOING', 'COMPLETED', 'ANNOUNCED'] })
  @ApiResponse({ status: 200, description: 'Список аниме получен успешно' })
  async findAll(@Query() dto: FilterAnimeDto) {
    return this.animeService.findAll(dto);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Получить популярные аниме' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  async getPopular(@Query('limit') limit?: number) {
    return this.animeService.getPopular(Number(limit) || 10);
  }

  @Get('new')
  @ApiOperation({ summary: 'Получить новые аниме' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  async getNew(@Query('limit') limit?: number) {
    return this.animeService.getNew(Number(limit) || 10);
  }

  @Get('random')
  @ApiOperation({ summary: 'Получить случайное аниме' })
  async getRandom() {
    return this.animeService.getRandom();
  }

  @Get('genres')
  @ApiOperation({ summary: 'Получить все жанры' })
  async getAllGenres() {
    return this.animeService.getAllGenres();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить аниме по ID' })
  @ApiResponse({ status: 200, description: 'Данные аниме' })
  @ApiResponse({ status: 404, description: 'Аниме не найдено' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animeService.findOne(id);
  }

  // ------------------------------------------
  // Административные endpoints (требуют авторизации)
  // ------------------------------------------

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Создать новое аниме (Admin/Mod)' })
  async create(@Body() dto: CreateAnimeDto) {
    return this.animeService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Обновить аниме (Admin/Mod)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnimeDto,
  ) {
    return this.animeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Удалить аниме (только Admin)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animeService.remove(id);
  }
}
