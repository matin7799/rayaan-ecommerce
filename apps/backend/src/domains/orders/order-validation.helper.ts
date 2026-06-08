import { BadRequestException } from '@nestjs/common';
import { CatalogService } from '../catalog/services/catalog.service';
import type { ICartItem } from '../cart/interfaces/cart-item.interface';
import { PricingChannel } from '../catalog/services/price-calculator.service';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

export interface ValidatedCartItem {
  productId: string | null;
  productTitle: string;
  productSlug: string;
  variantSku: string | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export async function validateAndRecalculateItems(
  catalogService: CatalogService,
  cartItems: ICartItem[],
  isTorobUser = false,
  user?: User,
): Promise<ValidatedCartItem[]> {
  const validatedItems: ValidatedCartItem[] = [];

  for (const item of cartItems) {
    const product = await catalogService.findByVariantId(item.variantId);
    if (!product || !product.isActive) {
      throw new BadRequestException(
        `محصول مرتبط با واریانت "${item.variantId}" یافت نشد یا غیرفعال شده است.`,
      );
    }

    const variant = product.variants.find((v) => v.id === item.variantId);
    const unitPrice = variant
      ? Number(variant.price)
      : catalogService.getProductUnitPriceForChannel(
          product,
          user,
          isTorobUser ? PricingChannel.TOROB : PricingChannel.PUBLIC,
        );
    const totalPrice = unitPrice * item.quantity;

    validatedItems.push({
      productId: product.id,
      productTitle: product.name,
      productSlug: product.slug,
      variantSku: variant?.sku ?? item.variantSku ?? null,
      optionName: null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  return validatedItems;
}

export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): void {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  const allowed = allowedTransitions[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new BadRequestException(
      `تغییر وضعیت از "${currentStatus}" به "${newStatus}" مجاز نیست.`,
    );
  }
}
