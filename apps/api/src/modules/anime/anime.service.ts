import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAnimeDto, UpdateAnimeDto, FilterAnimeDto } from './dto/anime.dto';

@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  // Получить список аниме с фильтрацией и пагинацией
  async findAll(filters: FilterAnimeDto) {
    const {
      page = 1,
      limit = 20,
      search,
      genres,
      year,
      status,
      rating,
      sort = 'popularity',
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Поиск по названию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { synonyms: { has: search } },
      ];
    }

    // Фильтр по жанрам
    if (genres && genres.length > 0) {
      where.genres = { hasSome: genres.split(',') };
    }

    // Фильтр по году
    if (year) {
      const [minYear, maxYear] = year.split('-').map(Number);
      where.year = {};
      if (minYear) where.year.gte = minYear;
      if (maxYear) where.year.lte = maxYear;
    }

    // Фильтр по статусу
    if (status) {
      where.status = status;
    }

    // Фильтр по рейтингу
    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    // Сортировка
    const orderBy: any = {};
    switch (sort) {
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'year':
        orderBy.year = 'desc';
        break;
      case 'title':
        orderBy.title = 'asc';
        break;
      case 'popularity':
      default:
        orderBy.popularity = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          episodeList: {
            select: {
              id: true,
              number: true,
              title: true,
            },
            orderBy: { number: 'asc' },
          },
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Получить одно аниме по ID
  async findOne(id: string) {
    const anime = await this.prisma.anime.findUnique({
      where: { id },
      include: {
        episodeList: {
          include: {
            videoSources: true,
          },
          orderBy: { number: 'asc' },
        },
        relatedAnime: {
          include: {
            animeTo: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                rating: true,
              },
            },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${id} не найдено`);
    }

    return anime;
  }

  // Создать аниме (admin)
  async create(createAnimeDto: CreateAnimeDto) {
    return this.prisma.anime.create({
      data: createAnimeDto,
    });
  }

  // Обновить аниме (admin)
  async update(id: string, updateAnimeDto: UpdateAnimeDto) {
    await this.findOne(id); // Проверка существования
    
    return this.prisma.anime.update({
      where: { id },
      data: updateAnimeDto,
    });
  }

  // Удалить аниме (admin)
  async remove(id: string) {
    await this.findOne(id); // Проверка существования
    
    return this.prisma.anime.delete({
      where: { id },
    });
  }

  // Получить похожие аниме
  async getRelated(id: string) {
    const anime = await this.prisma.anime.findUnique({
      where: { id },
      include: {
        relatedAnime: {
          include: {
            animeTo: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                rating: true,
                year: true,
              },
            },
          },
        },
      },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${id} не найдено`);
    }

    return anime.relatedAnime.map((rel) => ({
      ...rel.animeTo,
      relation: rel.relation,
    }));
  }
}
