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
import { AnimeService } from './anime.service';
import { CreateAnimeDto, UpdateAnimeDto, FilterAnimeDto } from './dto/anime.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  // GET /api/v1/anime - Получить список аниме с фильтрами
  @Get()
  async findAll(@Query() filters: FilterAnimeDto) {
    return this.animeService.findAll(filters);
  }

  // GET /api/v1/anime/:id - Получить одно аниме
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animeService.findOne(id);
  }

  // GET /api/v1/anime/:id/related - Получить похожие аниме
  @Get(':id/related')
  async getRelated(@Param('id', ParseUUIDPipe) id: string) {
    return this.animeService.getRelated(id);
  }

  // POST /api/v1/anime - Создать аниме (только admin/moderator)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async create(@Body() createAnimeDto: CreateAnimeDto) {
    return this.animeService.create(createAnimeDto);
  }

  // PUT /api/v1/anime/:id - Обновить аниме (только admin/moderator)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAnimeDto: UpdateAnimeDto,
  ) {
    return this.animeService.update(id, updateAnimeDto);
  }

  // DELETE /api/v1/anime/:id - Удалить аниме (только admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.animeService.remove(id);
  }
}
