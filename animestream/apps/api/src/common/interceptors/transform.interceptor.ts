/**
 * Интерцептор для трансформации ответов API
 * Оборачивает успешные ответы в единый формат
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseMeta {
  statusCode: number;
  timestamp: string;
  path: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ResponseMeta;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map((data) => {
        // Если данные уже имеют формат ответа, возвращаем как есть
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // ============================================
        // ФОРМИРОВАНИЕ ЕДИНОГО ОТВЕТА
        // ============================================
        const response: ApiResponse<T> = {
          success: true,
          data,
          meta: {
            statusCode: context.switchToHttp().getResponse().statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
          },
        };

        // Добавляем сообщение если есть
        if (request.flashMessage) {
          response.message = request.flashMessage;
        }

        return response;
      }),
    );
  }
}
