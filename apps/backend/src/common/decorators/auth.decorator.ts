// apps/backend/src/common/decorators/auth.decorator.ts

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

/**
 * دکوراتور ترکیبی احراز هویت
 * ابتدا JwtAuthGuard اجرا می‌شود (بررسی توکن)
 * سپس RolesGuard (بررسی نقش — فقط اگر @Roles() روی متد باشد)
 */
export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard));
}
