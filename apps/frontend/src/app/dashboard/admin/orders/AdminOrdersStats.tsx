'use client';

import { ShoppingBag, XCircle, TrendingUp, Clock } from 'lucide-react';

export interface AdminOrdersStatsProps {
  ordersCount: number;
  cancelRequestsCount: number;
  totalSales: number;
  pendingCount: number;
}

export function AdminOrdersStats({
  ordersCount,
  cancelRequestsCount,
  totalSales,
  pendingCount,
}: AdminOrdersStatsProps) {
  const stats = [
    {
      label: 'کل سفارش‌ها',
      value: ordersCount.toLocaleString('fa-IR'),
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40',
    },
    {
      label: 'در انتظار',
      value: pendingCount.toLocaleString('fa-IR'),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
    },
    {
      label: 'درخواست لغو',
      value: cancelRequestsCount.toLocaleString('fa-IR'),
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40',
    },
    {
      label: 'فروش ناخالص',
      value: `${totalSales.toLocaleString('fa-IR')} ت`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.bg}`}>
          <div className={`p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/50 ${s.color} shrink-0`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-500 font-bold truncate">{s.label}</p>
            <p className={`text-lg font-black ${s.color} leading-tight`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
