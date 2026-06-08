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
// یک سفارش می‌تواند چندین تلاش پرداخت داشته باشد
// ──────────────────────────────────────────────────────
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ────────────────────────────────────────────
  // شناسه سفارش
  // ────────────────────────────────────────────
  @Column({ name: 'order_id', type: 'uuid' })
  order_id!: string;

  @ManyToOne(() => Order, { eager: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  // ────────────────────────────────────────────
  // مبلغ پرداخت
  // توجه: باید مشخص باشد واحد داخلی سیستم تومان است یا ریال
  // ────────────────────────────────────────────
  @Column('bigint')
  amount!: number;

  // ────────────────────────────────────────────
  // وضعیت پرداخت
  // ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  // ────────────────────────────────────────────
  // نام درگاه پرداخت
  // ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider!: PaymentProvider;

  // ────────────────────────────────────────────
  // شناسه اولیه درگاه
  // مثال در زرین‌پال: authority
  // مثال در idpay: id
  // ────────────────────────────────────────────
  @Column({
    name: 'provider_track_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  provider_track_id!: string | null;

  // ────────────────────────────────────────────
  // شناسه نهایی مرجع پرداخت بعد از verify
  // مثال در زرین‌پال: ref_id
  // ────────────────────────────────────────────
  @Column({
    name: 'provider_ref_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  provider_ref_id!: string | null;

  // ────────────────────────────────────────────
  // payload کامل callback/request/verify برای audit/debug
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
