/**
 * Сервис пользователей
 * Работа с базой данных через Prisma
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@animestream/database';
import * as bcrypt from 'bcryptjs';
import type { User, Role, UserStatus } from '@animestream/database';

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  role?: Role;
}

export interface UpdateUserDto {
  username?: string;
  avatar?: string;
  bio?: string;
}

export interface AdminUpdateUserDto extends UpdateUserDto {
  email?: string;
  role?: Role;
  status?: UserStatus;
}

@Injectable()
export class UsersService {
  /**
   * Создание нового пользователя
   */
  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username,
        avatar: dto.avatar,
        bio: dto.bio,
        role: dto.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Поиск пользователя по ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
  }

  /**
   * Поиск пользователя по email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Поиск пользователя по username
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Валидация пароля пользователя
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Возвращаем пользователя без пароля
    const { password: _, ...result } = user;
    return result as User;
  }

  /**
   * Проверка пароля
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Обновление профиля пользователя
   */
  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверка уникальности username если он меняется
    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.findByUsername(dto.username);
      if (existingUser) {
        throw new BadRequestException('Такой username уже занят');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Обновление пользователя администратором
   */
  async updateByAdmin(userId: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверка уникальности email если он меняется
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Такой email уже используется');
      }
    }

    // Проверка уникальности username если он меняется
    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.findByUsername(dto.username);
      if (existingUser) {
        throw new BadRequestException('Такой username уже занят');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Обновление пароля
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Добавление refresh токена
   */
  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  /**
   * Удаление refresh токена
   */
  async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  /**
   * Удаление всех refresh токенов
   */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Проверка наличия refresh токена
   */
  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const token = await prisma.refreshToken.findFirst({
      where: {
        userId,
        token: refreshToken,
      },
    });

    if (!token) {
      return false;
    }

    // Проверка срока действия
    if (token.expiresAt < new Date()) {
      await this.removeRefreshToken(userId, refreshToken);
      return false;
    }

    return true;
  }

  /**
   * Получение списка пользователей (для админки)
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    status?: UserStatus;
  }) {
    const { page = 1, limit = 20, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Бан пользователя
   */
  async ban(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'BANNED' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });
  }

  /**
   * Разбан пользователя
   */
  async unban(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });
  }

  /**
   * Удаление пользователя
   */
  async delete(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Статистика пользователей
   */
  async getStats() {
    const [total, active, banned, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'BANNED' } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      banned,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
