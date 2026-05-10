// apps/backend/src/domains/cart/cart.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CartRepository } from './cart.repository';
import { CatalogService } from '../catalog/services/catalog.service';
import { MediaService } from '../media/media.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import type { ICart, ICartItem } from './interfaces';
import { PricingChannel } from '../catalog/services/price-calculator.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly catalogService: CatalogService,
    private readonly mediaService: MediaService,
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

    const pricing = this.catalogService.getProductPriceBreakdownForChannel(
      product,
      user,
      isTorobUser ? PricingChannel.TOROB : PricingChannel.PUBLIC,
    );
    const unitPrice = Number(pricing.finalPrice);
    const originalPrice =
      Number(pricing.basePrice) > unitPrice ? Number(pricing.basePrice) : undefined;

    const thumbnail = await this.catalogService.getProductThumbnailUrl(
      product.id,
    );

    const cartItem: ICartItem = {
      variantId: variant?.id ?? product.id,
      productId: product.id,
      productTitle: product.name,
      variantSku: variant?.sku ?? `product-${product.id}`,
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

    return this.cartRepo.addItem(userId, cartItem);
  }

  async updateItemQuantity(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<ICart> {
    const result = await this.cartRepo.updateItemQuantity(
      userId,
      variantId,
      quantity,
    );

    if (!result) {
      throw new NotFoundException('آیتم مورد نظر در سبد خرید یافت نشد');
    }

    return result;
  }

  async removeItem(userId: string, variantId: string): Promise<ICart> {
    const result = await this.cartRepo.removeItem(userId, variantId);

    if (!result) {
      throw new NotFoundException('آیتم مورد نظر در سبد خرید یافت نشد');
    }

    return result;
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.clearCart(userId);
  }
}
