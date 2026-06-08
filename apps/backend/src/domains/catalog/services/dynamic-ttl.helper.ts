import { Product } from '../entities/product.entity';

export class DynamicTtlHelper {
  private static readonly MAX_TTL_SECONDS = 300; // 5 Minutes
  private static readonly MIN_TTL_SECONDS = 10; // Safeguard limit

  /**
   * Calculates product cache TTL dynamically based on upcoming price state changes (sale start/end).
   */
  static calculate(product: Product, now = new Date()): number {
    const transitionTimes: number[] = [];

    if (product.saleStartDate && product.saleStartDate > now) {
      transitionTimes.push(product.saleStartDate.getTime() - now.getTime());
    }

    if (product.saleEndDate && product.saleEndDate > now) {
      transitionTimes.push(product.saleEndDate.getTime() - now.getTime());
    }

    if (!transitionTimes.length) {
      return this.MAX_TTL_SECONDS;
    }

    const nextTransitionMs = Math.min(...transitionTimes);
    const nextTransitionSec = Math.floor(nextTransitionMs / 1000);

    return Math.min(
      this.MAX_TTL_SECONDS,
      Math.max(this.MIN_TTL_SECONDS, nextTransitionSec),
    );
  }
}
