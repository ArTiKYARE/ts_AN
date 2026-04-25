// ==========================================
// Контроллер аутентификации
// ==========================================

import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.userId);
    return { message: 'Выход выполнен успешно' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() dto: RefreshTokenDto, @Req() req: any) {
    const userId = req.user?.userId;
    
    if (!userId) {
      // Если нет пользователя в токене, пробуем получить из refresh токена
      // Это упрощенная реализация, в продакшене нужно доработать
      throw new Error('Требуется авторизация');
    }
    
    return this.authService.refreshTokens(userId, dto.refreshToken);
  }
}
