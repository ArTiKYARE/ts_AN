// ==========================================
// Сервис для работы с аниме
// ==========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ExternalApiAdapter } from './adapters/external-api.adapter';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnimeService {
  constructor(
    private prisma: PrismaService,
    private externalApi: ExternalApiAdapter,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  // ------------------------------------------
  // Получение списка аниме (каталог)
  // ------------------------------------------
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    genres?: string[];
    status?: string;
    yearFrom?: number;
    yearTo?: number;
    ratingFrom?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      genres,
      status,
      yearFrom,
      yearTo,
      ratingFrom,
      sortBy = 'popularity',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Построение WHERE условия
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleNative: { contains: search, mode: 'insensitive' } },
        { synonyms: { has: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) where.year.gte = yearFrom;
      if (yearTo) where.year.lte = yearTo;
    }

    if (ratingFrom) {
      where.rating = { gte: ratingFrom };
    }

    if (genres && genres.length > 0) {
      where.genres = {
        some: {
          slug: { in: genres },
        },
      };
    }

    // Сортировка
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Получение данных
    const [animes, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: true,
          studios: true,
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      data: animes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // ------------------------------------------
  // Получение аниме по ID
  // ------------------------------------------
  async findOne(id: string) {
    const cacheKey = `anime:${id}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const anime = await this.prisma.anime.findUnique({
      where: { id },
      include: {
        genres: true,
        studios: true,
        episodes_list: {
          orderBy: { number: 'asc' },
          include: {
            sources: {
              where: { isActive: true },
              orderBy: { priority: 'desc' },
              include: {
                dubs: true,
              },
            },
          },
        },
        relatedAnime: {
          include: {
            to: {
              include: {
                coverImage: true,
                genres: true,
              },
            },
          },
        },
      },
    });

    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    // Увеличение счетчика популярности
    await this.prisma.anime.update({
      where: { id },
      data: { popularity: { increment: 1 } },
    });

    const ttl = this.configService.get('EXTERNAL_CACHE_TTL', 3600);
    await this.cacheManager.set(cacheKey, anime, ttl);

    return anime;
  }

  // ------------------------------------------
  // Поиск аниме во внешнем API
  // ------------------------------------------
  async searchExternal(query: string, limit: number = 10) {
    return this.externalApi.searchAnime(query, limit);
  }

  // ------------------------------------------
  // Импорт аниме из внешнего API
  // ------------------------------------------
  async importFromExternal(externalId: string) {
    // Проверка существования
    const existing = await this.prisma.anime.findUnique({
      where: { externalId },
    });

    if (existing) {
      return existing;
    }

    // Получение данных из внешнего API
    const externalData = await this.externalApi.getAnimeDetails(externalId);

    if (!externalData) {
      throw new NotFoundException('Аниме не найдено во внешнем API');
    }

    // Создание жанров если не существуют
    const genreIds: string[] = [];
    for (const genreName of externalData.genres) {
      const slug = genreName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const genre = await this.prisma.genre.upsert({
        where: { slug },
        update: {},
        create: { name: genreName, slug },
      });

      genreIds.push(genre.id);
    }

    // Создание студии если не существует
    let studioId: string | undefined;
    if (externalData.studios?.length > 0) {
      const studio = await this.prisma.studio.upsert({
        where: { name: externalData.studios[0] },
        update: {},
        create: { name: externalData.studios[0] },
      });
      studioId = studio.id;
    }

    // Создание аниме
    const anime = await this.prisma.anime.create({
      data: {
        externalId,
        title: externalData.title,
        titleNative: externalData.titleNative,
        synonyms: externalData.synonyms,
        description: externalData.description,
        coverImage: externalData.coverImage,
        bannerImage: externalData.bannerImage,
        trailerUrl: externalData.trailerUrl,
        year: externalData.year,
        season: externalData.season,
        episodes: externalData.episodes || 0,
        duration: externalData.duration,
        status: externalData.status,
        rating: externalData.rating,
        genres: { connect: genreIds.map((id) => ({ id })) },
        ...(studioId && { studios: { connect: [{ id: studioId }] } }),
      },
      include: { genres: true, studios: true },
    });

    return anime;
  }

  // ------------------------------------------
  // Обновление прогресса просмотра
  // ------------------------------------------
  async updateWatchProgress(userId: string, animeId: string, episodeNumber: number, progress: number = 0) {
    return this.prisma.watchHistory.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: {
        lastEpisode: episodeNumber,
        progress,
        watchedAt: new Date(),
      },
      create: {
        userId,
        animeId,
        lastEpisode: episodeNumber,
        progress,
      },
    });
  }

  // ------------------------------------------
  // Добавление/удаление из избранного
  // ------------------------------------------
  async toggleFavorite(userId: string, animeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { added: false };
    }

    await this.prisma.favorite.create({
      data: { userId, animeId },
    });

    return { added: true };
  }

  // ------------------------------------------
  // Получение избранного пользователя
  // ------------------------------------------
  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          anime: {
            include: { genres: true },
          },
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      data: favorites.map((f) => f.anime),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  // ------------------------------------------
  // История просмотров пользователя
  // ------------------------------------------
  async getWatchHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { watchedAt: 'desc' },
        include: {
          anime: {
            include: { genres: true },
          },
        },
      }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);

    return {
      data: history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }
}
