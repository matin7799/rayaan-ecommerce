// backend/src/shared/redis/redis.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT } from './redis.constants';

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
          // Enable lazy connect to avoid blocking app startup
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn(
                '⚠️ Redis unavailable after 3 retries — running without cache',
              );
              return null; // stop retrying
            }
            return Math.min(times * 200, 2000);
          },
          maxRetriesPerRequest: 3,
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
        });

        redis.on('error', (err) => {
          console.warn(
            '⚠️ Redis connection error (caching disabled):',
            err.message,
          );
        });

        // Attempt connection but don't block
        redis.connect().catch((err) => {
          console.warn(
            '⚠️ Redis initial connection failed (caching disabled):',
            err.message,
          );
        });

        return redis;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class RedisModule {}
