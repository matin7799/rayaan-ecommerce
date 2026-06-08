import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../shared/redis/cache.service';

@Injectable()
export class CatalogInvalidationService {
  private readonly logger = new Logger(CatalogInvalidationService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalidates catalog cache records (lists and details) to prevent stale states on product changes.
   */
  async invalidateProductCache(slug: string): Promise<void> {
    this.logger.log(`Invalidating cache patterns for product slug=${slug}`);

    // Invalidate list caches
    await this.cacheService.invalidatePattern('catalog:list:*');

    // Invalidate specific product details across all channels (public, torob, partner)
    await this.cacheService.invalidatePattern(`catalog:detail*:${slug}`);
  }
}
