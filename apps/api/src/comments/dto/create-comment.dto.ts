// ==========================================
// DTO для комментариев
// ==========================================

import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(5000, { message: 'Комментарий не должен превышать 5000 символов' })
  content: string;

  @IsOptional()
  @IsUUID()
  animeId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(5000, { message: 'Комментарий не должен превышать 5000 символов' })
  content: string;
}
