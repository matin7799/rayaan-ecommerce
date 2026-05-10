// backend/src/domains/orders/entities/order-item.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ────────────────────────────────────────────
  // رابطه با سفارش (هر آیتم متعلق به یک سفارش)
  // ────────────────────────────────────────────
  @Column({ name: 'order_id' })
  order_id!: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE', // اگه سفارش حذف بشه، آیتم‌ها هم حذف می‌شن
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  // ────────────────────────────────────────────
  // شناسه محصول (برای ارجاع — اما وابسته نیستیم بهش)
  // nullable: true → اگه محصول حذف بشه، آیتم سفارش سالم می‌مونه
  // ────────────────────────────────────────────
  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  product_id!: string | null;

  // ════════════════════════════════════════════
  // 📸 فیلدهای اسنپ‌شات (Snapshot)
  // این مقادیر در لحظه خرید ثبت می‌شن و دیگه تغییر نمی‌کنن
  // حتی اگه محصول اصلی ویرایش یا حذف بشه
  // ════════════════════════════════════════════

  @Column({ name: 'product_title', type: 'varchar' })
  product_title!: string;

  @Column({ name: 'product_slug', type: 'varchar' })
  product_slug!: string;

  // نام آپشن انتخاب‌شده (مثلاً "رنگ قرمز")
  // nullable → اگه محصول بدون آپشن خریداری بشه
  @Column({ name: 'option_name', type: 'varchar', nullable: true })
  option_name!: string | null;

  // ────────────────────────────────────────────
  // تعداد و قیمت
  // ────────────────────────────────────────────
  @Column({ type: 'int' })
  quantity!: number;

  // قیمت واحد در لحظه خرید (base_price + price_modifier آپشن)
  @Column('bigint', { name: 'unit_price' })
  unit_price!: number;

  // قیمت کل = unit_price × quantity
  @Column('bigint', { name: 'total_price' })
  total_price!: number;

  @CreateDateColumn()
  created_at!: Date;
}
