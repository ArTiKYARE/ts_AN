import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Регистрация нового пользователя
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    // Проверка существования пользователя
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email или именем уже существует');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Генерация токенов
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  // Вход пользователя
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Поиск пользователя
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверка бана
    if (user.isBanned) {
      throw new UnauthorizedException(`Аккаунт заблокирован. Причина: ${user.banReason || 'Не указана'}`);
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Генерация токенов
    const tokens = await this.generateTokens(user.id, user.email, user.role);

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

  // Обновление токена доступа
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return tokens;
  }

  // Обновление профиля
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { username, avatar } = updateProfileDto;

    // Проверка уникальности username
    if (username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Такое имя пользователя уже занято');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  // Смена пароля
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Пароль успешно изменен' };
  }

  // Генерация access и refresh токенов
  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '1h' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // Валидация пользователя для Passport
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
