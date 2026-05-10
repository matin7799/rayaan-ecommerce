// apps/backend/src/domains/orders/dto/update-order-status.dto.ts

import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

/**
 * DTO برای تغییر وضعیت سفارش توسط ادمین
 * فقط مقادیر معتبر OrderStatus پذیرفته می‌شود
 */
export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'وضعیت سفارش الزامی است.' })
  @IsEnum(OrderStatus, {
    message: `وضعیت باید یکی از مقادیر ${Object.values(OrderStatus).join(', ')} باشد.`,
  })
  status!: OrderStatus;
}
