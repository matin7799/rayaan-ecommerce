// apps/backend/src/domains/cart/entities/cart-snapshot.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Cart Snapshot Entity
 * Stores cart data in database as backup/snapshot
 * Primary storage is Redis for performance
 */
@Entity('cart_snapshots')
@Index(['cartId'])
export class CartSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  cartId!: string; // user:userId or guest:sessionId

  @Column({ type: 'jsonb' })
  cartData!: {
    items: Array<{
      variantId: string;
      productId: string;
      productTitle: string;
      variantSku: string;
      price: number;
      originalPrice?: number;
      quantity: number;
      subtotal: number;
      options: Array<{ name: string; value: string }>;
      image?: string;
      maxStock: number;
    }>;
    totalItems: number;
    totalPrice: number;
  };

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
