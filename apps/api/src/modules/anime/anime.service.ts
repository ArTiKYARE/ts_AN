import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAnimeDto, UpdateAnimeDto, FilterAnimeDto } from './dto/anime.dto';

/**
 * Сервис для работы с аниме-контентом
 * Реализует CRUD операции, поиск, фильтрацию и интеграцию с внешними API
 */
@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить список аниме с пагинацией и фильтрами
   */
  async findAll(dto: FilterAnimeDto) {
    const {
      page = 1,
      limit = 20,
      search,
      genres,
      year,
      status,
      rating,
      sort = 'createdAt',
      order = 'desc',
    } = dto;

    const skip = (page - 1) * limit;

    // Построение условия where для фильтрации
    const where: any = {
      isActive: true,
    };

    // Поиск по названию и синонимам
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { synonyms: { has: search } },
      ];
    }

    // Фильтр по жанрам
    if (genres && genres.length > 0) {
      where.genres = {
        some: {
          slug: { in: genres },
        },
      };
    }

    // Фильтр по году
    if (year) {
      const [minYear, maxYear] = year.split('-').map(Number);
      where.year = minYear && maxYear 
        ? { gte: minYear, lte: maxYear }
        : { equals: minYear || maxYear };
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
    const orderBy = { [sort]: order };

    // Получение данных и общего количества
    const [animes, total] = await Promise.all([
      this.prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: true,
          _count: {
            select: { episodes: true, favorites: true },
          },
        },
      }),
      this.prisma.anime.count({ where }),
    ]);

    return {
      data: animes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить аниме по ID
   */
  async findOne(id: string) {
    const anime = await this.prisma.anime.findUnique({
      where: { id },
      include: {
        genres: true,
        episodes: {
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
        comments: {
          where: { status: 'VISIBLE', parentId: null },
          include: {
            author: {
              select: { id, username, avatar },
            },
            replies: {
              include: {
                author: {
                  select: { id, username, avatar },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    // Увеличение счётчика просмотров
    await this.prisma.anime.update({
      where: { id },
      data: { views: { increment: 1n } },
    });

    return anime;
  }

  /**
   * Получить аниме по slug (URL-friendly название)
   */
  async findBySlug(slug: string) {
    const anime = await this.prisma.anime.findFirst({
      where: {
        isActive: true,
        OR: [
          { title: { contains: slug, mode: 'insensitive' } },
          { synonyms: { has: slug } },
        ],
      },
      include: {
        genres: true,
        episodes: {
          orderBy: { number: 'asc' },
          take: 1, // Только первый эпизод для превью
        },
      },
    });

    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    return anime;
  }

  /**
   * Создать новое аниме (администратор)
   */
  async create(dto: CreateAnimeDto) {
    // Проверка на существование по external ID
    if (dto.anilistId) {
      const existing = await this.prisma.anime.findUnique({
        where: { anilistId: dto.anilistId },
      });

      if (existing) {
        throw new ConflictException('Аниме с таким Anilist ID уже существует');
      }
    }

    // Создание жанров если их нет
    const genreIds = await this.upsertGenres(dto.genres || []);

    const anime = await this.prisma.anime.create({
      data: {
        ...dto,
        genres: {
          connect: genreIds.map((id) => ({ id })),
        },
      },
      include: { genres: true },
    });

    return anime;
  }

  /**
   * Обновить аниме (администратор)
   */
  async update(id: string, dto: UpdateAnimeDto) {
    const anime = await this.prisma.anime.findUnique({ where: { id } });

    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    // Обновление жанров если переданы
    let genresData;
    if (dto.genres) {
      const genreIds = await this.upsertGenres(dto.genres);
      genresData = {
        set: [], // Сначала отключаем все
        connect: genreIds.map((gid) => ({ id: gid })),
      };
    }

    const updated = await this.prisma.anime.update({
      where: { id },
      data: {
        ...dto,
        genres: genresData,
      },
      include: { genres: true },
    });

    return updated;
  }

  /**
   * Удалить аниме (мягкое удаление - установка isActive = false)
   */
  async remove(id: string) {
    const anime = await this.prisma.anime.findUnique({ where: { id } });

    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    return this.prisma.anime.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Получить популярные аниме
   */
  async getPopular(limit = 10) {
    return this.prisma.anime.findMany({
      where: { isActive: true },
      orderBy: { views: 'desc' },
      take: limit,
      include: { genres: true },
    });
  }

  /**
   * Получить новые аниме
   */
  async getNew(limit = 10) {
    return this.prisma.anime.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { genres: true },
    });
  }

  /**
   * Получить случайное аниме
   */
  async getRandom() {
    const count = await this.prisma.anime.count({
      where: { isActive: true },
    });

    const random = Math.floor(Math.random() * count);

    return this.prisma.anime.findFirst({
      where: { isActive: true },
      skip: random,
      include: { genres: true },
    });
  }

  /**
   * Вспомогательный метод для создания/поиска жанров
   */
  private async upsertGenres(genreNames: string[]) {
    const genreIds: string[] = [];

    for (const name of genreNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const genre = await this.prisma.genre.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
        },
        select: { id: true },
      });

      genreIds.push(genre.id);
    }

    return genreIds;
  }

  /**
   * Получить все жанры
   */
  async getAllGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
