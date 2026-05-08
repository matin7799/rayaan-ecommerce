'use client'

import { Truck, Check } from 'lucide-react'
import { ShippingMethod as ShippingMethodType } from '@/services/shipping.service'

interface ShippingMethodProps {
  shippingMethods: ShippingMethodType[];
  selectedMethodId: string;
  onMethodSelect: (id: string) => void;
}

export function ShippingMethod({ shippingMethods, selectedMethodId, onMethodSelect }: ShippingMethodProps) {
  return (
    <section className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Truck className="w-5 h-5" />
        <h2 className="text-lg font-bold text-foreground">روش ارسال</h2>
      </div>

      {shippingMethods.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>روش ارسالی موجود نیست</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedMethodId === method.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              {selectedMethodId === method.id && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-semibold">{method.name}</p>
                  {method.description && (
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  )}
                  {method.estimated_days && (
                    <p className="text-xs text-muted-foreground">
                      زمان تحویل: {method.estimated_days} روز کاری
                    </p>
                  )}
                </div>
                <div className="text-left">
                  {method.is_pay_on_delivery ? (
                    <p className="font-bold text-orange-600">
                      پس کرایه
                    </p>
                  ) : (
                    Number(method.cost) > 0 ? (
                      <p className="font-bold text-primary">{Number(method.cost).toLocaleString()} تومان</p>
                    ) : (
                      <p className="font-bold text-green-600">رایگان</p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
