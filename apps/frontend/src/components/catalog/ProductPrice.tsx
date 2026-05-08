'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PriceBreakdown } from '@/services/catalog.service';

interface ProductPriceProps {
  pricing: PriceBreakdown;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBasePrice?: boolean;
  showSavings?: boolean;
}

const sizeClasses = {
  sm: {
    price: 'text-lg font-bold',
    base: 'text-xs',
    badge: 'text-[10px]',
    savings: 'text-xs',
  },
  md: {
    price: 'text-2xl font-extrabold',
    base: 'text-sm',
    badge: 'text-xs',
    savings: 'text-sm',
  },
  lg: {
    price: 'text-3xl md:text-4xl font-black',
    base: 'text-base',
    badge: 'text-sm',
    savings: 'text-sm',
  },
} as const;

function formatPrice(value: number): string {
  return value.toLocaleString('fa-IR');
}

export function ProductPrice({
  pricing,
  className,
  size = 'md',
  showBasePrice = true,
  showSavings = true,
}: ProductPriceProps) {
  const classes = sizeClasses[size];
  const hasDiscount = pricing.savings > 0;
  const saleDiscount = pricing.discounts.find((discount) => discount.type === 'SALE');
  const partnerDiscount = pricing.discounts.find(
    (discount) => discount.type === 'PARTNER',
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('text-primary', classes.price)}>
          {formatPrice(pricing.finalPrice)}
        </span>
        <span className="text-sm text-muted-foreground">تومان</span>

        {saleDiscount?.percent ? (
          <Badge className={cn('bg-rose-500 text-white hover:bg-rose-500', classes.badge)}>
            {saleDiscount.percent}٪ تخفیف
          </Badge>
        ) : null}

        {partnerDiscount ? (
          <Badge
            variant="outline"
            className={cn(
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
              classes.badge,
            )}
          >
            قیمت همکار
          </Badge>
        ) : null}
      </div>

      {hasDiscount && showBasePrice ? (
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <span className={cn('line-through', classes.base)}>
            {formatPrice(pricing.basePrice)} تومان
          </span>
          {showSavings ? (
            <span className={cn('text-emerald-600 dark:text-emerald-400', classes.savings)}>
              صرفه‌جویی {formatPrice(pricing.savings)} تومان
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
