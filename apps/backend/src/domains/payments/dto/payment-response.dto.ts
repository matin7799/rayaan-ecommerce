import { ApiProperty } from '@nestjs/swagger';

// ──────────────────────────────────────────────────────
// DTO پاسخ شروع پرداخت — لینک پرداخت برای ریدایرکت کاربر
// طبق API Contract: خروجی initiate شامل paymentUrl است
// ──────────────────────────────────────────────────────
export class InitiatePaymentResponseDto {
  @ApiProperty({
    description: 'شناسه پرداخت',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  paymentId!: string;

  @ApiProperty({
    description: 'لینک پرداخت برای ریدایرکت کاربر به درگاه',
    example:
      'https://sandbox.zarinpal.com/pg/StartPay/A00000000000000000000000000217885',
  })
  paymentUrl!: string;
}

// ──────────────────────────────────────────────────────
// DTO پاسخ callback — نتیجه نهایی پرداخت
// ──────────────────────────────────────────────────────
export class CallbackPaymentResponseDto {
  @ApiProperty({
    description: 'آیا پرداخت موفق بوده؟',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'پیام نتیجه',
    example: 'پرداخت با موفقیت انجام شد',
  })
  message!: string;

  @ApiProperty({
    description: 'شناسه مرجع پرداخت (ref_id)',
    example: '12345678',
    nullable: true,
  })
  refId!: string | null;

  @ApiProperty({
    description: 'شناسه سفارش',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  orderId!: string;
}
