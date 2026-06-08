import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CartLockService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /**
   * Safely acquires a lock for cart modifications using a spin-wait pattern.
   * Lock auto-expires after 3 seconds to prevent permanent deadlocks.
   */
  async acquireLock(
    userId: string,
    retries = 5,
    delayMs = 100,
  ): Promise<boolean> {
    const key = `lock:cart:${userId}`;
    const token = 'locked';

    for (let attempt = 0; attempt < retries; attempt++) {
      const acquired = await this.redis.set(key, token, 'PX', 3000, 'NX');
      if (acquired === 'OK') return true;
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return false;
  }

  /**
   * Explicitly releases the lock.
   */
  async releaseLock(userId: string): Promise<void> {
    const key = `lock:cart:${userId}`;
    await this.redis.del(key);
  }
}
