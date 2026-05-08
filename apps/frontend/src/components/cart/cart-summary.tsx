'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

interface CartSummaryProps {
  subtotal: number
  shippingCost?: number
  onCheckout?: () => void
}

export function CartSummary({ subtotal, shippingCost = 0, onCheckout }: CartSummaryProps) {
  const safeSubtotal = Number(subtotal) || 0;
  const numericShippingCost = Number(shippingCost) || 0;
  const total = safeSubtotal + numericShippingCost;

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-bold mb-6">خلاصه سفارش</h3>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>جمع مبلغ کالاها</span>
          <span>{safeSubtotal.toLocaleString()} تومان</span>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground">
          <span>هزینه ارسال</span>
          <span>{numericShippingCost === 0 ? 'رایگان (ویژه)' : `${numericShippingCost.toLocaleString()} تومان`}</span>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <span className="font-semibold text-base">مبلغ قابل پرداخت</span>
          <span className="font-bold text-xl text-primary">
            {total.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">تومان</span>
          </span>
        </div>
      </div>

      <Button onClick={onCheckout} className="w-full mt-6 h-12 text-base font-semibold group">
        ثبت سفارش و ادامه
        <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>پرداخت امن و تضمین بازگشت وجه</span>
      </div>
    </div>
  )
}
