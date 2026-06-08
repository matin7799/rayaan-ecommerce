'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentService, type PaymentListItem } from '@/services/payment.service';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, TrendingUp, Search, Filter } from 'lucide-react';

const STATUS_CONFIG: Record<PaymentListItem['status'], { label: string; color: string; icon: React.ElementType }> = {
  success: { label: 'موفق',      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
  failed:  { label: 'ناموفق',    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',               icon: XCircle },
  pending: { label: 'در انتظار', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',       icon: Clock },
};

type FilterStatus = 'all' | PaymentListItem['status'];

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => paymentService.getAdminPayments({ page: 1, limit: 200 }),
  });

  const items: PaymentListItem[] = data?.data ?? [];

  const stats = useMemo(() => ({
    total: items.length,
    success: items.filter(p => p.status === 'success').length,
    failed: items.filter(p => p.status === 'failed').length,
    totalRevenue: items.filter(p => p.status === 'success').reduce((s, p) => s + Number(p.amount), 0),
  }), [items]);

  const filtered = items.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchSearch = !search ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.order_id.toLowerCase().includes(search.toLowerCase()) ||
      (p.provider_track_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      p.provider.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <span className="p-2 bg-emerald-500/10 rounded-xl"><CreditCard className="w-6 h-6 text-emerald-600" /></span>
          مدیریت پرداخت‌ها
        </h1>
        <p className="text-sm text-zinc-500 mt-1">پیگیری و بررسی تراکنش‌های پرداخت درگاه</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'کل تراکنش‌ها', value: stats.total.toLocaleString('fa-IR'), color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40', icon: CreditCard },
          { label: 'پرداخت موفق', value: stats.success.toLocaleString('fa-IR'), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40', icon: CheckCircle },
          { label: 'پرداخت ناموفق', value: stats.failed.toLocaleString('fa-IR'), color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40', icon: XCircle },
          { label: 'درآمد موفق', value: `${stats.totalRevenue.toLocaleString('fa-IR')} ت`, color: 'text-emerald-600', bg: 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/40', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl border ${s.bg}`}>
            <div className={`p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/50 ${s.color} shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-400 font-bold truncate">{s.label}</p>
              <p className={`text-base font-black ${s.color} leading-tight`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="h-11 rounded-xl pr-10" placeholder="جستجو بر اساس شناسه، سفارش، کد رهگیری..." />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {(['all', 'success', 'pending', 'failed'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filterStatus === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 text-zinc-600 dark:text-zinc-300'}`}>
              {s === 'all' ? 'همه' : STATUS_CONFIG[s as PaymentListItem['status']]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-400">{filtered.length} تراکنش نمایش داده می‌شود</p>

      {/* Payment List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="font-bold text-sm">تراکنشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((payment) => {
            const cfg = STATUS_CONFIG[payment.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all"
              >
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-zinc-800 dark:text-zinc-200">
                      #{payment.id.slice(0, 12)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {payment.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>سفارش: <span className="font-mono">{payment.order_id.slice(0, 8)}</span></span>
                    {payment.provider_track_id && (
                      <span>رهگیری: <span className="font-mono">{payment.provider_track_id}</span></span>
                    )}
                    <span>{new Date(payment.created_at).toLocaleString('fa-IR')}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-left">
                  <p className={`font-black text-lg ${payment.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                    {Number(payment.amount).toLocaleString('fa-IR')}
                  </p>
                  <p className="text-[10px] text-zinc-400 text-right">تومان</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
