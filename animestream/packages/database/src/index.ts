/**
 * Экспорт Prisma клиента и утилит для работы с БД
 * Пакет @animestream/database
 */

import { PrismaClient } from '@prisma/client';

// Глобальный экземпляр Prisma для предотвращения множественных подключений в dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Экспорт типов
export type { 
  Prisma,
  User,
  Anime,
  Episode,
  Genre,
  Studio,
  Comment,
  Favorite,
  WatchHistory,
  VideoSource,
  Dub,
  Role,
  AnimeStatus,
  UserStatus,
  SourceType,
} from '@prisma/client';

// Экспорт констант enum
export { 
  Role,
  AnimeStatus,
  UserStatus,
  SourceType,
} from '@prisma/client';

/**
 * Функция для безопасного отключения подключения к БД
 * Используется при хот-релоаде в разработке
 */
export async function disconnectPrisma() {
  if (process.env.NODE_ENV === 'development') {
    await prisma.$disconnect();
  }
}

/**
 * healthcheck для проверки подключения к БД
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    return false;
  }
}

export default prisma;
