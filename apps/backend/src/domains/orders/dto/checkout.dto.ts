// backend/src/domains/orders/dto/checkout.dto.ts

import { IsOptional, IsString } from 'class-validator';

// ────────────────────────────────────────────
// DTO ثبت سفارش (Checkout)
// کاربر فقط درخواست checkout می‌ده
// آیتم‌ها از سبد خرید Redis خوانده می‌شن
// ────────────────────────────────────────────
export class CheckoutDto {
  // آدرس تحویل (برای محصولات فیزیکی)
  // در فاز فعلی اختیاری — بعداً می‌تونیم اجباری کنیم
  @IsOptional()
  @IsString()
  shipping_address?: string;

  // توضیحات اضافی سفارش
  @IsOptional()
  @IsString()
  note?: string;
}
