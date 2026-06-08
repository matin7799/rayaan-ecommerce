import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function checkOtpRateLimit(
  phone: string,
  clientIp: string,
  redis: Redis,
  configService: ConfigService,
): Promise<void> {
  const rateLimitKey = `otp:ratelimit:${phone}:${clientIp}`;
  const count = await redis.incr(rateLimitKey);

  if (count === 1) {
    const windowSeconds =
      configService.get<number>('redis.otpRateLimit.windowSeconds') ?? 600;
    await redis.expire(rateLimitKey, windowSeconds);
  }

  const maxAttempts =
    configService.get<number>('redis.otpRateLimit.maxAttempts') ?? 3;

  if (count > maxAttempts) {
    const ttl = await redis.ttl(rateLimitKey);
    throw new HttpException(
      {
        code: 'OTP_RATE_LIMITED',
        message: 'Too many OTP requests. Please try again later.',
        retryAfter: ttl,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
