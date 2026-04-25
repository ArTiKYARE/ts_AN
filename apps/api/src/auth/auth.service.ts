// ==========================================
// Сервис аутентификации
// ==========================================

import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ------------------------------------------
  // Регистрация нового пользователя
  // ------------------------------------------
  async register(dto: RegisterDto) {
    // Проверка существующего email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Проверка существующего username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Пользователь с таким именем уже существует');
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Создание пользователя
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    // Генерация токенов
    const tokens = await this.generateTokens(user.id, user.role);

    // Сохранение refresh токена (можно добавить в БД для отзыва)
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ------------------------------------------
  // Вход в систему
  // ------------------------------------------
  async login(dto: LoginDto) {
    // Поиск пользователя
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверка статуса
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Обновление времени последнего входа
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Генерация токенов
    const tokens = await this.generateTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  // ------------------------------------------
  // Выход из системы
  // ------------------------------------------
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ------------------------------------------
  // Обновление токенов
  // ------------------------------------------
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Неверный refresh токен');
    }

    const tokens = await this.generateTokens(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ------------------------------------------
  // Валидация пользователя для Passport
  // ------------------------------------------
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  // ------------------------------------------
  // Генерация JWT токенов
  // ------------------------------------------
  private async generateTokens(userId: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        sub: userId,
        role,
      }),
      this.jwtService.signAsync({
        sub: userId,
        role,
      }, {
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // ------------------------------------------
  // Обновление refresh токена в БД
  // ------------------------------------------
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
