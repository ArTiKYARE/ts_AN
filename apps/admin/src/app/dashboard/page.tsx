import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дашборд - Админ-панель',
};

/**
 * Страница дашборда админ-панели
 * Отображает статистику и быстрые действия
 */
export default function DashboardPage() {
  // Mock-данные для демонстрации (в реальности получать из API)
  const stats = [
    { label: 'Всего аниме', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Пользователей', value: '5,678', change: '+8%', trend: 'up' },
    { label: 'Просмотров за день', value: '45,678', change: '+23%', trend: 'up' },
    { label: 'Комментариев', value: '892', change: '-5%', trend: 'down' },
  ];

  const recentActivities = [
    { id: 1, action: 'Добавлено новое аниме', user: 'Admin', time: '5 мин назад' },
    { id: 2, action: 'Обновлены эпизоды', user: 'Moderator', time: '15 мин назад' },
    { id: 3, action: 'Заблокирован пользователь', user: 'Admin', time: '1 час назад' },
    { id: 4, action: 'Удалён комментарий', user: 'Moderator', time: '2 часа назад' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор статистики и последних событий
        </p>
      </div>

      {/* Карточки статистики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-2 text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Две колонки */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Последние действия */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Последние действия</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <span className="font-medium">+ Добавить аниме</span>
              <p className="text-xs text-muted-foreground mt-1">Создать новую карточку тайтла</p>
            </button>
            <button className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <span className="font-medium">+ Добавить эпизод</span>
              <p className="text-xs text-muted-foreground mt-1">Добавить серию к существующему аниме</p>
            </button>
            <button className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <span className="font-medium">📋 Модерация комментариев</span>
              <p className="text-xs text-muted-foreground mt-1">Проверить новые комментарии</p>
            </button>
            <button className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
              <span className="font-medium">👥 Управление пользователями</span>
              <p className="text-xs text-muted-foreground mt-1">Забанить/разбанить пользователей</p>
            </button>
          </div>
        </div>
      </div>

      {/* График просмотров (заглушка) */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Статистика просмотров</h2>
        <div className="h-64 bg-secondary/50 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">
            Здесь будет график просмотров (интеграция с Chart.js или Recharts)
          </p>
        </div>
      </div>
    </div>
  );
}
