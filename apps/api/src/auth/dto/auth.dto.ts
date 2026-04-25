// ==========================================
// DTO для аутентификации
// ==========================================

import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Имя пользователя должно содержать минимум 3 символа' })
  @MaxLength(30, { message: 'Имя пользователя не должно превышать 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Имя может содержать только буквы, цифры и подчеркивание' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(50, { message: 'Пароль не должен превышать 50 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную и одну цифру' 
  })
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Введите пароль' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
