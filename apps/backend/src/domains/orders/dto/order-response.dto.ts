// backend/src/domains/orders/dto/order-response.dto.ts

import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

// ────────────────────────────────────────────
// DTO نمایش هر آیتم سفارش در پاسخ API
// ────────────────────────────────────────────
@Exclude()
export class OrderItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  product_id!: string | null;

  @Expose()
  product_title!: string;

  @Expose()
  product_slug!: string;

  @Expose()
  option_name!: string | null;

  @Expose()
  quantity!: number;

  @Expose()
  unit_price!: number | string;

  @Expose()
  total_price!: number | string;
}

// ────────────────────────────────────────────
// DTO نمایش سفارش در پاسخ API
// از @Exclude/@Expose برای کنترل دقیق خروجی استفاده می‌کنیم
// تا اطلاعات حساس (مثل user relation کامل) لو نره
// ────────────────────────────────────────────
@Exclude()
export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  user_id!: string;

  @Expose()
  total_price!: number | string;

  @Expose()
  status!: OrderStatus;

  @Expose()
  payment_ref!: string | null;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items!: OrderItemResponseDto[];

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;
}
