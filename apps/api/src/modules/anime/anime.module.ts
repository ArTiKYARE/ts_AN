import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AnimeController } from './anime.controller';
import { AnimeService } from './anime.service';

@Module({
  controllers: [AnimeController],
  providers: [AnimeService, PrismaService],
  exports: [AnimeService],
})
export class AnimeModule {}
