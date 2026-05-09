'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Receipt,
  Clock,
  User,
  Loader2,
  Phone,
} from 'lucide-react';
import { orderService } from '@/services/order.service';
import type { Order } from '@/services/order.service';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: 'در انتظار',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  },
  PAID: {
    label: 'پرداخت شده',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  SHIPPED: {
    label: 'ارسال شده',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
  },
  DELIVERED: {
    label: 'تحویل شده',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'لغو شده',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  },
};

type DashboardOrderItem = Order['items'][number] & {
  id?: string;
  variant_id?: string;
  variant_sku?: string;
  product_title?: string;
  total_price?: number;
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  const { data: cancelRequest } = useQuery({
    queryKey: ['order-cancel-request', id],
    queryFn: () => orderService.getCancelRequest(id),
    enabled: !!id,
  });

  const createCancelRequestMutation = useMutation({
    mutationFn: (reason: string) => orderService.requestCancelOrder(id, reason),
    onSuccess: () => {
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['order-cancel-request', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">سفارش یافت نشد</h2>
        <p className="text-zinc-500 mb-6">سفارش مورد نظر یافت نشد یا حذف شده است.</p>
        <Link href="/dashboard/orders">
          <Button>بازگشت به لیست سفارشات</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP['PENDING'];
  const canCancel = order.status === 'PENDING' || order.status === 'PAID';

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold">سفارش #{order.id.slice(0, 8)}</h1>
              <Badge
                variant="secondary"
                className={`font-normal text-xs rounded-full ${statusInfo.color}`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ثبت شده در{' '}
              {new Date(order.created_at).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status === 'PENDING' && (
            <Button
              variant="outline"
              className="rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
              onClick={() => cancelOrderMutation.mutate()}
              disabled={cancelOrderMutation.isPending}
            >
              {cancelOrderMutation.isPending ? 'در حال لغو...' : 'لغو سفارش'}
            </Button>
          )}
          {order.status === 'PAID' && (
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="outline" className="rounded-xl text-amber-600">
                    درخواست لغو
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>درخواست لغو سفارش پرداخت‌شده</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="لطفا دلیل لغو را بنویسید..."
                  rows={4}
                />
                <DialogFooter>
                  <Button
                    onClick={() => createCancelRequestMutation.mutate(cancelReason.trim())}
                    disabled={createCancelRequestMutation.isPending || cancelReason.trim().length < 10}
                  >
                    ثبت درخواست
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {cancelRequest ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-sm font-semibold mb-2">وضعیت درخواست لغو</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            وضعیت: {cancelRequest.status === 'PENDING' ? 'در حال بررسی' : cancelRequest.status === 'APPROVED' ? 'تایید شده' : 'رد شده'}
          </p>
          <p className="text-sm text-zinc-500 mt-1">دلیل: {cancelRequest.reason}</p>
          {cancelRequest.admin_note ? (
            <p className="text-sm text-zinc-500 mt-1">یادداشت ادمین: {cancelRequest.admin_note}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ستون اصلی (راست): محصولات */}
        <div className="lg:col-span-2 space-y-6">
          {/* محصولات */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              محصولات سفارش
            </h2>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: DashboardOrderItem) => (
                  <div
                    key={item.id || item.variant_id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4"
                  >
                    {/* تصویر محصول */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                      <Package className="w-8 h-8 text-zinc-300" />
                    </div>

                    {/* اطلاعات محصول */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium mb-1 line-clamp-2">
                          {item.product_title || item.productTitle || 'محصول'}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-2">
                          SKU: {item.variant_sku || item.variantSku || '-'}
                        </p>
                        <p className="text-sm text-zinc-500">
                          قیمت واحد: {Number(item.price || 0).toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm text-zinc-500">{item.quantity || 0} عدد</span>
                        <p className="font-bold">
                          {Number(item.total_price || item.subtotal || 0).toLocaleString('fa-IR')}{' '}
                          <span className="text-xs font-normal text-zinc-500">تومان</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-center py-8">هیچ محصولی در این سفارش وجود ندارد</p>
              )}
            </div>
          </div>
        </div>

        {/* ستون کناری (چپ): خلاصه، آدرس و پرداخت */}
        <div className="space-y-6">
          {/* خلاصه سفارش */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              خلاصه سفارش
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">جمع کل محصولات</span>
                <span className="font-medium">
                  {Number(order.total_price || 0).toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">هزینه ارسال</span>
                <span className="font-medium">
                  {Number(order.shipping_cost || 0).toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-lg font-bold">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-primary">
                  {(
                    Number(order.total_price || 0) + Number(order.shipping_cost || 0)
                  ).toLocaleString('fa-IR')}{' '}
                  تومان
                </span>
              </div>
            </div>
          </div>

          {/* اطلاعات ارسال */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              اطلاعات ارسال
            </h2>
            <div className="text-sm space-y-3">
              {order.shipping_address ? (
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {typeof order.shipping_address === 'string'
                    ? order.shipping_address
                    : JSON.stringify(order.shipping_address, null, 2)}
                </p>
              ) : (
                <p className="text-zinc-500 text-sm">آدرس ارسال ثبت نشده است</p>
              )}
            </div>
          </div>

          {/* اطلاعات پرداخت */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              اطلاعات پرداخت
            </h2>
            <div className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">روش پرداخت</span>
                <span className="font-medium">{order.payment_method || 'نامشخص'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">شماره پیگیری</span>
                <span className="font-medium">{order.payment_ref || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
