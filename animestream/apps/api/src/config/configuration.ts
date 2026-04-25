/**
 * Конфигурация приложения
 * Загрузка переменных окружения и настройка параметров
 */

export default () => ({
  // ============================================
  // ОСНОВНЫЕ НАСТРОЙКИ
  // ============================================
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // ============================================
  // API НАСТРОЙКИ
  // ============================================
  api: {
    prefix: process.env.API_PREFIX || 'api',
    port: parseInt(process.env.API_PORT || '4000', 10),
    host: process.env.API_HOST || '0.0.0.0',
  },

  // ============================================
  // БАЗА ДАННЫХ (PostgreSQL)
  // ============================================
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true',
  },

  // ============================================
  // JWT АВТОРИЗАЦИЯ
  // ============================================
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // ============================================
  // КЭШИРОВАНИЕ
  // ============================================
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 час
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
  },

  // ============================================
  // ВНЕШНИЕ API (Anilist, Kitsu и др.)
  // ============================================
  externalApi: {
    anilist: {
      enabled: process.env.ANILIST_API_ENABLED !== 'false',
      endpoint: 'https://graphql.anilist.co',
      cacheTtl: parseInt(process.env.ANILIST_CACHE_TTL || '86400', 10), // 24 часа
    },
    kitsu: {
      enabled: process.env.KITSU_API_ENABLED === 'true',
      endpoint: 'https://kitsu.io/api/edge',
      cacheTtl: parseInt(process.env.KITSU_CACHE_TTL || '86400', 10),
    },
  },

  // ============================================
  // БЕЗОПАСНОСТЬ
  // ============================================
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimit: {
      short: {
        ttl: parseInt(process.env.RATE_LIMIT_SHORT_TTL || '1000', 10),
        limit: parseInt(process.env.RATE_LIMIT_SHORT_LIMIT || '3', 10),
      },
      medium: {
        ttl: parseInt(process.env.RATE_LIMIT_MEDIUM_TTL || '60000', 10),
        limit: parseInt(process.env.RATE_LIMIT_MEDIUM_LIMIT || '30', 10),
      },
      long: {
        ttl: parseInt(process.env.RATE_LIMIT_LONG_TTL || '3600000', 10),
        limit: parseInt(process.env.RATE_LIMIT_LONG_LIMIT || '500', 10),
      },
    },
  },

  // ============================================
  // URL ФРОНТЕНДА
  // ============================================
  frontend: {
    webUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  },

  // ============================================
  // ЗАГРУЗКА МЕДИА
  // ============================================
  media: {
    maxPosterSize: parseInt(process.env.MAX_POSTER_SIZE || '5242880', 10), // 5MB
    maxBannerSize: parseInt(process.env.MAX_BANNER_SIZE || '10485760', 10), // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
});
