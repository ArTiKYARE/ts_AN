/**
 * Guard для проверки прав администратора
 * Используется вместе с JwtAuthGuard
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Требуется авторизация');
    }

    // Проверка роли пользователя
    const allowedRoles = ['ADMIN', 'MODERATOR'];
    
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Доступ запрещён. Требуются права администратора или модератора');
    }

    return true;
  }
}
