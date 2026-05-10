import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';

// ──────────────────────────────────────────────────────
// Entity پرداخت — هر رکورد یک تلاش پرداخت را نشان می‌دهد
// یک سفارش می‌تواند چندین تلاش پرداخت داشته باشد (OneToMany)
// طبق 05-database-schema.md
// ──────────────────────────────────────────────────────
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ────────────────────────────────────────────
  // رابطه با سفارش — هر پرداخت متعلق به یک سفارش است
  // ────────────────────────────────────────────
  @Column({ name: 'order_id', type: 'uuid' })
  order_id!: string;

  @ManyToOne(() => Order, { eager: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  // ────────────────────────────────────────────
  // مبلغ پرداخت — باید با total_price سفارش مطابقت داشته باشد
  // precision: 12 → حداکثر ۱۲ رقم | scale: 2 → ۲ رقم اعشار
  // ────────────────────────────────────────────
  @Column('bigint')
  amount!: number;

  // ────────────────────────────────────────────
  // وضعیت پرداخت — پیش‌فرض pending
  // Idempotency: فقط از pending می‌توان به success یا failed رفت
  // ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  // ────────────────────────────────────────────
  // درگاه پرداخت — zarinpal یا idpay
  // توسط سیستم انتخاب می‌شود (نه کاربر)
  // ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider!: PaymentProvider;

  // ────────────────────────────────────────────
  // شناسه رهگیری درگاه — بعد از ارسال درخواست به درگاه پر می‌شود
  // مثلاً authority در زرین‌پال یا id در آیدی‌پی
  // ────────────────────────────────────────────
  @Column({
    name: 'provider_track_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  provider_track_id!: string | null;

  // ────────────────────────────────────────────
  // کل JSON بازگشتی از callback درگاه — برای debug و audit
  // طبق قوانین معماری: "Callback Payload Stored"
  // ────────────────────────────────────────────
  @Column({
    name: 'callback_payload',
    type: 'json',
    nullable: true,
  })
  callback_payload!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
