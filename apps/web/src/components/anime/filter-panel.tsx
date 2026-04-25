'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { X } from 'lucide-react';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface FilterPanelProps {
  genres: Genre[];
  currentFilters: {
    genres?: string[];
    year?: string;
    status?: string;
    rating?: string;
    sort?: string;
    order?: string;
  };
}

/**
 * Панель фильтров для каталога аниме
 * Все изменения сразу применяются и сохраняются в URL
 */
export function FilterPanel({ genres, currentFilters }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [yearRange, setYearRange] = useState(currentFilters.year || '');

  // Статусы аниме
  const statuses = [
    { value: 'ONGOING', label: 'Онгоинг' },
    { value: 'COMPLETED', label: 'Завершён' },
    { value: 'ANNOUNCED', label: 'Анонс' },
    { value: 'CANCELLED', label: 'Отменён' },
  ];

  // Варианты сортировки
  const sorts = [
    { value: 'createdAt', label: 'По дате добавления' },
    { value: 'rating', label: 'По рейтингу' },
    { value: 'year', label: 'По году' },
    { value: 'title', label: 'По названию' },
    { value: 'views', label: 'По просмотрам' },
  ];

  // Обновление параметров URL
  const updateFilters = useCallback((updates: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    // Сброс на первую страницу при изменении фильтров
    params.delete('page');
    
    router.push(`/catalog?${params.toString()}`);
  }, [router, searchParams]);

  // Обработчик выбора жанра
  const toggleGenre = (slug: string) => {
    const current = currentFilters.genres || [];
    const updated = current.includes(slug)
      ? current.filter(g => g !== slug)
      : [...current, slug];
    
    updateFilters({ genres: updated.length > 0 ? updated : undefined });
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    setYearRange('');
    updateFilters({
      genres: undefined,
      year: undefined,
      status: undefined,
      rating: undefined,
      sort: undefined,
      order: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Фильтры</h2>
        {(currentFilters.genres?.length || currentFilters.status || currentFilters.year) && (
          <button
            onClick={resetFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X size={14} />
            Сбросить
          </button>
        )}
      </div>

      {/* Жанры */}
      <div>
        <h3 className="text-sm font-medium mb-3">Жанры</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const isSelected = currentFilters.genres?.includes(genre.slug);
            return (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.slug)}
                className={`
                  text-xs px-3 py-1.5 rounded-full transition-colors
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Статус */}
      <div>
        <h3 className="text-sm font-medium mb-3">Статус</h3>
        <select
          value={currentFilters.status || ''}
          onChange={(e) => updateFilters({ status: e.target.value || undefined })}
          className="w-full bg-secondary border-0 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Любой</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Год */}
      <div>
        <h3 className="text-sm font-medium mb-3">Год выхода</h3>
        <input
          type="text"
          value={yearRange}
          onChange={(e) => setYearRange(e.target.value)}
          onBlur={() => updateFilters({ year: yearRange || undefined })}
          placeholder="Например: 2020 или 2018-2023"
          className="w-full bg-secondary border-0 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Один год или диапазон
        </p>
      </div>

      {/* Рейтинг */}
      <div>
        <h3 className="text-sm font-medium mb-3">Минимальный рейтинг</h3>
        <select
          value={currentFilters.rating || ''}
          onChange={(e) => updateFilters({ rating: e.target.value || undefined })}
          className="w-full bg-secondary border-0 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Любой</option>
          <option value="9">9+ ★ Шедевр</option>
          <option value="8">8+ ★ Отлично</option>
          <option value="7">7+ ★ Хорошо</option>
          <option value="6">6+ ★ Нормально</option>
        </select>
      </div>

      {/* Сортировка */}
      <div>
        <h3 className="text-sm font-medium mb-3">Сортировка</h3>
        <div className="space-y-2">
          <select
            value={currentFilters.sort || 'createdAt'}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full bg-secondary border-0 rounded-md px-3 py-2 text-sm"
          >
            {sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => updateFilters({ order: 'desc' })}
              className={`flex-1 text-xs px-3 py-1.5 rounded-md transition-colors ${
                currentFilters.order !== 'asc' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              По убыванию
            </button>
            <button
              onClick={() => updateFilters({ order: 'asc' })}
              className={`flex-1 text-xs px-3 py-1.5 rounded-md transition-colors ${
                currentFilters.order === 'asc'
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              По возрастанию
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
