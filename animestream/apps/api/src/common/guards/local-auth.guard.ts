/**
 * Guard для локальной аутентификации (email + пароль)
 * Используется только на эндпоинте логина
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
