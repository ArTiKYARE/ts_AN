// ==========================================
// Декоратор для проверки ролей
// ==========================================

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для ограничения доступа по ролям
 * @param roles - Массив разрешенных ролей
 * 
 * @example
 * @Roles(Role.ADMIN, Role.MODERATOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
