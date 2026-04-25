/**
 * Компонент загрузчика (спиннер)
 */
export function Loader({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-secondary border-t-primary rounded-full animate-spin`}
      />
    </div>
  );
}

/**
 * Компонент скелетона для загрузки карточек
 */
export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-secondary" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-3 bg-secondary rounded w-1/2" />
        <div className="flex gap-1">
          <div className="h-5 bg-secondary rounded w-16" />
          <div className="h-5 bg-secondary rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент скелетона для страницы аниме
 */
export function AnimePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Шапка с постером */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-secondary rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-secondary rounded w-1/2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded animate-pulse" />
            <div className="h-4 bg-secondary rounded animate-pulse" />
            <div className="h-4 bg-secondary rounded w-5/6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Список эпизодов */}
      <div className="space-y-4">
        <div className="h-8 bg-secondary rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-video bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
