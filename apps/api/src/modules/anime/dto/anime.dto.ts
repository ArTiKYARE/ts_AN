import { IsString, IsOptional, IsInt, IsEnum, Min, Max, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { AnimeStatus } from '@prisma/client';

/**
 * DTO для создания нового аниме
 */
export class CreateAnimeDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @IsString()
  @IsOptional()
  poster?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  trailerUrl?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;

  @IsEnum(AnimeStatus)
  @IsOptional()
  status?: AnimeStatus;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalEpisodes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studios?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  producers?: string[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  anilistId?: number;

  @IsString()
  @IsOptional()
  kitsuId?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

/**
 * DTO для обновления аниме
 */
export class UpdateAnimeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @IsString()
  @IsOptional()
  poster?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  trailerUrl?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;

  @IsEnum(AnimeStatus)
  @IsOptional()
  status?: AnimeStatus;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalEpisodes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studios?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  producers?: string[];

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO для фильтрации и поиска аниме
 */
export class FilterAnimeDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @IsString()
  @IsOptional()
  year?: string; // формат: "2020" или "2018-2023"

  @IsEnum(AnimeStatus)
  @IsOptional()
  status?: AnimeStatus;

  @IsString()
  @IsOptional()
  rating?: string; // минимальный рейтинг

  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO для создания эпизода
 */
export class CreateEpisodeDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  number: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  airDate?: string;
}

/**
 * DTO для источника видео
 */
export class CreateEpisodeSourceDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  type?: 'IFRAME' | 'HLS' | 'DIRECT' | 'EXTERNAL' = 'IFRAME';

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  priority?: number = 0;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

/**
 * DTO для озвучки
 */
export class CreateDubDto {
  @IsString()
  language: string;

  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
