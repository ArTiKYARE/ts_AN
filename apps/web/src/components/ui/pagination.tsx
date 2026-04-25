import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, any>;
}

/**
 * Компонент пагинации
 * Генерирует ссылки с сохранением всех query параметров
 */
export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl, 
  searchParams 
}: PaginationProps) {
  // Формирование URL с параметрами
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Генерация страниц для отображения
  const getVisiblePages = () => {
    const delta = 2; // Количество страниц вокруг текущей
    const range: (number | string)[] = [];
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Добавляем многоточие и первую/последнюю страницы
    if (currentPage - delta > 2) {
      range.unshift('...');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2">
      {/* Кнопка "Назад" */}
      <Link
        href={createPageUrl(currentPage - 1)}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors
          ${currentPage === 1 
            ? 'text-muted-foreground cursor-not-allowed' 
            : 'hover:bg-secondary'
          }
        `}
        prefetch={false}
      >
        <ChevronLeft size={16} />
        Назад
      </Link>

      {/* Номера страниц */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={createPageUrl(page as number)}
              className={`
                min-w-[40px] text-center px-3 py-2 rounded-md text-sm transition-colors
                ${page === currentPage
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'hover:bg-secondary'
                }
              `}
              prefetch={false}
            >
              {page}
            </Link>
          )
        ))}
      </div>

      {/* Кнопка "Вперёд" */}
      <Link
        href={createPageUrl(currentPage + 1)}
        className={`
          flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors
          ${currentPage === totalPages 
            ? 'text-muted-foreground cursor-not-allowed' 
            : 'hover:bg-secondary'
          }
        `}
        prefetch={false}
      >
        Вперёд
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
