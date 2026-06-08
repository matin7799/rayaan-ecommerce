export type PriceDiscountType = 'SALE' | 'PARTNER' | 'CAMPAIGN' | 'TOROB';

export interface PriceDiscount {
  type: PriceDiscountType;
  amount: number;
  percent: number;
  title?: string;
  campaignId?: string;
  expiresAt?: Date | null;
}

export interface PriceBreakdown {
  basePrice: number;
  finalPrice: number;
  salePrice?: number | null;
  sale_price?: number | null;
  isOnSale?: boolean;
  is_on_sale?: boolean;
  discounts: PriceDiscount[];
  savings: number;
  savingsPercent: number;
  priceValidUntil?: Date | null;
}
