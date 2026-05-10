// backend/src/shared/redis/redis.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * ثابت برای تزریق وابستگی Redis
 * هرجا بخوایم Redis رو inject کنیم از این token استفاده می‌کنیم
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * ماژول سراسری Redis
 * با @Global() دیگه نیازی نیست هر ماژولی جداگانه import کنه
 * یک بار توی AppModule ثبت میشه و همه‌جا قابل دسترسه
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService): Redis => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
          db: configService.get<number>('REDIS_DB', 0),
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis connection error:', err);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
