import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ──────────────────────────────────────────────────────
// DTO شروع پرداخت — طبق API Contract: POST /api/v1/payments/initiate
// ورودی فقط orderId است — درگاه توسط سیستم انتخاب می‌شود
// ──────────────────────────────────────────────────────
export class InitiatePaymentDto {
  @ApiProperty({
    description: 'شناسه سفارش',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'شناسه سفارش باید UUID معتبر باشد' })
  @IsNotEmpty({ message: 'شناسه سفارش الزامی است' })
  orderId!: string;
}
