/**
 * Глобальный фильтр исключений
 * Перехватывает все ошибки и форматирует ответ в едином стиле
 */

import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  stack?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ============================================
    // ОПРЕДЕЛЕНИЕ СТАТУСА И СООБЩЕНИЯ
    // ============================================
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Внутренняя ошибка сервера';
    let error = 'Internal Server Error';
    let detailedMessage: string | string[] = message;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        detailedMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || message;
        detailedMessage = resp.message || message;
        error = resp.error || error;
      }
      
      error = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      detailedMessage = exception.message;
      error = exception.name;
      
      // Логирование только для 5xx ошибок
      this.logger.error(
        `Необработанная ошибка: ${exception.message}`,
        exception.stack,
      );
    }

    // ============================================
    // ФОРМИРОВАНИЕ ОТВЕТА
    // ============================================
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: detailedMessage,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Добавляем stack trace только в development режиме
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // ============================================
    // ОТПРАВКА ОТВЕТА
    // ============================================
    response.status(status).json(errorResponse);
  }
}
