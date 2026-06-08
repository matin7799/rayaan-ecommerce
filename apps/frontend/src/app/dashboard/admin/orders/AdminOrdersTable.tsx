'use client';

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, CreditCard, Package, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/services/order.service';

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  PAID:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  SHIPPED:   'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  DELIVERED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export interface AdminOrdersTableProps {
  orders: Order[];
  expandedOrderIds: Record<string, boolean>;
  setExpandedOrderIds: (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  isPartner: boolean;
  setStatusDialogOrderId: (id: string) => void;
  setNextStatus: (status: Order['status']) => void;
  normalizeShippingAddress: (address: any) => any;
  getOrderItemDisplay: (item: any) => any;
  statusLabel: Record<string, string>;
  searchQuery: string;
  filterStatus: string;
}

export function AdminOrdersTable({
  orders,
  expandedOrderIds,
  setExpandedOrderIds,
  isPartner,
  setStatusDialogOrderId,
  setNextStatus,
  normalizeShippingAddress,
  getOrderItemDisplay,
  statusLabel,
  searchQuery,
  filterStatus,
}: AdminOrdersTableProps) {
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch = !searchQuery || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String((o as any).user_summary?.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String((o as any).user_summary?.phone ?? '').includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-500" />
          لیست سفارش‌ها
        </h2>
        <span className="text-xs text-zinc-400">{filtered.length} سفارش</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-bold">سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const shippingAddress = normalizeShippingAddress(order.shipping_address);
            const isExpanded = Boolean(expandedOrderIds[order.id]);
            const orderTotal = Number(order.total_price) + Number(order.shipping_cost);
            const userName = String((order as any).user_summary?.full_name ?? 'کاربر');
            const userPhone = String((order as any).user_summary?.phone ?? order.user_id);

            return (
              <Fragment key={order.id}>
                {/* Order Card Row */}
                <div className={`rounded-2xl border transition-all ${
                  isExpanded 
                    ? 'border-indigo-200 dark:border-indigo-800 shadow-md' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm'
                } bg-white dark:bg-zinc-950`}>
                  <div className="flex items-center gap-3 p-4">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedOrderIds(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Order ID */}
                    <div className="shrink-0 w-20">
                      <p className="text-[10px] text-zinc-400 font-bold">شناسه</p>
                      <p className="font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">#{order.id.slice(0, 8)}</p>
                    </div>

                    {/* User */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{userName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono" dir="ltr">{userPhone}</p>
                    </div>

                    {/* Items count */}
                    <div className="hidden sm:block shrink-0 text-center">
                      <p className="text-[10px] text-zinc-400 font-bold">اقلام</p>
                      <p className="font-bold text-sm">{((order as any).items_count ?? order.items.length).toLocaleString('fa-IR')}</p>
                    </div>

                    {/* Total */}
                    <div className="shrink-0 text-left">
                      <p className="text-[10px] text-zinc-400 font-bold">مبلغ</p>
                      <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{orderTotal.toLocaleString('fa-IR')} ت</p>
                    </div>

                    {/* Status badge */}
                    <span className={`shrink-0 hidden md:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLE[order.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Shipping Address */}
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 space-y-1">
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />آدرس ارسال
                          </p>
                          {shippingAddress ? (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                              <p className="font-bold text-zinc-800 dark:text-zinc-200">{String(shippingAddress.fullName ?? 'نامشخص')}</p>
                              <p dir="ltr" className="text-right font-mono">{String(shippingAddress.phone ?? '-')}</p>
                              <p>{String(shippingAddress.province ?? '')}{shippingAddress.city ? `، ${String(shippingAddress.city)}` : ''}</p>
                              <p className="leading-relaxed">{String(shippingAddress.address ?? '-')}</p>
                              {shippingAddress.postalCode && <p>کدپستی: {String(shippingAddress.postalCode)}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">آدرس ثبت نشده</p>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 space-y-1">
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />اطلاعات پرداخت
                          </p>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                            <p>روش: {order.payment_method ?? '-'}</p>
                            <p>کد مرجع: {order.payment_ref ?? '-'}</p>
                            <p>ثبت: {new Date(order.created_at).toLocaleString('fa-IR')}</p>
                            <p>آخرین بروز: {new Date(order.updated_at).toLocaleString('fa-IR')}</p>
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 space-y-1">
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 mb-2">
                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />خلاصه مالی
                          </p>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                            <p>جمع اقلام: {Number(order.total_price).toLocaleString('fa-IR')} ت</p>
                            <p>هزینه ارسال: {Number(order.shipping_cost).toLocaleString('fa-IR')} ت</p>
                            <p className="font-black text-zinc-900 dark:text-white text-sm pt-1 border-t border-zinc-200 dark:border-zinc-700 mt-1">
                              قابل پرداخت: {orderTotal.toLocaleString('fa-IR')} ت
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div>
                        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-purple-500" />آیتم‌های سفارش
                        </p>
                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/80">
                              <tr>
                                <th className="p-2.5 text-right font-bold text-zinc-600 dark:text-zinc-400">محصول</th>
                                <th className="p-2.5 text-right font-bold text-zinc-600 dark:text-zinc-400">SKU</th>
                                <th className="p-2.5 text-right font-bold text-zinc-600 dark:text-zinc-400">تعداد</th>
                                <th className="p-2.5 text-right font-bold text-zinc-600 dark:text-zinc-400">قیمت واحد</th>
                                <th className="p-2.5 text-right font-bold text-zinc-600 dark:text-zinc-400">جمع</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {order.items.map((item, index) => {
                                const d = getOrderItemDisplay(item);
                                return (
                                  <tr key={`${order.id}-${d.key}-${index}`} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-2.5 font-medium text-zinc-800 dark:text-zinc-200">{d.title}</td>
                                    <td className="p-2.5 font-mono text-zinc-500" dir="ltr">{d.sku}</td>
                                    <td className="p-2.5 text-zinc-700 dark:text-zinc-300">{d.quantity.toLocaleString('fa-IR')}</td>
                                    <td className="p-2.5 text-zinc-700 dark:text-zinc-300">{d.unitPrice.toLocaleString('fa-IR')} ت</td>
                                    <td className="p-2.5 font-bold text-zinc-900 dark:text-white">{d.subtotal.toLocaleString('fa-IR')} ت</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Status Action Bar */}
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[order.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                            {statusLabel[order.status]}
                          </span>
                          <span className="text-xs text-zinc-400">وضعیت فعلی سفارش</span>
                        </div>
                        {!isPartner && (
                          <Button
                            size="sm"
                            onClick={() => { setStatusDialogOrderId(order.id); setNextStatus(order.status); }}
                            className="h-8 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> تغییر وضعیت
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}
