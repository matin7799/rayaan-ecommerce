'use client';

import { CreditCard, Wallet, Landmark } from 'lucide-react';

interface PaymentMethodProps {
  selectedMethod: 'online' | 'cash_on_delivery';
  onMethodChange: (method: 'online' | 'cash_on_delivery') => void;
}

const paymentMethods = [
  {
    id: 'online',
    title: 'پرداخت اینترنتی (درگاه زرین‌پال)',
    description: 'پرداخت آنلاین با تمامی کارت‌های عضو شتاب',
    icon: CreditCard,
    disabled: false,
  },
  {
    id: 'cash_on_delivery',
    title: 'پرداخت در محل',
    description: 'پرداخت هنگام تحویل کالا',
    icon: Wallet,
    disabled: false,
  },
];

export function PaymentMethod({ selectedMethod, onMethodChange }: PaymentMethodProps) {
  return (
    <section className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-primary mb-5">
        <Landmark className="w-5 h-5" />
        <h2 className="text-lg font-bold text-foreground">روش پرداخت</h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <label
              key={method.id}
              className={`flex items-center gap-3 p-4 border rounded-xl transition-all ${
                method.disabled
                  ? 'opacity-50 cursor-not-allowed bg-muted/30'
                  : 'cursor-pointer hover:border-primary/30'
              } ${
                isSelected
                  ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={isSelected}
                onChange={() => onMethodChange(method.id as 'online' | 'cash_on_delivery')}
                disabled={method.disabled}
              />
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{method.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{method.description}</div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
