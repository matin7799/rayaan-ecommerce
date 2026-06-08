'use client';

import { useState } from 'react';
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
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/lib/store/auth-store';
import { orderService } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StatusInfo {
  label: string;
  icon: LucideIcon;
  color: string;
}

const STATUS_MAP: Record<string, StatusInfo> = {
  PENDING: {
    label: 'در انتظار پرداخت',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-500 border border-amber-500/15',
  },
  PAID: {
    label: 'پرداخت شده',
    icon: CheckCircle2,
    color: 'bg-sky-500/10 text-sky-500 border border-sky-500/15',
  },
  SHIPPED: {
    label: 'ارسال شده به مقصد',
    icon: Truck,
    color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15',
  },
  DELIVERED: {
    label: 'تحویل شده',
    icon: CheckCircle2,
    color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15',
  },
  CANCELLED: {
    label: 'لغو شده',
    icon: XCircle,
    color: 'bg-rose-500/10 text-rose-500 border border-rose-500/15',
  },
};

type TabKey = 'all' | Order['status'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { accessToken, sessionChecked } = useAuthStore();
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
    <div className="space-y-7 font-bold" dir="rtl">
      <div>
        <h1 className="text-xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-[#008080] dark:bg-[#20B2AA] rounded-full inline-block" />
          تاریخچه و مدیریت سفارشات
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">پیگیری، بررسی مالی و لغو هوشمند سفارش‌های ثبت شده</p>
      </div>

      {sessionChecked && !accessToken && (
        <div className="bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-2xl p-4 text-xs">
          ⚠️ نشست کاربری یافت نشد. لطفا برای دسترسی ابتدا وارد حساب خود شوید.
        </div>
      )}

      {/* Modern Tabs with glowing indicators */}
      <div className="flex overflow-x-auto pb-2 gap-2 border-b border-zinc-200/50 dark:border-white/5 scrollbar-hide">
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
            className={`px-4.5 py-2.5 whitespace-nowrap text-xs font-extrabold transition-all border-b-2 rounded-t-xl ${
              activeTab === tab.key
                ? 'border-[#008080] text-[#008080] dark:text-[#20B2AA] bg-[#008080]/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content wrapper */}
      {!sessionChecked ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-[#008080]" />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-[#008080]" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl backdrop-blur-md">
          <XCircle className="w-10 h-10 mx-auto text-rose-450 mb-3" />
          <p className="text-xs text-zinc-500 mb-2">دریافت لیست سفارش‌ها با خطا مواجه گردید.</p>
          {error && <p className="text-[10px] text-zinc-400">{String(error)}</p>}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-zinc-950/40 border border-white/40 dark:border-white/5 rounded-3xl backdrop-blur-md">
          <Package className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">سفارشی در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP['PENDING'];
              const StatusIcon = statusInfo.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.25)] hover:border-[#008080]/20 hover:shadow-[0_8px_32px_rgba(0,128,128,0.05)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4.5">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${statusInfo.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-black text-sm text-zinc-800 dark:text-zinc-100">سفارش #{order.id.slice(0, 8).toUpperCase()}</span>
                          <Badge variant="outline" className={`font-black text-[9px] rounded-lg ${statusInfo.color} px-2 py-0.5`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">
                          ثبت شده در:{' '}
                          {new Date(order.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6.5 w-full sm:w-auto">
                      <div className="text-left shrink-0">
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-1 font-bold">مبلغ نهایی فاکتور</p>
                        <p className="font-black text-zinc-850 dark:text-zinc-100 text-sm">
                          {(Number(order.total_price) + Number(order.shipping_cost)).toLocaleString(
                            'fa-IR',
                          )}{' '}
                          <span className="text-[9px] font-bold text-zinc-400">تومان</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {order.status === 'PENDING' && (
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 h-9.5 border-rose-500/25"
                                  disabled={cancelOrderMutation.isPending}
                                >
                                  لغو سفارش
                                </Button>
                              }
                            />
                            <AlertDialogContent className="rounded-3xl border border-white/10 dark:border-white/5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl text-right" dir="rtl">
                              <AlertDialogHeader>
                                <div className="flex items-center gap-2 text-rose-500 mb-2">
                                  <AlertTriangle className="w-5 h-5 shrink-0" />
                                  <AlertDialogTitle className="font-black">آیا از لغو این سفارش اطمینان دارید؟</AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2">
                                  با تایید نهایی، این سفارش فوراً لغو شده و از لیست خریدهای در انتظار شما حذف خواهد گردید.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-row-reverse justify-end gap-2 mt-5">
                                <AlertDialogCancel className="rounded-xl text-xs font-bold h-9.5 border-zinc-200 dark:border-white/5">انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-black h-9.5 border-none shadow-md shadow-rose-500/10"
                                  onClick={() => cancelOrderMutation.mutate(order.id)}
                                >
                                  لغو نهایی سفارش
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {order.status === 'PAID' && (
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-xs font-black text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 h-9.5 border-amber-500/25"
                                  onClick={() => setTargetOrderId(order.id)}
                                >
                                  درخواست لغو
                                </Button>
                              }
                            />
                            <DialogContent className="rounded-3xl border border-white/10 dark:border-white/5 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl text-right" dir="rtl">
                              <DialogHeader>
                                <DialogTitle className="font-black">ثبت درخواست لغو سفارش پرداخت‌شده</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3 mt-3">
                                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                  سفارش‌های پرداخت شده به صورت مستقیم لغو نمی‌شوند و نیاز به بررسی و تایید نهایی مدیریت دارند. لطفا دلیل لغو را بنویسید (حداقل ۱۰ کاراکتر):
                                </p>
                                <Textarea
                                  value={cancelReason}
                                  onChange={(event) => setCancelReason(event.target.value)}
                                  placeholder="دلیل درخواست لغو سفارش..."
                                  rows={4}
                                  className="rounded-2xl text-xs"
                                />
                              </div>
                              <DialogFooter className="flex-row-reverse justify-end gap-2 mt-5">
                                <Button
                                  onClick={() => {
                                    if (!targetOrderId || cancelReason.trim().length < 10) return;
                                    createCancelRequestMutation.mutate({
                                      orderId: targetOrderId,
                                      reason: cancelReason.trim(),
                                    });
                                  }}
                                  disabled={createCancelRequestMutation.isPending || cancelReason.trim().length < 10}
                                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-black h-9.5 border-none shadow-md shadow-amber-500/10"
                                >
                                  {createCancelRequestMutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست لغو'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-black h-9.5 group hover:bg-[#008080]/10 hover:text-[#008080] dark:hover:text-[#20B2AA]">
                            مشاهده جزئیات
                            <ChevronLeft className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:-translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
