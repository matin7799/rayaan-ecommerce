import { IsUUID, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../enums/payment-provider.enum';

// ──────────────────────────────────────────────────────
// DTO شروع پرداخت
// ورودی شامل orderId و درگاه پرداخت انتخابی است
// ──────────────────────────────────────────────────────
export class InitiatePaymentDto {
  @ApiProperty({
    description: 'شناسه سفارش',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'شناسه سفارش باید UUID معتبر باشد' })
  @IsNotEmpty({ message: 'شناسه سفارش الزامی است' })
  orderId!: string;

  @ApiProperty({
    description: 'درگاه پرداخت انتخابی',
    enum: PaymentProvider,
    required: false,
    example: PaymentProvider.ZARINPAL,
  })
  @IsOptional()
  @IsEnum(PaymentProvider, { message: 'درگاه پرداخت نامعتبر است' })
  provider?: PaymentProvider;
}
