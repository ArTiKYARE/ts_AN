// ==========================================
// Prisma сервис для работы с БД
// ==========================================

import { Injectable, OnModuleInit, OnModuleShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Сервис для работы с базой данных через Prisma ORM
 * Реализует жизненный цикл подключения и отключения от БД
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleShutdown {
  
  /**
   * Подключение к базе данных при инициализации модуля
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Подключение к базе данных установлено');
  }

  /**
   * Отключение от базы данных при завершении работы модуля
   */
  async onModuleShutdown() {
    await this.$disconnect();
    console.log('🔌 Подключение к базе данных закрыто');
  }

  /**
   * Очистка базы данных (для тестов)
   */
  async cleanDatabase() {
    const models = [
      this.adminLog,
      this.appSetting,
      this.apiCache,
      this.watchHistory,
      this.favorite,
      this.comment,
      this.dub,
      this.episodeSource,
      this.episode,
      this.genre,
      this.anime,
      this.refreshToken,
      this.user,
    ];

    // Удаляем данные в обратном порядке зависимостей
    for (const model of models) {
      await model.deleteMany({});
    }
  }
}
