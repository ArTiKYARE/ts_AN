// ==========================================
// Главный файл приложения NestJS
// ==========================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // ------------------------------------------
  // Безопасность
  // ------------------------------------------
  app.use(helmet({
    contentSecurityPolicy: false, // Отключаем для iframe с видео
    crossOriginEmbedderPolicy: false,
  }));
  
  app.enableCors({
    origin: [
      configService.get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
      configService.get('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3001'),
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
  // Swagger документация
  // ------------------------------------------
  const config = new DocumentBuilder()
    .setTitle('AnimeStream API')
    .setDescription('API для сервиса просмотра аниме AnimeStream')
    .setVersion('1.0')
    .addTag('Аниме', 'Операции с аниме-контентом')
    .addTag('Auth', 'Аутентификация и авторизация')
    .addTag('Пользователи', 'Управление пользователями')
    .addTag('Комментарии', 'Система комментариев')
    .addTag('Админка', 'Административные endpoints')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Введите JWT токен в формате: Bearer <token>',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'AnimeStream API Docs',
  });

  // ------------------------------------------
  // Порт
  // ------------------------------------------
  const port = configService.get('API_PORT', 4000);
  await app.listen(port);

  logger.log(`🚀 API запущен на порту ${port}`);
  logger.log(`📡 URL: http://localhost:${port}/api`);
  logger.log(`📚 Swagger: http://localhost:${port}/docs`);
}

bootstrap();
