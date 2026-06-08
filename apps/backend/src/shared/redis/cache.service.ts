// apps/backend/src/shared/redis/cache.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Cache service for caching API responses in Redis.
 * Reduces database load and speeds up frequently-accessed endpoints.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Get a cached value by key.
   * Returns null if not found or if Redis is unavailable.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(
        `Cache GET error for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Set a cached value with TTL (seconds).
   * Silently ignores errors so caching failure never breaks the app.
   */
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
    } catch (error) {
      this.logger.warn(
        `Cache SET error for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a specific cache key.
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(
        `Cache DEL error for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Invalidate all cache keys matching a pattern (e.g., "catalog:*").
   * Uses SCAN for safe, non-blocking key deletion.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          50,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(
        `Cache invalidate error for pattern "${pattern}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Helper: generate a consistent cache key for catalog queries.
   */
  static catalogListKey(
    query: Record<string, unknown>,
    channel?: string,
  ): string {
    const sorted = Object.keys(query)
      .sort()
      .reduce(
        (acc, key) => {
          if (
            query[key] !== undefined &&
            query[key] !== null &&
            query[key] !== ''
          ) {
            acc[key] = query[key];
          }
          return acc;
        },
        {} as Record<string, unknown>,
      );
    const channelPart = channel ? `:${channel}` : '';
    return `catalog:list${channelPart}:${JSON.stringify(sorted)}`;
  }

  /**
   * Helper: generate cache key for a product detail by slug.
   */
  static catalogDetailKey(slug: string, channel?: string): string {
    const channelPart = channel ? `:${channel}` : '';
    return `catalog:detail${channelPart}:${slug}`;
  }

  /**
   * Helper: generate cache key for banners by position.
   */
  static bannersKey(position?: string): string {
    return `banners:${position ?? 'all'}`;
  }

  /**
   * Helper: generate cache key for categories.
   */
  static categoriesKey(): string {
    return 'categories:tree';
  }
}
