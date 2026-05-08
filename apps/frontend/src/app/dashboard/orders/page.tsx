'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Truck,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/lib/store/auth-store';
import { orderService } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface StatusInfo {
  label: string;
  icon: LucideIcon;
  color: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  PENDING: {
    label: 'در انتظار',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  PAID: {
    label: 'پرداخت شده',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  SHIPPED: {
    label: 'ارسال شده',
    icon: Truck,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  },
  DELIVERED: {
    label: 'تحویل شده',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'لغو شده',
    icon: XCircle,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  },
};

type TabKey = 'all' | Order['status'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getMyOrders(),
    enabled: !!accessToken,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const orders = data ?? [];
  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  useEffect(() => {
    console.log('Orders data:', data);
    console.log('Orders items:', orders);
    console.log('Filtered orders:', filteredOrders);
  }, [data, orders, filteredOrders]);

  useEffect(() => {
    console.log('Access token:', accessToken);
    console.log('Is loading:', isLoading);
    console.log('Is error:', isError);
    console.log('Error:', error);
  }, [accessToken, isLoading, isError, error]);

  const canCancelOrder = (order: Order) => order.status === 'PENDING' || order.status === 'PAID';
  const [cancelReason, setCancelReason] = useState('');
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);

  const createCancelRequestMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      orderService.requestCancelOrder(orderId, reason),
    onSuccess: () => {
      setCancelReason('');
      setTargetOrderId(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">تاریخچه سفارشات</h1>
        <p className="text-zinc-500">پیگیری و مدیریت سفارش‌های ثبت شده شما</p>
      </div>

      {/* Debug info */}
      {!accessToken && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
          ⚠️ شما وارد سیستم نشده‌اید. لطفا ابتدا وارد شوید.
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-hide">
        {[
          { key: 'all' as const, label: 'همه سفارش‌ها' },
          { key: 'PAID' as const, label: 'پرداخت شده' },
          { key: 'SHIPPED' as const, label: 'ارسال شده' },
          { key: 'DELIVERED' as const, label: 'تحویل شده' },
          { key: 'CANCELLED' as const, label: 'لغو شده' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <XCircle className="w-12 h-12 mx-auto text-rose-400 mb-4" />
          <p className="text-zinc-500 mb-2">خطا در دریافت سفارش‌ها. لطفا دوباره تلاش کنید.</p>
          {error && <p className="text-xs text-zinc-400">{String(error)}</p>}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <Package className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
          <p className="text-zinc-500">سفارشی در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP['PENDING'];
            const StatusIcon = statusInfo.icon;
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">سفارش #{order.id.slice(0, 8)}</span>
                        <Badge variant="secondary" className="font-normal text-xs rounded-full">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left">
                      <p className="text-sm text-zinc-500 mb-1">مبلغ کل</p>
                      <p className="font-bold">
                        {(Number(order.total_price) + Number(order.shipping_cost)).toLocaleString(
                          'fa-IR',
                        )}{' '}
                        <span className="text-xs font-normal text-zinc-500">تومان</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                          onClick={() => cancelOrderMutation.mutate(order.id)}
                          disabled={cancelOrderMutation.isPending}
                        >
                          لغو سفارش
                        </Button>
                      )}
                      {order.status === 'PAID' && (
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                                onClick={() => setTargetOrderId(order.id)}
                              >
                                درخواست لغو
                              </Button>
                            }
                          />
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>ثبت درخواست لغو سفارش</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <p className="text-sm text-zinc-500">
                                سفارش پرداخت‌شده مستقیم لغو نمی‌شود و نیاز به تایید ادمین دارد.
                              </p>
                              <Textarea
                                value={cancelReason}
                                onChange={(event) => setCancelReason(event.target.value)}
                                placeholder="دلیل درخواست لغو را بنویسید..."
                                rows={4}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  if (!targetOrderId || cancelReason.trim().length < 10) return;
                                  createCancelRequestMutation.mutate({
                                    orderId: targetOrderId,
                                    reason: cancelReason.trim(),
                                  });
                                }}
                                disabled={createCancelRequestMutation.isPending || cancelReason.trim().length < 10}
                              >
                                ثبت درخواست
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl group">
                          جزئیات
                          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
