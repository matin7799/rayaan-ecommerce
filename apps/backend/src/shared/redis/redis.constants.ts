// apps/backend/src/shared/redis/redis.constants.ts

/**
 * Injection token for the Redis client.
 * Extracted to its own file to avoid circular imports between
 * redis.module.ts and cache.service.ts
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';
