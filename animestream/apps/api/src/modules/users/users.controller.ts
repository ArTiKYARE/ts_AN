/**
 * Контроллер пользователей
 * Публичные и административные эндпоинты
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import type { UpdateUserDto } from './users.service';
import type { Role, UserStatus } from '@animestream/database';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Получение текущего пользователя
   * GET /api/users/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    
    if (!user) {
      return { error: 'Пользователь не найден' };
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      status: user.status,
      settings: user.settings,
      createdAt: user.createdAt,
    };
  }

  /**
   * Обновление текущего пользователя
   * PUT /api/users/me
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.userId, dto);
    
    return {
      message: 'Профиль обновлён',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
    };
  }

  /**
   * Получение пользователя по ID (публично)
   * GET /api/users/:id
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    
    if (!user) {
      return { error: 'Пользователь не найден' };
    }

    // Возвращаем только публичные данные
    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  // ============================================
  // АДМИНИСТРАТИВНЫЕ ЭНДПОИНТЫ
  // ============================================

  /**
   * Получение списка всех пользователей (админка)
   * GET /api/users/admin/list
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('status') status?: UserStatus,
  ) {
    return this.usersService.findAll({ page, limit, search, role, status });
  }

  /**
   * Обновление пользователя администратором
   * PUT /api/users/admin/:id
   */
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateUserByAdmin(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const user = await this.usersService.updateByAdmin(id, dto);
    
    return {
      message: 'Пользователь обновлён',
      user,
    };
  }

  /**
   * Бан пользователя
   * POST /api/users/admin/:id/ban
   */
  @Post('admin/:id/ban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async banUser(@Param('id') id: string) {
    const user = await this.usersService.ban(id);
    
    return {
      message: 'Пользователь заблокирован',
      user,
    };
  }

  /**
   * Разбан пользователя
   * POST /api/users/admin/:id/unban
   */
  @Post('admin/:id/unban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async unbanUser(@Param('id') id: string) {
    const user = await this.usersService.unban(id);
    
    return {
      message: 'Пользователь разблокирован',
      user,
    };
  }

  /**
   * Удаление пользователя
   * DELETE /api/users/admin/:id
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(id);
    
    return { message: 'Пользователь удалён' };
  }

  /**
   * Статистика пользователей
   * GET /api/users/admin/stats
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUsersStats() {
    return this.usersService.getStats();
  }
}
