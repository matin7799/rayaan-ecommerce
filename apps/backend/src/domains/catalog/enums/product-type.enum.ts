// backend/src/domains/catalog/enums/product-type.enum.ts

/**
 * انواع محصولات پلتفرم
 *
 * PHYSICAL: محصول فیزیکی (نیاز به ارسال و مدیریت موجودی)
 * DIGITAL: محصول دیجیتال (دانلود فایل، بدون ارسال فیزیکی)
 */
export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
}
