import { cache } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Получение списка аниме с фильтрами
 * Кэшируется на уровне React cache
 */
export const getAnimes = cache(async (params: {
  page?: number;
  limit?: number;
  search?: string;
  genres?: string[];
  year?: string;
  status?: string;
  rating?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.genres?.length) params.genres.forEach(g => searchParams.append('genres', g));
  if (params.year) searchParams.set('year', params.year);
  if (params.status) searchParams.set('status', params.status);
  if (params.rating) searchParams.set('rating', params.rating);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);

  const res = await fetch(`${API_URL}/anime?${searchParams.toString()}`, {
    next: { revalidate: 60 }, // ISR: обновление каждые 60 секунд
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch animes');
  }

  return res.json();
});

/**
 * Получение информации об аниме по ID
 */
export const getAnimeById = cache(async (id: string) => {
  const res = await fetch(`${API_URL}/anime/${id}`, {
    next: { revalidate: 300 }, // ISR: обновление каждые 5 минут
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch anime');
  }

  return res.json();
});

/**
 * Получение списка жанров
 */
export const getGenres = cache(async () => {
  const res = await fetch(`${API_URL}/anime/genres`, {
    next: { revalidate: 3600 }, // ISR: обновление каждые 1 час
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch genres');
  }

  return res.json();
});

/**
 * Получение популярных аниме
 */
export const getPopularAnimes = cache(async (limit = 10) => {
  const res = await fetch(`${API_URL}/anime/popular?limit=${limit}`, {
    next: { revalidate: 300 },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch popular animes');
  }

  return res.json();
});

/**
 * Получение новых аниме
 */
export const getNewAnimes = cache(async (limit = 10) => {
  const res = await fetch(`${API_URL}/anime/new?limit=${limit}`, {
    next: { revalidate: 300 },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch new animes');
  }

  return res.json();
});

/**
 * Авторизованный запрос к API
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
    cache: 'no-store', // Не кэшировать авторизованные запросы
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}
