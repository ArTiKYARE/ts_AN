// ==========================================
// Адаптер для внешнего API (Anilist/Shikimori)
// Реализует паттерн Adapter для абстракции от конкретного API
// ==========================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

/**
 * Интерфейс для маппинга данных из внешнего API
 */
export interface ExternalAnimeData {
  id: string;
  title: string;
  titleNative?: string;
  synonyms: string[];
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  trailerUrl?: string;
  year?: number;
  season?: string;
  episodes?: number;
  duration?: number;
  status: 'ONGOING' | 'COMPLETED' | 'ANNOUNCED' | 'CANCELLED' | 'HIATUS';
  rating?: number;
  genres: string[];
  studios: string[];
}

@Injectable()
export class ExternalApiAdapter {
  private readonly logger = new Logger(ExternalApiAdapter.name);
  private readonly apiClient: AxiosInstance;
  private readonly enabled: boolean;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const apiUrl = this.configService.get('ANIME_API_URL', 'https://graphql.anilist.co');
    const apiKey = this.configService.get('ANIME_API_KEY');
    
    this.enabled = !!apiKey;

    this.apiClient = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      timeout: this.configService.get('EXTERNAL_API_TIMEOUT', 5000),
    });
  }

  /**
   * Поиск аниме по названию во внешнем API
   */
  async searchAnime(query: string, limit: number = 10): Promise<ExternalAnimeData[]> {
    const cacheKey = `external:search:${query}:${limit}`;
    
    // Проверка кэша
    const cached = await this.cacheManager.get<ExternalAnimeData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Если API не настроен, возвращаем пустой массив
      if (!this.enabled) {
        return [];
      }

      // GraphQL запрос к Anilist
      const response = await this.apiClient.post('', {
        query: `
          query ($search: String, $perPage: Int) {
            Page(perPage: $perPage) {
              media(search: $search, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage { large }
                bannerImage
                startDate { year }
                season
                episodes
                duration
                status
                averageScore
                genres
                studios { nodes { name } }
              }
            }
          }
        `,
        variables: {
          search: query,
          perPage: limit,
        },
      });

      const results = response.data.data.Page.media.map((item: any) => 
        this.mapToInternalModel(item)
      );

      // Кэширование результата
      const ttl = this.configService.get('EXTERNAL_CACHE_TTL', 3600);
      await this.cacheManager.set(cacheKey, results, ttl);

      return results;
    } catch (error) {
      this.logger.error(`Ошибка при поиске аниме: ${error.message}`);
      return [];
    }
  }

  /**
   * Получение подробной информации об аниме
   */
  async getAnimeDetails(externalId: string): Promise<ExternalAnimeData | null> {
    const cacheKey = `external:details:${externalId}`;
    
    const cached = await this.cacheManager.get<ExternalAnimeData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (!this.enabled) {
        return null;
      }

      const response = await this.apiClient.post('', {
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage { large }
              bannerImage
              startDate { year }
              season
              episodes
              duration
              status
              averageScore
              genres
              studios { nodes { name } }
            }
          }
        `,
        variables: { id: parseInt(externalId) },
      });

      const result = this.mapToInternalModel(response.data.data.Media);
      
      const ttl = this.configService.get('EXTERNAL_CACHE_TTL', 3600);
      await this.cacheManager.set(cacheKey, result, ttl);

      return result;
    } catch (error) {
      this.logger.error(`Ошибка при получении деталей аниме: ${error.message}`);
      return null;
    }
  }

  /**
   * Маппинг данных из внешнего API во внутреннюю модель
   */
  private mapToInternalModel(data: any): ExternalAnimeData {
    const statusMap: Record<string, string> = {
      'RELEASING': 'ONGOING',
      'FINISHED': 'COMPLETED',
      'NOT_YET_RELEASED': 'ANNOUNCED',
      'CANCELLED': 'CANCELLED',
      'HIATUS': 'HIATUS',
    };

    return {
      id: data.id.toString(),
      title: data.title.english || data.title.romaji || 'Без названия',
      titleNative: data.title.native,
      synonyms: [],
      description: data.description?.replace(/<[^>]*>/g, '') || '',
      coverImage: data.coverImage?.large,
      bannerImage: data.bannerImage,
      trailerUrl: null,
      year: data.startDate?.year,
      season: data.season,
      episodes: data.episodes || 0,
      duration: data.duration,
      status: statusMap[data.status] || 'ONGOING',
      rating: data.averageScore ? data.averageScore / 10 : undefined,
      genres: data.genres || [],
      studios: data.studios?.nodes?.map((s: any) => s.name) || [],
    };
  }
}
