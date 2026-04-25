/**
 * Стратегия JWT аутентификации
 * Проверка access токена в заголовке Authorization
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../modules/auth/auth.service';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Извлечение токена из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Валидация JWT токена
   * Вызывается автоматически после расшифровки токена
   */
  async validate(payload: JwtPayload): Promise<any> {
    // Проверка пользователя в БД (вдруг он был удалён или заблокирован)
    const user = await this.authService.validateUser(payload);
    
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Ваш аккаунт заблокирован');
    }

    // Возвращаем данные для request.user
    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
