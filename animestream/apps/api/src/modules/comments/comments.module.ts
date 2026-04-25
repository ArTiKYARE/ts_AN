/**
 * Модуль комментариев
 * Комментарии к аниме и эпизодам, лайки/дизлайки
 */

import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
