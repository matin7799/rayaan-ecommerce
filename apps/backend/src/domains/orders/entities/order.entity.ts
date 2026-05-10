// backend/src/domains/orders/entities/order.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

// وضعیت‌های سفارش طبق schema مستندات
export enum OrderStatus {
  PENDING = 'PENDING', // ثبت شده، در انتظار پرداخت
  PAID = 'PAID', // پرداخت موفق
  SHIPPED = 'SHIPPED', // ارسال شده
  DELIVERED = 'DELIVERED', // تحویل داده شده
  CANCELLED = 'CANCELLED', // لغو شده
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ────────────────────────────────────────────
  // رابطه با کاربر (هر سفارش متعلق به یک کاربر)
  // ────────────────────────────────────────────
  @Column({ name: 'user_id' })
  user_id!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ────────────────────────────────────────────
  // مبلغ کل سفارش (مجموع total_price تمام آیتم‌ها)
  // precision: 12 → حداکثر ۱۲ رقم | scale: 2 → ۲ رقم اعشار
  // ────────────────────────────────────────────
  @Column('bigint')
  total_price!: number;

  // ────────────────────────────────────────────
  // وضعیت سفارش — پیش‌فرض PENDING
  // ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  // ────────────────────────────────────────────
  // شماره پیگیری درگاه پرداخت (بعد از پرداخت موفق پر می‌شه)
  // nullable چون در لحظه ثبت سفارش هنوز پرداخت نشده
  // ────────────────────────────────────────────
  @Column({ name: 'payment_ref', type: 'varchar', nullable: true })
  payment_ref!: string | null;

  // ────────────────────────────────────────────
  // آدرس ارسال (JSON)
  // ────────────────────────────────────────────
  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shipping_address!: string | null;

  // ────────────────────────────────────────────
  // روش ارسال و هزینه ارسال
  // ────────────────────────────────────────────
  @Column({ name: 'shipping_method_id', type: 'uuid', nullable: true })
  shipping_method_id!: string | null;

  @Column({
    name: 'shipping_cost',
    type: 'bigint',
    default: 0,
  })
  shipping_cost!: number;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  payment_method!: string | null;

  // ────────────────────────────────────────────
  // آیتم‌های سفارش (رابطه OneToMany)
  // cascade: true → با ذخیره Order، آیتم‌ها هم ذخیره می‌شن
  // eager: true → با لود Order، آیتم‌ها هم خودکار لود می‌شن
  // ────────────────────────────────────────────
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
