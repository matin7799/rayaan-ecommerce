import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  limit: number;
  ttl: number;
}

export const Throttle = (limit: number, ttl: number) =>
  SetMetadata(THROTTLE_KEY, { limit, ttl });

// Predefined throttle configurations
export const ThrottleAuth = () => Throttle(5, 60000); // 5 requests per minute
export const ThrottleOtp = () => Throttle(3, 600000); // 3 requests per 10 minutes
