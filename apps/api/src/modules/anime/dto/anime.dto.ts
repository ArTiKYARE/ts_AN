import { IsString, IsOptional, IsInt, IsArray, IsEnum, Min, Max, IsNumber } from 'class-validator';
import { AnimeStatus, Season, SourceType } from '@prisma/client';

// DTO для создания аниме
export class CreateAnimeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleNative?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @IsOptional()
  @IsEnum(Season)
  season?: Season;

  @IsOptional()
  @IsInt()
  @Min(0)
  episodes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studios?: string[];

  @IsOptional()
  @IsEnum(SourceType)
  source?: SourceType;
}

// DTO для обновления аниме
export class UpdateAnimeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleNative?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @IsOptional()
  @IsEnum(Season)
  season?: Season;

  @IsOptional()
  @IsInt()
  @Min(0)
  episodes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studios?: string[];

  @IsOptional()
  @IsEnum(SourceType)
  source?: SourceType;
}

// DTO для фильтрации и поиска
export class FilterAnimeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  genres?: string; // CSV формат: "action,adventure"

  @IsOptional()
  @IsString()
  year?: string; // диапазон: "2020-2024"

  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @IsOptional()
  @IsString()
  rating?: string; // минимальный рейтинг

  @IsOptional()
  @IsString()
  sort?: string = 'popularity'; // popularity, rating, year, title
}

// DTO для ответа с пагинацией
export class AnimeResponseDto {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
