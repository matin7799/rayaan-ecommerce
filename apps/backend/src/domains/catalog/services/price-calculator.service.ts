import { Injectable } from '@nestjs/common';
import { Role } from '../../auth/enums/role.enum';
import { User, UserStatus } from '../../users/entities/user.entity';
import { Product } from '../entities/product.entity';
import { PriceBreakdown, PriceDiscount } from '../interfaces/pricing.interface';

export enum PricingChannel {
  PUBLIC = 'public',
  PARTNER = 'partner',
  TOROB = 'torob',
  SYNC = 'sync',
}

export interface PricingContext {
  user?: User;
  channel?: PricingChannel;
  now?: Date;
}

@Injectable()
export class PriceCalculatorService {
  calculatePrice(
    product: Product,
    context: PricingContext = {},
  ): PriceBreakdown {
    const now = context.now ?? new Date();
    const channel = context.channel ?? PricingChannel.PUBLIC;

    const basePrice = this.roundCurrency(Number(product.basePrice ?? 0));
    const discounts: PriceDiscount[] = [];

    let currentPrice = basePrice;

    /**
     * 1. تخفیف فروش
     *
     * - برای کانال عمومی: فقط وقتی sale فعال باشد اعمال می‌شود.
     * - برای کانال ترب: اگر salePrice وجود داشته باشد همیشه اعمال می‌شود.
     */
    const hasSalePrice =
      product.salePrice !== null && product.salePrice !== undefined;
    const shouldApplySale =
      (channel === PricingChannel.TOROB && hasSalePrice) ||
      this.isSaleActive(product, now);

    if (shouldApplySale && hasSalePrice) {
      const salePrice = this.roundCurrency(Number(product.salePrice));
      const saleDiscountAmount = this.roundCurrency(basePrice - salePrice);

      if (channel === PricingChannel.TOROB) {
        // Business rule: Torob users always see sale_price when it exists.
        currentPrice = salePrice;
      } else if (saleDiscountAmount > 0) {
        currentPrice = salePrice;

        discounts.push({
          type: 'SALE',
          amount: saleDiscountAmount,
          percent: this.calculatePercent(saleDiscountAmount, basePrice),
        });
      }

      if (channel === PricingChannel.TOROB && saleDiscountAmount > 0) {
        discounts.push({
          type: 'SALE',
          amount: saleDiscountAmount,
          percent: this.calculatePercent(saleDiscountAmount, basePrice),
        });
      }
    }

    /**
     * 2. تخفیف همکار
     *
     * اگر channel برابر PARTNER باشد یا user واقعاً partner باشد.
     */
    const isPartnerChannel = channel === PricingChannel.PARTNER;
    const isPartnerUser = this.isPartnerEligible(context.user);

    if (
      (isPartnerChannel || isPartnerUser) &&
      Number(product.partnerDiscountPercent) > 0
    ) {
      const partnerPercent = Number(product.partnerDiscountPercent);

      const partnerDiscountAmount = this.roundCurrency(
        currentPrice * (partnerPercent / 100),
      );

      if (partnerDiscountAmount > 0) {
        currentPrice = this.roundCurrency(currentPrice - partnerDiscountAmount);

        discounts.push({
          type: 'PARTNER',
          amount: partnerDiscountAmount,
          percent: this.roundCurrency(partnerPercent),
        });
      }
    }

    /**
     * 3. تخفیف ترب
     *
     * فعلاً نمونه ساده:
     * می‌توانید بعداً درصد را از config یا campaign جدا بخوانید.
     */
    if (channel === PricingChannel.TOROB) {
      const torobDiscountPercent = 0; // فعلاً صفر، بعداً قابل تنظیم

      if (torobDiscountPercent > 0) {
        const torobDiscountAmount = this.roundCurrency(
          currentPrice * (torobDiscountPercent / 100),
        );

        currentPrice = this.roundCurrency(currentPrice - torobDiscountAmount);

        discounts.push({
          type: 'TOROB',
          amount: torobDiscountAmount,
          percent: torobDiscountPercent,
        });
      }
    }

    const finalPrice = this.roundCurrency(currentPrice);
    const savings = this.roundCurrency(basePrice - finalPrice);

    return {
      basePrice,
      finalPrice,
      discounts,
      savings,
      savingsPercent: this.calculatePercent(savings, basePrice),
    };
  }

  private isSaleActive(product: Product, now: Date): boolean {
    if (!product.isOnSale || product.salePrice === null) {
      return false;
    }

    const hasStarted = !product.saleStartDate || product.saleStartDate <= now;
    const hasNotEnded = !product.saleEndDate || product.saleEndDate >= now;

    return hasStarted && hasNotEnded;
  }

  private isPartnerEligible(user?: User): boolean {
    return !!(
      user &&
      user.role === Role.PARTNER &&
      user.status === UserStatus.ACTIVE
    );
  }

  private calculatePercent(amount: number, base: number): number {
    if (base <= 0) {
      return 0;
    }

    return this.roundCurrency((amount / base) * 100);
  }

  private roundCurrency(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }
}
