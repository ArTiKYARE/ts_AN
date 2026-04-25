/**
 * Стратегия локальной аутентификации (email + пароль)
 * Используется Passport.js с стратегией local
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Используем email вместо username
      passwordField: 'password',
    });
  }

  /**
   * Валидация учётных данных
   * Вызывается автоматически при использовании LocalAuthGuard
   */
  async validate(email: string, password: string): Promise<any> {
    const result = await this.authService.login(email, password);
    
    if (!result.user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Возвращаем объект пользователя для добавления в request.user
    return {
      id: result.user.id,
      email: result.user.email,
      username: result.user.username,
      role: result.user.role,
      status: result.user.status,
    };
  }
}
