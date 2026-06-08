// apps/backend/src/domains/cart/cart.service.ts

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Redis from 'ioredis';

import { CartRepository } from './cart.repository';
import { CatalogService } from '../catalog/services/catalog.service';
import { MediaService } from '../media/media.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import type { ICart, ICartItem } from './interfaces';
import { PricingChannel } from '../catalog/services/price-calculator.service';
import { User } from '../users/entities/user.entity';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { CartLockService } from './cart-lock.service';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalogService: CatalogService,
    private readonly mediaService: MediaService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly cartLockService: CartLockService,
  ) {}

  async getCart(userId: string): Promise<ICart> {
    return this.cartRepo.getCart(userId);
  }

  async addToCart(
    userId: string,
    dto: AddToCartDto,
    isTorobUser = false,
    user?: User,
  ): Promise<ICart> {
    const acquired = await this.cartLockService.acquireLock(userId);
    if (!acquired) {
      throw new BadRequestException(
        'سیستم در حال حاضر مشغول است. لطفا مجددا تلاش کنید.',
      );
    }

    try {
      const product = await this.catalogService.findByVariantId(dto.variantId);

      if (!product) {
        throw new NotFoundException('واریانت محصول یافت نشد');
      }

      const variant = product.variants.find((v) => v.id === dto.variantId);
      const isSimpleProductFallback = !variant && product.id === dto.variantId;

      if (!variant && !isSimpleProductFallback) {
        throw new NotFoundException('واریانت محصول یافت نشد');
      }

      if (
        variant &&
        variant.inventory &&
        variant.inventory.stock < dto.quantity
      ) {
        throw new BadRequestException('موجودی کافی نیست');
      }

      if (
        isSimpleProductFallback &&
        product.stockQuantity !== undefined &&
        product.stockQuantity < dto.quantity
      ) {
        throw new BadRequestException('موجودی کافی نیست');
      }

      const currentCart = await this.cartRepo.getCart(userId);
      const existingInCart =
        currentCart.items.find(
          (item) => item.variantId === (variant?.id ?? product.id),
        )?.quantity ?? 0;

      if (variant?.sku) {
        const reservedQty = await this.getReservedQtyBySku(variant.sku);
        const availableStock = Math.max(
          0,
          Number(variant.inventory?.stock ?? 0) - reservedQty,
        );
        const targetQty = existingInCart + dto.quantity;

        if (targetQty > availableStock) {
          if (availableStock <= 0) {
            throw new BadRequestException(
              'این کالا موقتاً رزرو شده و قابل افزودن نیست.',
            );
          }
          throw new BadRequestException(
            `حداکثر ${availableStock.toLocaleString('fa-IR')} عدد قابل افزودن است.`,
          );
        }
      }

      if (isSimpleProductFallback) {
        const availableStock = Math.max(0, Number(product.stockQuantity ?? 0));
        const targetQty = existingInCart + dto.quantity;
        if (targetQty > availableStock) {
          throw new BadRequestException(
            `حداکثر ${availableStock.toLocaleString('fa-IR')} عدد قابل افزودن است.`,
          );
        }
      }

      const pricing = this.catalogService.getProductPriceBreakdownForChannel(
        product,
        user,
        isTorobUser ? PricingChannel.TOROB : PricingChannel.PUBLIC,
      );
      const unitPrice = Number(pricing.finalPrice);
      const originalPrice =
        Number(pricing.basePrice) > unitPrice
          ? Number(pricing.basePrice)
          : undefined;

      const thumbnail = await this.catalogService.getProductThumbnailUrl(
        product.id,
      );

      const cartItem: ICartItem = {
        variantId: variant?.id ?? product.id,
        productId: product.id,
        productTitle: product.name,
        variantSku: variant?.sku ?? product.sku,
        price: unitPrice,
        originalPrice,
        quantity: dto.quantity,
        subtotal: unitPrice * dto.quantity,
        options: (variant?.options ?? []).map((option) => ({
          name: option.name,
          value: option.value,
        })),
        image: thumbnail ?? undefined,
        maxStock: variant?.inventory?.stock ?? product.stockQuantity ?? 0,
      };

      return await this.cartRepo.addItem(userId, cartItem);
    } finally {
      await this.cartLockService.releaseLock(userId);
    }
  }

  async updateItemQuantity(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<ICart> {
    const acquired = await this.cartLockService.acquireLock(userId);
    if (!acquired) {
      throw new BadRequestException(
        'سیستم در حال حاضر مشغول است. لطفا مجددا تلاش کنید.',
      );
    }

    try {
      const product = await this.catalogService.findByVariantId(variantId);
      const variant = product?.variants.find((v) => v.id === variantId);
      if (variant?.sku) {
        const currentCart = await this.cartRepo.getCart(userId);
        const currentItemQty =
          currentCart.items.find((item) => item.variantId === variantId)
            ?.quantity ?? 0;
        const reservedQty = await this.getReservedQtyBySku(variant.sku);
        const availableStock =
          Math.max(0, Number(variant.inventory?.stock ?? 0) - reservedQty) +
          currentItemQty;
        if (quantity > availableStock) {
          throw new BadRequestException(
            `حداکثر ${availableStock.toLocaleString('fa-IR')} عدد قابل انتخاب است.`,
          );
        }
      }

      if (!variant && product && product.id === variantId) {
        const availableStock = Math.max(0, Number(product.stockQuantity ?? 0));
        if (quantity > availableStock) {
          throw new BadRequestException(
            `حداکثر ${availableStock.toLocaleString('fa-IR')} عدد قابل انتخاب است.`,
          );
        }
      }

      const result = await this.cartRepo.updateItemQuantity(
        userId,
        variantId,
        quantity,
      );

      if (!result) {
        throw new NotFoundException('آیتم مورد نظر در سبد خرید یافت نشد');
      }

      return result;
    } finally {
      await this.cartLockService.releaseLock(userId);
    }
  }

  async removeItem(userId: string, variantId: string): Promise<ICart> {
    const acquired = await this.cartLockService.acquireLock(userId);
    if (!acquired) {
      throw new BadRequestException(
        'سیستم در حال حاضر مشغول است. لطفا مجددا تلاش کنید.',
      );
    }

    try {
      const result = await this.cartRepo.removeItem(userId, variantId);

      if (!result) {
        throw new NotFoundException('آیتم مورد نظر در سبد خرید یافت نشد');
      }

      return result;
    } finally {
      await this.cartLockService.releaseLock(userId);
    }
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.clearCart(userId);
  }

  async mergeCart(
    userId: string,
    guestItems: Array<{ variantId: string; quantity: number }>,
    isTorobUser = false,
    user?: User,
  ): Promise<ICart> {
    const acquired = await this.cartLockService.acquireLock(userId);
    if (!acquired) {
      throw new BadRequestException(
        'سیستم در حال حاضر مشغول است. لطفا مجددا تلاش کنید.',
      );
    }

    try {
      const currentCart = await this.cartRepo.getCart(userId);

      for (const guestItem of guestItems) {
        if (guestItem.quantity <= 0) continue;

        const existingItemIndex = currentCart.items.findIndex(
          (item) => item.variantId === guestItem.variantId,
        );

        if (existingItemIndex > -1) {
          const targetQty =
            currentCart.items[existingItemIndex].quantity + guestItem.quantity;
          const variantId = guestItem.variantId;
          const product = await this.catalogService.findByVariantId(variantId);
          if (product) {
            const variant = product.variants.find((v) => v.id === variantId);
            const isSimpleProductFallback = !variant && product.id === variantId;
            let availableStock = 0;

            if (variant) {
              const reservedQty = await this.getReservedQtyBySku(variant.sku);
              availableStock = Math.max(
                0,
                Number(variant.inventory?.stock ?? 0) - reservedQty,
              );
            } else if (isSimpleProductFallback) {
              availableStock = Math.max(0, Number(product.stockQuantity ?? 0));
            }

            currentCart.items[existingItemIndex].quantity = Math.min(
              targetQty,
              availableStock > 0 ? availableStock : targetQty,
            );
          } else {
            currentCart.items[existingItemIndex].quantity = targetQty;
          }
        } else {
          try {
            const variantId = guestItem.variantId;
            const product = await this.catalogService.findByVariantId(variantId);
            if (!product) continue;

            const variant = product.variants.find((v) => v.id === variantId);
            const isSimpleProductFallback = !variant && product.id === variantId;

            if (!variant && !isSimpleProductFallback) continue;

            let stockLimit = 0;
            if (variant) {
              const reservedQty = await this.getReservedQtyBySku(variant.sku);
              stockLimit = Math.max(
                0,
                Number(variant.inventory?.stock ?? 0) - reservedQty,
              );
            } else if (isSimpleProductFallback) {
              stockLimit = Math.max(0, Number(product.stockQuantity ?? 0));
            }

            const finalQty = Math.min(
              guestItem.quantity,
              stockLimit > 0 ? stockLimit : guestItem.quantity,
            );
            if (finalQty <= 0) continue;

            const pricing = this.catalogService.getProductPriceBreakdownForChannel(
              product,
              user,
              isTorobUser ? PricingChannel.TOROB : PricingChannel.PUBLIC,
            );
            const unitPrice = Number(pricing.finalPrice);
            const originalPrice =
              Number(pricing.basePrice) > unitPrice
                ? Number(pricing.basePrice)
                : undefined;

            const thumbnail = await this.catalogService.getProductThumbnailUrl(
              product.id,
            );

            const cartItem: ICartItem = {
              variantId: variant?.id ?? product.id,
              productId: product.id,
              productTitle: product.name,
              variantSku: variant?.sku ?? product.sku,
              price: unitPrice,
              originalPrice,
              quantity: finalQty,
              subtotal: unitPrice * finalQty,
              options: (variant?.options ?? []).map((option) => ({
                name: option.name,
                value: option.value,
              })),
              image: thumbnail ?? undefined,
              maxStock: variant?.inventory?.stock ?? product.stockQuantity ?? 0,
            };

            currentCart.items.push(cartItem);
          } catch (e) {
            console.error(`Failed to merge guest cart item ${guestItem.variantId}:`, e);
          }
        }
      }

      return await this.cartRepo.saveCart(userId, currentCart);
    } finally {
      await this.cartLockService.releaseLock(userId);
    }
  }

  private async getReservedQtyBySku(sku: string): Promise<number> {
    const value = await this.redis.get(`stock:reserved:sku:${sku}`);
    return Number(value ?? 0);
  }
}
