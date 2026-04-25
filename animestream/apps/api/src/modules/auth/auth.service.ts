/**
 * Сервис аутентификации
 * Регистрация, вход, генерация JWT токенов
 */

import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import type { User, CreateUserDto } from '../users/users.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(dto: CreateUserDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Проверка существования пользователя
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Проверка уникальности username
    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Такой username уже занят');
    }

    // Создание пользователя
    const user = await this.usersService.create(dto);

    // Генерация токенов
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Вход пользователя (логин + пароль)
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Поиск пользователя
    const user = await this.usersService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверка статуса пользователя
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Ваш аккаунт заблокирован');
    }

    // Генерация токенов
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  /**
   * Выход пользователя (удаление refresh токена)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId, refreshToken);
  }

  /**
   * Обновление access токена через refresh токен
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Проверка refresh токена
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') || this.configService.get<string>('jwt.secret'),
      });

      // Получение пользователя
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Проверка наличия токена в БД
      const tokenExists = await this.usersService.verifyRefreshToken(user.id, refreshToken);
      
      if (!tokenExists) {
        throw new UnauthorizedException('Токен недействителен');
      }

      // Генерация новых токенов
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  /**
   * Генерация пары токенов (access + refresh)
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret') || this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn'),
      }),
    ]);

    // Сохранение refresh токена в БД
    await this.usersService.addRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Извлечение данных пользователя из JWT токена
   */
  async validateUser(payload: AuthPayload): Promise<User | null> {
    return this.usersService.findById(payload.userId);
  }

  /**
   * Смена пароля пользователя
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Проверка старого пароля
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const isOldPasswordValid = await this.usersService.validatePassword(user, oldPassword);
    
    if (!isOldPasswordValid) {
      throw new BadRequestException('Неверный старый пароль');
    }

    // Обновление пароля
    await this.usersService.updatePassword(userId, newPassword);

    // Удаление всех refresh токенов для безопасности
    await this.usersService.removeAllRefreshTokens(userId);
  }

  /**
   * Восстановление пароля (отправка email)
   */
  async forgotPassword(email: string): Promise<void> {
    // TODO: Реализовать отправку email со ссылкой на сброс пароля
    // Для безопасности всегда возвращаем успех, даже если email не найден
    console.log(`Запрос на восстановление пароля для: ${email}`);
  }

  /**
   * Сброс пароля по токену
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Реализовать сброс пароля по токену
    throw new BadRequestException('Функционал в разработке');
  }
}
