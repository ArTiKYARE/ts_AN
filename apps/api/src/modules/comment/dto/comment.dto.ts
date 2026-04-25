import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

// DTO для создания комментария
export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(2000, { message: 'Комментарий не должен превышать 2000 символов' })
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string; // Для ответов на комментарии

  @IsOptional()
  @IsUUID()
  animeId?: string; // Привязка к аниме (опционально)
}

// DTO для обновления комментария
export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(2000, { message: 'Комментарий не должен превышать 2000 символов' })
  content: string;
}

// DTO для лайка/дизлайка
export class VoteCommentDto {
  @IsOptional()
  @IsUUID()
  commentId?: string;
}

// DTO для фильтрации комментариев
export class FilterCommentsDto {
  @IsOptional()
  @IsUUID()
  animeId?: string;

  @IsOptional()
  sort?: string = 'newest'; // newest, oldest, popular

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;
}
