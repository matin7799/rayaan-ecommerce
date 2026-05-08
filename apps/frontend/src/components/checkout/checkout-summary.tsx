import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import type { Cart } from '@/services/cart.service';
import type { ShippingMethod } from '@/services/shipping.service';

interface CheckoutSummaryProps {
  cart: Cart;
  shippingCost: number;
  selectedShippingMethod?: ShippingMethod;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function CheckoutSummary({ cart, shippingCost, selectedShippingMethod, onSubmit, isSubmitting = false }: CheckoutSummaryProps) {
  const cartSubtotal = Number(cart.totalPrice) || 0;
  const discount = 0;
  // Ensure all values are numbers before calculation
  const numericShippingCost = Number(shippingCost) || 0;
  const total = cartSubtotal + numericShippingCost - discount;
  const itemCount = Number(cart.totalItems) || 0;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6 border-b border-border pb-4">خلاصه سفارش</h2>
        
        {/* Cart Items Summary */}
        <div className="mb-6 space-y-3">
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex justify-between items-start text-sm">
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.productTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  تعداد: {item.quantity}
                </p>
              </div>
              <span className="font-semibold text-foreground">
                {((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString()} تومان
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-sm mb-6">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>جمع کالاها ({itemCount} مورد)</span>
            <span>{cartSubtotal.toLocaleString()} تومان</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>هزینه ارسال</span>
            {selectedShippingMethod?.is_pay_on_delivery ? (
              <span className="text-orange-600 font-medium">پس کرایه</span>
            ) : (
              <>
                {numericShippingCost > 0 ? (
                  <span>{numericShippingCost.toLocaleString()} تومان</span>
                ) : (
                  <span className="text-green-600 font-medium">رایگان</span>
                )}
              </>
            )}
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-red-500">
              <span>تخفیف</span>
              <span>- {discount.toLocaleString()} تومان</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center font-bold text-lg mb-6 border-t border-border pt-4">
          <span>مبلغ قابل پرداخت</span>
          <span className="text-primary text-xl">{total.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">تومان</span></span>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30"
        >
          {isSubmitting ? 'در حال پردازش...' : 'پرداخت و ثبت نهایی'}
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          با ثبت سفارش، قوانین و مقررات سایت را می‌پذیرم.
        </p>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-green-500/10 text-green-600 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">پرداخت امن</h4>
          <p className="text-xs text-muted-foreground mt-0.5">تضمین امنیت اطلاعات شما</p>
        </div>
      </div>
    </div>
  )
}
