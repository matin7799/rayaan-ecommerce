'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';

export default function AdminPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => paymentService.getAdminPayments({ page: 1, limit: 50 }),
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;

  const items = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">مدیریت پرداخت‌ها (ادمین)</h1>
      <div className="space-y-2">
        {items.map((payment) => (
          <div key={payment.id} className="rounded-xl border p-3">
            <p className="font-medium">پرداخت #{payment.id.slice(0, 8)}</p>
            <p className="text-sm text-zinc-500">
              سفارش: {payment.order_id.slice(0, 8)} | مبلغ: {Number(payment.amount).toLocaleString('fa-IR')} تومان
            </p>
            <p className="text-sm text-zinc-500">
              وضعیت: {payment.status} | درگاه: {payment.provider}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
