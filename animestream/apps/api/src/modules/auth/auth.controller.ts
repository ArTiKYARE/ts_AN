/**
 * Контроллер аутентификации
 * Обработка запросов регистрации, входа, выхода
 */

import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  AuthenticatedRequest,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        avatar: result.user.avatar,
      },
      tokens: result.tokens,
    };
  }

  /**
   * Вход пользователя
   * POST /api/auth/login
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any) {
    const tokens = await this.authService.generateTokens(req.user);
    
    return {
      message: 'Успешный вход',
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        avatar: req.user.avatar,
      },
      tokens,
    };
  }

  /**
   * Выход пользователя
   * POST /api/auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: AuthenticatedRequest, @Body('refreshToken') refreshToken: string) {
    await this.authService.logout(req.user.userId, refreshToken);
    return { message: 'Успешный выход' };
  }

  /**
   * Обновление токенов
   * POST /api/auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return {
      message: 'Токены обновлены',
      tokens,
    };
  }

  /**
   * Проверка текущего пользователя
   * GET /api/auth/me
   */
  @Post('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return {
      user: {
        id: req.user.userId,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    };
  }

  /**
   * Запрос на восстановление пароля
   * POST /api/auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { 
      message: 'Если пользователь с таким email существует, инструкция по восстановлению отправлена' 
    };
  }

  /**
   * Сброс пароля по токену
   * POST /api/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('password') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Пароль успешно изменён' };
  }
}
