// ==========================================
// Сервис комментариев
// ==========================================

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------
  // Создание комментария
  // ------------------------------------------
  async create(userId: string, dto: CreateCommentDto) {
    // Проверка существования аниме если указан animeId
    if (dto.animeId) {
      const anime = await this.prisma.anime.findUnique({
        where: { id: dto.animeId },
      });

      if (!anime) {
        throw new NotFoundException('Аниме не найдено');
      }
    }

    // Проверка родительского комментария если есть
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.isDeleted) {
        throw new BadRequestException('Родительский комментарий не найден или удален');
      }

      // Проверка что это не ответ на ответ (только 1 уровень вложенности)
      if (parent.parentId) {
        throw new BadRequestException('Вложенность комментариев ограничена одним уровнем');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: userId,
        animeId: dto.animeId,
        parentId: dto.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: { username: true },
            },
          },
        },
      },
    });
  }

  // ------------------------------------------
  // Получение комментариев для аниме
  // ------------------------------------------
  async findByAnime(animeId: string, page: number = 1, limit: number = 20, sortBy: 'newest' | 'popular' = 'newest') {
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    if (sortBy === 'newest') {
      orderBy.createdAt = 'desc';
    } else if (sortBy === 'popular') {
      orderBy.likes = 'desc';
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          animeId,
          parentId: null, // Только корневые комментарии
          isDeleted: false,
          isHidden: false,
        },
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
            },
          },
          replies: {
            where: {
              isDeleted: false,
              isHidden: false,
            },
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.comment.count({
        where: {
          animeId,
          parentId: null,
          isDeleted: false,
          isHidden: false,
        },
      }),
    ]);

    return {
      data: comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  // ------------------------------------------
  // Обновление комментария (только автор)
  // ------------------------------------------
  async update(commentId: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Можно редактировать только свои комментарии');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Нельзя редактировать удаленный комментарий');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: dto.content,
        isEdited: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  // ------------------------------------------
  // Удаление комментария (мягкое удаление)
  // ------------------------------------------
  async remove(commentId: string, userId: string, isAdmin: boolean = false) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Удалять можно только свои комментарии или будучи админом/модератором
    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Можно удалять только свои комментарии');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        content: '[Комментарий удален]',
      },
    });
  }

  // ------------------------------------------
  // Лайк/дизлайк комментария
  // ------------------------------------------
  async toggleLike(commentId: string, userId: string, type: 'like' | 'dislike') {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Нельзя лайкать свой комментарий
    if (comment.authorId === userId) {
      throw new BadRequestException('Нельзя лайкать свой комментарий');
    }

    // Простая реализация без хранения кто лайкнул (в продакшене нужна отдельная таблица)
    const incrementField = type === 'like' ? 'likes' : 'dislikes';
    
    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        [incrementField]: { increment: 1 },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  // ------------------------------------------
  // Модерация: скрыть/показать комментарий (админ/модератор)
  // ------------------------------------------
  async moderate(commentId: string, isHidden: boolean) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isHidden },
    });
  }

  // ------------------------------------------
  // Закрепить/открепить комментарий (админ/модератор)
  // ------------------------------------------
  async pin(commentId: string, isPinned: boolean) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isPinned },
    });
  }
}
