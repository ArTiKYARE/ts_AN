/**
 * Главный файл приложения NestJS
 * Точка входа для API сервиса AnimeStream
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // ============================================
  // БЕЗОПАСНОСТЬ
  // ============================================
  
  // Заголовки безопасности
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", "https:", "http:"], // Разрешаем iframe с видео
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
      },
    },
  }));

  // CORS настройки
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js web
      'http://localhost:3001', // Admin панель
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ============================================
  // ВАЛИДАЦИЯ И ТРАНСФОРМАЦИЯ
  // ============================================
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляем лишние свойства
      forbidNonWhitelisted: true, // Бросаем ошибку на лишние свойства
      transform: true, // Автоматическая трансформация типов
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ============================================
  // ФИЛЬТРЫ И ИНТЕРЦЕПТОРЫ
  // ============================================
  
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ============================================
  // ГЛОБАЛЬНЫЙ ПРЕФИКС API
  // ============================================
  
  const globalPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(globalPrefix);

  // ============================================
  // ЗАПУСК СЕРВЕРА
  // ============================================
  
  const port = configService.get<number>('API_PORT') || 4000;
  const host = configService.get<string>('API_HOST') || '0.0.0.0';
  
  await app.listen(port, host);
  
  console.log(`
╔════════════════════════════════════════════════╗
║           🎬 AnimeStream API запущен          ║
╠════════════════════════════════════════════════╣
║  URL: http://${host}:${port}                    ║
║  Префикс: /${globalPrefix}                       ║
║  Режим: ${process.env.NODE_ENV || 'development'}                          ║
╚════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('❌ Ошибка запуска приложения:', err);
  process.exit(1);
});
