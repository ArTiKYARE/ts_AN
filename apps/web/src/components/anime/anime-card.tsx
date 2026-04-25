import Image from 'next/image';
import Link from 'next/link';

interface AnimeCardProps {
  anime: {
    id: string;
    title: string;
    poster?: string | null;
    rating?: number | null;
    year?: number | null;
    status: string;
    genres?: Array<{ id: string; name: string; slug: string }>;
    _count?: {
      episodes?: number;
      favorites?: number;
    };
  };
}

/**
 * Карточка аниме для каталога
 * Отображает постер, название, рейтинг и основную информацию
 */
export function AnimeCard({ anime }: AnimeCardProps) {
  const statusColors: Record<string, string> = {
    ONGOING: 'bg-green-500',
    COMPLETED: 'bg-blue-500',
    ANNOUNCED: 'bg-yellow-500',
    CANCELLED: 'bg-red-500',
  };

  const statusLabels: Record<string, string> = {
    ONGOING: 'Онгоинг',
    COMPLETED: 'Завершён',
    ANNOUNCED: 'Анонс',
    CANCELLED: 'Отменён',
  };

  return (
    <Link 
      href={`/anime/${anime.id}`}
      className="group block bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Постер с бейджами */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={anime.poster || '/images/placeholder-poster.jpg'}
          alt={anime.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          priority={false}
        />
        
        {/* Статус */}
        <div className={`absolute top-2 left-2 ${statusColors[anime.status] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded`}>
          {statusLabels[anime.status] || anime.status}
        </div>

        {/* Рейтинг */}
        {anime.rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>★</span>
            {anime.rating.toFixed(1)}
          </div>
        )}

        {/* Количество эпизодов */}
        {anime._count?.episodes !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {anime._count.episodes} эп.
          </div>
        )}

        {/* Оверлей при наведении */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white font-medium">Подробнее</span>
        </div>
      </div>

      {/* Информация */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {anime.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {anime.year && <span>{anime.year}</span>}
          {anime.genres && anime.genres.length > 0 && (
            <>
              <span>•</span>
              <span className="line-clamp-1">{anime.genres[0].name}</span>
            </>
          )}
        </div>

        {/* Жанры тегами */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
              >
                {genre.name}
              </span>
            ))}
            {anime.genres.length > 3 && (
              <span className="text-xs text-muted-foreground px-1.5 py-0.5">
                +{anime.genres.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
