/**
 * DTO для аутентификации
 * Валидация входящих данных с помощью class-validator
 */

import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email адрес' })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({ example: 'animefan', description: 'Имя пользователя', minLength: 3, maxLength: 30 })
  @IsString({ message: 'Username должен быть строкой' })
  @MinLength(3, { message: 'Username должен содержать минимум 3 символа' })
  @MaxLength(30, { message: 'Username не должен превышать 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, { 
    message: 'Username может содержать только буквы, цифры и подчёркивание',
  })
  @IsNotEmpty({ message: 'Username обязателен' })
  username: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Пароль', minLength: 8, maxLength: 50 })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(50, { message: 'Пароль не должен превышать 50 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email адрес' })
  @IsEmail({}, { message: 'Некорректный email адрес' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Пароль' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh токен' })
  @IsString({ message: 'Refresh токен должен быть строкой' })
  @IsNotEmpty({ message: 'Refresh токен обязателен' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Старый пароль' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Старый пароль обязателен' })
  oldPassword: string;

  @ApiProperty({ description: 'Новый пароль', minLength: 8, maxLength: 50 })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Новый пароль должен содержать минимум 8 символов' })
  @MaxLength(50, { message: 'Пароль не должен превышать 50 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
  })
  newPassword: string;
}
