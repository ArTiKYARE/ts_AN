// ==========================================
// Главный файл приложения NestJS
// ==========================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ------------------------------------------
  // Безопасность
  // ------------------------------------------
  app.use(helmet());
  app.enableCors({
    origin: [
      configService.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      configService.get('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3001'),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // ------------------------------------------
  // Сжатие и парсинг
  // ------------------------------------------
  app.use(compression());
  app.use(cookieParser());

  // ------------------------------------------
  // Валидация
  // ------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ------------------------------------------
  // Префикс API
  // ------------------------------------------
  app.setGlobalPrefix('api');

  // ------------------------------------------
  // Порт
  // ------------------------------------------
  const port = configService.get('API_PORT', 4000);
  await app.listen(port);

  console.log(`🚀 API запущен на порту ${port}`);
  console.log(`📡 URL: http://localhost:${port}/api`);
}

bootstrap();
