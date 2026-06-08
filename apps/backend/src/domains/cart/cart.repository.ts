// apps/backend/src/domains/cart/cart.repository.ts

import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { CartSnapshot } from './entities/cart-snapshot.entity';
import type { ICart, ICartItem } from './interfaces';

@Injectable()
export class CartRepository {
  private readonly CART_TTL = 7 * 24 * 60 * 60;
  private readonly KEY_PREFIX = 'cart';

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectRepository(CartSnapshot)
    private readonly snapshotRepo: Repository<CartSnapshot>,
  ) {}

  private getKey(userId: string): string {
    return `${this.KEY_PREFIX}:${userId}`;
  }

  private emptyCart(_userId: string): ICart {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  private recalcTotals(cart: ICart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.items = cart.items.map((item) => ({
      ...item,
      subtotal: item.price * item.quantity,
    }));
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  async getCart(userId: string): Promise<ICart> {
    const raw = await this.redis.get(this.getKey(userId));
    if (!raw) {
      // Try to restore from database snapshot
      const snapshot = await this.snapshotRepo.findOne({
        where: { cartId: userId },
      });

      if (snapshot) {
        // Restore to Redis
        await this.redis.set(
          this.getKey(userId),
          JSON.stringify(snapshot.cartData),
          'EX',
          this.CART_TTL,
        );
        return snapshot.cartData;
      }

      return this.emptyCart(userId);
    }
    return JSON.parse(raw) as ICart;
  }

  async saveCart(userId: string, cart: ICart): Promise<ICart> {
    this.recalcTotals(cart);
    await this.redis.set(
      this.getKey(userId),
      JSON.stringify(cart),
      'EX',
      this.CART_TTL,
    );

    // Save snapshot to database
    await this.snapshotRepo.upsert(
      {
        cartId: userId,
        cartData: cart,
      },
      ['cartId'],
    );

    return cart;
  }

  async addItem(userId: string, item: ICartItem): Promise<ICart> {
    const cart = await this.getCart(userId);
    const existing = cart.items.find((i) => i.variantId === item.variantId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push(item);
    }
    return this.saveCart(userId, cart);
  }

  async updateItemQuantity(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<ICart | null> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.variantId === variantId);
    if (!item) return null;
    item.quantity = quantity;
    return this.saveCart(userId, cart);
  }

  async removeItem(userId: string, variantId: string): Promise<ICart | null> {
    const cart = await this.getCart(userId);
    const idx = cart.items.findIndex((i) => i.variantId === variantId);
    if (idx === -1) return null;
    cart.items.splice(idx, 1);
    return this.saveCart(userId, cart);
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.getKey(userId));

    // Also delete from database
    await this.snapshotRepo.delete({
      cartId: userId,
    });
  }

  async getTTL(userId: string): Promise<number> {
    return this.redis.ttl(this.getKey(userId));
  }
}
