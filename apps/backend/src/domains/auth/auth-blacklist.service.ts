import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';

@Injectable()
export class AuthBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Blacklists a token for the remainder of its lifespan.
   */
  async blacklistToken(token: string, expirySeconds: number): Promise<void> {
    if (expirySeconds <= 0) return;
    await this.redis.setex(
      `token:blacklist:${token}`,
      expirySeconds,
      'revoked',
    );
  }

  /**
   * Checks if a token has been blacklisted.
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`token:blacklist:${token}`);
    return result !== null;
  }
}
