import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AnimeCard } from '@/components/anime/anime-card';
import { FilterPanel } from '@/components/anime/filter-panel';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/ui/loader';
import { getAnimes, getGenres } from '@/lib/api';

interface CatalogPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    genres?: string | string[];
    year?: string;
    status?: string;
    rating?: string;
    sort?: string;
    order?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Каталог аниме - AnimeStream',
    description: 'Смотрите аниме онлайн в хорошем качестве. Огромный каталог с фильтрами по жанрам, году и рейтингу.',
  };
}

/**
 * Страница каталога аниме
 * Поддерживает фильтрацию, поиск и пагинацию
 * Все параметры сохраняются в URL query params
 */
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;

  // Получение данных параллельно
  const [animesData, genres] = await Promise.all([
    getAnimes({
      page,
      limit,
      search: searchParams.search,
      genres: searchParams.genres 
        ? (Array.isArray(searchParams.genres) ? searchParams.genres : [searchParams.genres])
        : undefined,
      year: searchParams.year,
      status: searchParams.status as any,
      rating: searchParams.rating,
      sort: searchParams.sort,
      order: searchParams.order as 'asc' | 'desc',
    }),
    getGenres(),
  ]);

  const { data: animes, pagination } = animesData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Каталог аниме</h1>
        <p className="text-muted-foreground">
          Найдено {pagination.total} тайтлов
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Панель фильтров */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<Loader />}>
            <FilterPanel 
              genres={genres}
              currentFilters={{
                genres: searchParams.genres 
                  ? (Array.isArray(searchParams.genres) ? searchParams.genres : [searchParams.genres])
                  : [],
                year: searchParams.year,
                status: searchParams.status,
                rating: searchParams.rating,
                sort: searchParams.sort,
                order: searchParams.order,
              }}
            />
          </Suspense>
        </aside>

        {/* Список аниме */}
        <main className="flex-1">
          {animes.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Ничего не найдено</h2>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска или фильтры
              </p>
              <Link 
                href="/catalog"
                className="btn-primary"
              >
                Сбросить фильтры
              </Link>
            </div>
          ) : (
            <>
              {/* Сетка карточек */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {animes.map((anime: any) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>

              {/* Пагинация */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl="/catalog"
                  searchParams={searchParams}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
