import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCommentDto, UpdateCommentDto, FilterCommentsDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  // Получить комментарии с фильтрацией
  async findAll(filters: FilterCommentsDto) {
    const { animeId, sort = 'newest', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
      parentId: null, // Только корневые комментарии
    };

    if (animeId) {
      where.animeId = animeId;
    }

    // Сортировка
    const orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      case 'popular':
        orderBy.likes = 'desc';
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
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

  // Создать комментарий
  async create(userId: string, createCommentDto: CreateCommentDto) {
    const { content, parentId, animeId } = createCommentDto;

    // Если это ответ, проверяем существование родительского комментария
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.isDeleted) {
        throw new NotFoundException('Родительский комментарий не найден');
      }
    }

    return this.prisma.comment.create({
      data: {
        content,
        userId,
        parentId,
        animeId,
      },
      include: {
        user: {
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

  // Обновить комментарий
  async update(commentId: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверка прав (только автор может редактировать)
    if (comment.userId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои комментарии');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
        isEdited: true,
      },
      include: {
        user: {
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

  // Удалить комментарий (мягкое удаление)
  async remove(commentId: string, userId: string, isAdmin: boolean = false) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверка прав (автор или админ)
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Вы можете удалять только свои комментарии');
    }

    // Мягкое удаление
    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        content: '[Комментарий удален]',
      },
    });
  }

  // Лайк/дизлайк комментария
  async vote(commentId: string, userId: string, type: 'like' | 'dislike') {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.isDeleted) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем, голосовал ли уже пользователь
    const existingVote = await this.prisma.user.findFirst({
      where: {
        id: userId,
        likedComments: { some: { id: commentId } },
      },
    });

    const existingDislike = await this.prisma.user.findFirst({
      where: {
        id: userId,
        dislikedComments: { some: { id: commentId } },
      },
    });

    if (type === 'like') {
      // Удаляем существующие голоса
      if (existingVote) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { likedComments: { disconnect: { id: commentId } } },
        });
        await this.prisma.comment.update({
          where: { id: commentId },
          data: { likes: { decrement: 1 } },
        });
      } else {
        if (existingDislike) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { dislikedComments: { disconnect: { id: commentId } } },
          });
          await this.prisma.comment.update({
            where: { id: commentId },
            data: { dislikes: { decrement: 1 } },
          });
        }
        await this.prisma.user.update({
          where: { id: userId },
          data: { likedComments: { connect: { id: commentId } } },
        });
        await this.prisma.comment.update({
          where: { id: commentId },
          data: { likes: { increment: 1 } },
        });
      }
    } else {
      // Дизлайк
      if (existingDislike) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { dislikedComments: { disconnect: { id: commentId } } },
        });
        await this.prisma.comment.update({
          where: { id: commentId },
          data: { dislikes: { decrement: 1 } },
        });
      } else {
        if (existingVote) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { likedComments: { disconnect: { id: commentId } } },
          });
          await this.prisma.comment.update({
            where: { id: commentId },
            data: { likes: { decrement: 1 } },
          });
        }
        await this.prisma.user.update({
          where: { id: userId },
          data: { dislikedComments: { connect: { id: commentId } } },
        });
        await this.prisma.comment.update({
          where: { id: commentId },
          data: { dislikes: { increment: 1 } },
        });
      }
    }

    return this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
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

  // Модерация: скрыть/показать комментарий (для админов)
  async moderate(commentId: string, isDeleted: boolean) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted },
    });
  }
}
