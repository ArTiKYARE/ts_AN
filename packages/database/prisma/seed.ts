// ==========================================
// Сидирование базы данных
// ==========================================

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало сидирования базы данных...');

  // ------------------------------------------
  // Создание администратора
  // ------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@animestream.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminUsername = process.env.ADMIN_USERNAME || 'SuperAdmin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
        role: Role.ADMIN,
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Администратор создан: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Администратор уже существует: ${adminEmail}`);
  }

  // ------------------------------------------
  // Создание жанров
  // ------------------------------------------
  const genresData = [
    { name: 'Экшен', slug: 'action' },
    { name: 'Приключения', slug: 'adventure' },
    { name: 'Комедия', slug: 'comedy' },
    { name: 'Драма', slug: 'drama' },
    { name: 'Фэнтези', slug: 'fantasy' },
    { name: 'Ужасы', slug: 'horror' },
    { name: 'Мистика', slug: 'mystery' },
    { name: 'Романтика', slug: 'romance' },
    { name: 'Научная фантастика', slug: 'sci-fi' },
    { name: 'Повседневность', slug: 'slice-of-life' },
    { name: 'Спорт', slug: 'sports' },
    { name: 'Триллер', slug: 'thriller' },
    { name: 'Сверхъестественное', slug: 'supernatural' },
    { name: 'Военный', slug: 'military' },
    { name: 'Исторический', slug: 'historical' },
    { name: 'Школа', slug: 'school' },
    { name: 'Сёнен', slug: 'shonen' },
    { name: 'Сёдзё', slug: 'shojo' },
    { name: 'Сэйнэн', slug: 'seinen' },
    { name: 'Дзёсэй', slug: 'josei' },
    { name: 'Меха', slug: 'mecha' },
    { name: 'Музыка', slug: 'music' },
    { name: 'Психология', slug: 'psychology' },
    { name: 'Киберпанк', slug: 'cyberpunk' },
  ];

  for (const genre of genresData) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  console.log(`✅ Жанры созданы: ${genresData.length}`);

  // ------------------------------------------
  // Создание студий
  // ------------------------------------------
  const studiosData = [
    { name: 'Studio Ghibli' },
    { name: 'Madhouse' },
    { name: 'Toei Animation' },
    { name: 'Bones' },
    { name: 'MAPPA' },
    { name: 'Wit Studio' },
    { name: 'Kyoto Animation' },
    { name: 'A-1 Pictures' },
    { name: 'Production I.G' },
    { name: 'Sunrise' },
  ];

  for (const studio of studiosData) {
    await prisma.studio.upsert({
      where: { name: studio.name },
      update: {},
      create: studio,
    });
  }

  console.log(`✅ Студии созданы: ${studiosData.length}`);

  // ------------------------------------------
  // Системные настройки по умолчанию
  // ------------------------------------------
  const systemSettings = [
    {
      key: 'site_name',
      value: 'AnimeStream',
      type: 'string',
      category: 'general',
      description: 'Название сайта',
    },
    {
      key: 'site_description',
      value: 'Смотрите аниме онлайн бесплатно в хорошем качестве',
      type: 'string',
      category: 'general',
      description: 'Описание сайта',
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'system',
      description: 'Режим обслуживания',
    },
    {
      key: 'registration_enabled',
      value: 'true',
      type: 'boolean',
      category: 'auth',
      description: 'Разрешить регистрацию',
    },
    {
      key: 'default_player',
      value: 'default',
      type: 'string',
      category: 'player',
      description: 'Плеер по умолчанию',
    },
    {
      key: 'available_players',
      value: JSON.stringify(['Kodik', 'Alloha', 'Sibnet', 'YouTube']),
      type: 'json',
      category: 'player',
      description: 'Доступные плееры',
    },
    {
      key: 'cache_ttl',
      value: '3600',
      type: 'number',
      category: 'system',
      description: 'Время жизни кэша (секунды)',
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Системные настройки созданы: ${systemSettings.length}`);

  // ------------------------------------------
  // Тестовые данные для разработки (только dev)
  // ------------------------------------------
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Создание тестовых данных для разработки...');

    // Тестовый пользователь
    const testUserEmail = 'user@example.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: testUserEmail },
    });

    if (!existingUser) {
      const passwordHash = await bcrypt.hash('password123', 10);

      await prisma.user.create({
        data: {
          email: testUserEmail,
          username: 'TestUser',
          passwordHash,
          role: Role.USER,
          status: 'ACTIVE',
        },
      });

      console.log('✅ Тестовый пользователь создан: user@example.com / password123');
    }

    // Тестовое аниме
    const actionGenre = await prisma.genre.findFirst({ where: { slug: 'action' } });
    const comedyGenre = await prisma.genre.findFirst({ where: { slug: 'comedy' } });
    const studio = await prisma.studio.findFirst();

    if (actionGenre && comedyGenre && studio) {
      const existingAnime = await prisma.anime.findFirst({
        where: { title: 'Тестовое Аниме' },
      });

      if (!existingAnime) {
        const anime = await prisma.anime.create({
          data: {
            title: 'Тестовое Аниме',
            titleNative: 'Test Anime',
            description: 'Это тестовое аниме для разработки и тестирования функционала.',
            coverImage: 'https://via.placeholder.com/300x450?text=Test+Anime',
            bannerImage: 'https://via.placeholder.com/1920x500?text=Test+Anime+Banner',
            year: 2024,
            season: 'WINTER',
            episodes: 12,
            duration: 24,
            status: 'ONGOING',
            rating: 8.5,
            popularity: 1000,
            genres: {
              connect: [{ id: actionGenre.id }, { id: comedyGenre.id }],
            },
            studios: {
              connect: [{ id: studio.id }],
            },
          },
        });

        // Создание эпизодов
        for (let i = 1; i <= 3; i++) {
          await prisma.episode.create({
            data: {
              animeId: anime.id,
              number: i,
              title: `Эпизод ${i}`,
              sources: {
                create: {
                  name: 'Test Player',
                  type: 'IFRAME',
                  url: `https://example.com/embed/episode-${i}`,
                  priority: 1,
                  isActive: true,
                  dubs: {
                    create: {
                      name: 'Test Dub',
                      language: 'russian',
                      isDefault: true,
                    },
                  },
                },
              },
            },
          });
        }

        console.log('✅ Тестовое аниме создано с 3 эпизодами');
      }
    }
  }

  console.log('🎉 Сидирование завершено успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
