// apps/backend/src/common/decorators/optional-auth.decorator.ts

import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

/**
 * دکوراتور احراز هویت اختیاری
 * اگر توکن وجود داشته باشد، کاربر را احراز هویت می‌کند
 * اگر توکن نباشد، اجازه دسترسی می‌دهد (برای کاربران مهمان)
 */
export function OptionalAuth() {
  return applyDecorators(UseGuards(OptionalJwtAuthGuard));
}
