import { Metadata } from 'next';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Menu
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Админ-панель - AnimeStream',
  description: 'Панель администратора для управления контентом',
};

/**
 * Корневой макет админ-панели
 * Включает боковую навигацию и основную область контента
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = [
    { href: '/admin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { href: '/admin/content', label: 'Контент', icon: Film },
    { href: '/admin/users', label: 'Пользователи', icon: Users },
    { href: '/admin/comments', label: 'Комментарии', icon: MessageSquare },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Боковая панель (десктоп) */}
      <aside className="hidden md:flex flex-col w-64 border-r fixed h-full">
        {/* Логотип */}
        <div className="p-6 border-b">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            AnimeStream <span className="text-xs text-muted-foreground">Admin</span>
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Кнопка выхода */}
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Мобильная шапка */}
      <header className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-background z-50">
        <Link href="/admin/dashboard" className="font-bold">
          AnimeStream Admin
        </Link>
        <button className="p-2 hover:bg-secondary rounded-lg">
          <Menu size={24} />
        </button>
      </header>

      {/* Основной контент */}
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
