// backend/src/domains/shipping/entities/shipping-method.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'bigint', default: 0 })
  cost!: number;

  @Column({ name: 'estimated_days', type: 'int', nullable: true })
  estimated_days!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ name: 'is_pay_on_delivery', type: 'boolean', default: false })
  is_pay_on_delivery!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
