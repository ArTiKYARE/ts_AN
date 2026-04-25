import Link from 'next/link';
import { Search, Menu, User, Heart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Логотип и навигация */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              AnimeStream
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/catalog" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Каталог
            </Link>
            <Link 
              href="/popular" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Популярное
            </Link>
            <Link 
              href="/new" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Новинки
            </Link>
          </nav>
        </div>

        {/* Поиск и действия */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Поиск */}
          <div className="relative hidden sm:block">
            <input
              type="search"
              placeholder="Поиск аниме..."
              className="w-64 h-10 pl-10 pr-4 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Избранное</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/history">
                <History className="h-5 w-5" />
                <span className="sr-only">История</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Профиль</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Меню</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
