import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * ترکیب کلاس‌های Tailwind CSS به صورت ایمن و جلوگیری از تداخل (Conflict)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * فرمت‌بندی اعداد به صورت قیمت با استاندارد فارسی (جداکننده هزارگان)
 * @param price مبلغ به عدد یا رشته
 * @returns مبلغ فرمت شده به صورت رشته (مثلاً: ۲,۵۰۰,۰۰۰)
 */
export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // بررسی جلوگیری از خطای NaN
  if (isNaN(numericPrice)) return '۰';
  
  return new Intl.NumberFormat('fa-IR').format(numericPrice);
}

/**
 * فرمت‌بندی اعداد انگلیسی به اعداد فارسی
 */
export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}
