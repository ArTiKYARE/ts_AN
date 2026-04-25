/**
 * Seed скрипт для заполнения базы данных начальными данными
 * Запускается через: npm run db:seed
 */

import { PrismaClient, Role, AnimeStatus, SourceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало seed-заполнения базы данных...');

  // ============================================
  // 1. Создаём администратора и тестовых пользователей
  // ============================================
  console.log('📝 Создание пользователей...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@animestream.local' },
    update: {},
    create: {
      email: 'admin@animestream.local',
      password: hashedPassword,
      username: 'admin',
      role: Role.ADMIN,
      bio: 'Администратор AnimeStream',
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'mod@animestream.local' },
    update: {},
    create: {
      email: 'mod@animestream.local',
      password: hashedPassword,
      username: 'moderator',
      role: Role.MODERATOR,
      bio: 'Модератор контента',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'user@animestream.local' },
    update: {},
    create: {
      email: 'user@animestream.local',
      password: hashedPassword,
      username: 'animefan',
      role: Role.USER,
      bio: 'Любитель аниме',
    },
  });

  console.log(`✅ Пользователи созданы: ${admin.username}, ${moderator.username}, ${testUser.username}`);

  // ============================================
  // 2. Создаём жанры
  // ============================================
  console.log('📚 Создание жанров...');

  const genresData = [
    { name: 'Экшен', slug: 'ekshen' },
    { name: 'Приключения', slug: 'priklyucheniya' },
    { name: 'Комедия', slug: 'komediya' },
    { name: 'Драма', slug: 'drama' },
    { name: 'Фэнтези', slug: 'fentezi' },
    { name: 'Ужасы', slug: 'uzhasy' },
    { name: 'Мистика', slug: 'mistika' },
    { name: 'Романтика', slug: 'romantika' },
    { name: 'Школа', slug: 'shkola' },
    { name: 'Повседневность', slug: 'povsednevnost' },
    { name: 'Научная фантастика', slug: 'nauchnaya-fantastika' },
    { name: 'Киберпанк', slug: 'kiberpank' },
    { name: 'Сёнен', slug: 'syonen' },
    { name: 'Сёдзё', slug: 'syodzyo' },
    { name: 'Сэйнэн', slug: 'seynen' },
    { name: 'Дзёсэй', slug: 'dzosej' },
    { name: 'Спорт', slug: 'sport' },
    { name: 'Музыка', slug: 'muzyka' },
    { name: 'Исекай', slug: 'isekaj' },
    { name: 'Военное', slug: 'voennoe' },
  ];

  const genres: Record<string, any> = {};
  
  for (const genre of genresData) {
    const created = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
    genres[genre.slug] = created;
  }

  console.log(`✅ Создано жанров: ${genresData.length}`);

  // ============================================
  // 3. Создаём студии
  // ============================================
  console.log('🎬 Создание студий...');

  const studiosData = [
    { name: 'Studio Ghibli', slug: 'studio-ghibli' },
    { name: 'Madhouse', slug: 'madhouse' },
    { name: 'Toei Animation', slug: 'toei-animation' },
    { name: 'Pierrot', slug: 'pierrot' },
    { name: 'Bones', slug: 'bones' },
    { name: 'MAPPA', slug: 'mappa' },
    { name: 'Wit Studio', slug: 'wit-studio' },
    { name: 'A-1 Pictures', slug: 'a1-pictures' },
    { name: 'Kyoto Animation', slug: 'kyoto-animation' },
    { name: 'Production I.G', slug: 'production-ig' },
  ];

  const studios: Record<string, any> = {};

  for (const studio of studiosData) {
    const created = await prisma.studio.upsert({
      where: { slug: studio.slug },
      update: {},
      create: studio,
    });
    studios[studio.slug] = created;
  }

  console.log(`✅ Создано студий: ${studiosData.length}`);

  // ============================================
  // 4. Создаём тестовые аниме
  // ============================================
  console.log('🎞 Создание аниме...');

  const anime1 = await prisma.anime.create({
    data: {
      title: 'Атака титанов',
      slug: 'ataka-titanov',
      description: 'Человечество столетиями живёт за огромными стенами, защищающими от гигантских человекоподобных существ — Титанов. Но однажды стены оказываются пробиты, и начинается борьба за выживание.',
      poster: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=Attack+on+Titan',
      banner: 'https://via.placeholder.com/1920x600/1a1a2e/ffffff?text=Attack+on+Titan+Banner',
      trailer: 'https://www.youtube.com/watch?v=LHtdKWJdif4',
      year: 2013,
      status: AnimeStatus.COMPLETED,
      rating: 9.0,
      votes: 15000,
      externalId: '16498',
      source: 'anilist',
      genres: {
        connect: [
          { id: genres['ekshen'].id },
          { id: genres['drama'].id },
          { id: genres['fentezi'].id },
        ],
      },
      studios: {
        connect: [
          { id: studios['wit-studio'].id },
          { id: studios['mappa'].id },
        ],
      },
    },
  });

  // Создаём эпизоды для первого аниме
  for (let i = 1; i <= 5; i++) {
    await prisma.episode.create({
      data: {
        animeId: anime1.id,
        number: i,
        title: `Эпизод ${i}`,
        duration: 1440, // 24 минуты
        videoSources: {
          create: [
            {
              name: 'Kodik',
              type: SourceType.IFRAME,
              url: `https://example.com/player/anime1/episode${i}`,
              priority: 10,
              isActive: true,
              dubs: {
                create: [
                  { name: 'AniLibria', lang: 'ru', isDefault: true },
                  { name: 'SHIZA Project', lang: 'ru' },
                  { name: 'Оригинал', lang: 'ja' },
                ],
              },
            },
            {
              name: 'Alloha',
              type: SourceType.IFRAME,
              url: `https://example.com/player/aloha/anime1/episode${i}`,
              priority: 5,
              isActive: true,
              dubs: {
                create: [
                  { name: 'Alloha', lang: 'ru', isDefault: true },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const anime2 = await prisma.anime.create({
    data: {
      title: 'Ван Пис',
      slug: 'van-pis',
      description: 'Манки Д. Луффи мечтает стать Королём Пиратов и найти легендарное сокровище Ван Пис. Вместе со своей командой он путешествует по опасным морям Гранд Лайн.',
      poster: 'https://via.placeholder.com/300x450/162133/ffffff?text=One+Piece',
      banner: 'https://via.placeholder.com/1920x600/162133/ffffff?text=One+Piece+Banner',
      trailer: 'https://www.youtube.com/watch?v=S8_YwFLCh4U',
      year: 1999,
      status: AnimeStatus.ONGOING,
      rating: 8.9,
      votes: 20000,
      externalId: '21',
      source: 'anilist',
      genres: {
        connect: [
          { id: genres['ekshen'].id },
          { id: genres['priklyucheniya'].id },
          { id: genres['komediya'].id },
          { id: genres['fentezi'].id },
        ],
      },
      studios: {
        connect: [{ id: studios['toei-animation'].id }],
      },
    },
  });

  const anime3 = await prisma.anime.create({
    data: {
      title: 'Тетрадь смерти',
      slug: 'tetrad-smerti',
      description: 'Старшеклассник Лайт Ягами находит тетрадь, которая позволяет убить любого человека, чьё имя и лицо он знает. Решив очистить мир от зла, он становится объектом охоты гениального детектива L.',
      poster: 'https://via.placeholder.com/300x450/0f0f0f/ffffff?text=Death+Note',
      banner: 'https://via.placeholder.com/1920x600/0f0f0f/ffffff?text=Death+Note+Banner',
      trailer: 'https://www.youtube.com/watch?v=NlJZ-YgAt-c',
      year: 2006,
      status: AnimeStatus.COMPLETED,
      rating: 9.1,
      votes: 18000,
      externalId: '1535',
      source: 'anilist',
      genres: {
        connect: [
          { id: genres['mistika'].id },
          { id: genres['drama'].id },
          { id: genres['seynen'].id },
        ],
      },
      studios: {
        connect: [{ id: studios['madhouse'].id }],
      },
    },
  });

  // Создаём связь между аниме (сиквел/приквел)
  await prisma.relatedAnime.create({
    data: {
      fromId: anime1.id,
      toId: anime2.id,
      relationType: 'alternative',
    },
  });

  console.log(`✅ Создано аниме: ${anime1.title}, ${anime2.title}, ${anime3.title}`);

  // ============================================
  // 5. Создаём системные настройки
  // ============================================
  console.log('⚙️ Создание системных настроек...');

  const settingsData = [
    { key: 'site_name', value: 'AnimeStream', category: 'general', type: 'string', description: 'Название сайта' },
    { key: 'site_description', value: 'Смотри аниме онлайн бесплатно', category: 'general', type: 'string', description: 'Описание сайта' },
    { key: 'cache_ttl', value: '3600', category: 'cache', type: 'number', description: 'Время жизни кэша в секундах' },
    { key: 'anilist_api_enabled', value: 'true', category: 'api', type: 'boolean', description: 'Включить интеграцию с Anilist' },
    { key: 'default_player', value: 'kodik', category: 'player', type: 'string', description: 'Плеер по умолчанию' },
    { key: 'available_dubs', value: '["russian", "japanese", "english"]', category: 'player', type: 'json', description: 'Доступные озвучки' },
  ];

  for (const setting of settingsData) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Создано системных настроек: ${settingsData.length}`);

  // ============================================
  // Итог
  // ============================================
  console.log('\n✅ Seed-заполнение завершено успешно!');
  console.log('\n📊 Статистика:');
  console.log(`   - Пользователей: 3 (admin, moderator, user)`);
  console.log(`   - Жанров: ${genresData.length}`);
  console.log(`   - Студий: ${studiosData.length}`);
  console.log(`   - Аниме: 3`);
  console.log(`   - Эпизодов: 5`);
  console.log(`   - Системных настроек: ${settingsData.length}`);
  console.log('\n🔐 Учётные данные для входа:');
  console.log('   Admin: admin@animestream.local / admin123');
  console.log('   Moderator: mod@animestream.local / admin123');
  console.log('   User: user@animestream.local / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при seed-заполнении:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
