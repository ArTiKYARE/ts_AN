/**
 * Guard для защиты роутов с JWT аутентификацией
 * Используется для защищённых эндпоинтов
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Дополнительная логика проверки
   */
  canActivate(context: ExecutionContext) {
    // Добавляем дополнительную логику если нужно
    return super.canActivate(context);
  }

  /**
   * Обработка ошибок аутентификации
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new Error('Требуется авторизация');
    }
    return user;
  }
}
