'use client';

import { Receipt, MapPin, CreditCard, User, Phone, Globe, Compass, Mail, Clipboard } from 'lucide-react';
import type { Order } from '@/services/order.service';

interface OrderSidebarProps {
  order: Order;
}

export function OrderSidebar({ order }: OrderSidebarProps) {
  // Parse shipping address safely if it is JSON or string
  let addressInfo: {
    fullName?: string;
    phone?: string;
    province?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  } | null = null;

  if (order.shipping_address) {
    if (typeof order.shipping_address === 'string') {
      try {
        addressInfo = JSON.parse(order.shipping_address);
      } catch {
        // Not a JSON string, will fall back to raw string rendering
      }
    } else if (typeof order.shipping_address === 'object') {
      addressInfo = order.shipping_address as any;
    }
  }

  return (
    <div className="space-y-6 font-bold" dir="rtl">
      {/* Order Summary Card */}
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-[#008080]/10 rounded-full blur-[40px] pointer-events-none" />
        
        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#008080]/10 border border-[#008080]/15 dark:border-white/5">
            <Receipt className="w-4.5 h-4.5 text-[#008080] dark:text-[#20B2AA]" />
          </div>
          <span>خلاصه مالی سفارش</span>
        </h2>

        <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between items-center">
            <span>جمع کل مبلغ کالاها</span>
            <span className="text-zinc-800 dark:text-zinc-200">
              {Number(order.total_price || 0).toLocaleString('fa-IR')}{' '}
              <span className="text-[10px] font-normal text-zinc-400">تومان</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>هزینه حمل و ارسال</span>
            <span className="text-zinc-800 dark:text-zinc-200">
              {Number(order.shipping_cost || 0) === 0 ? (
                <span className="text-emerald-500 font-extrabold bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-lg">رایگان</span>
              ) : (
                <>
                  {Number(order.shipping_cost || 0).toLocaleString('fa-IR')}{' '}
                  <span className="text-[10px] font-normal text-zinc-400">تومان</span>
                </>
              )}
            </span>
          </div>

          <div className="pt-4 mt-1 border-t border-white/40 dark:border-white/5 flex justify-between items-center text-sm font-black">
            <span className="text-zinc-700 dark:text-zinc-300">مبلغ نهایی پرداخت‌شده</span>
            <span className="text-[#008080] dark:text-[#20B2AA] text-base">
              {(
                Number(order.total_price || 0) + Number(order.shipping_cost || 0)
              ).toLocaleString('fa-IR')}{' '}
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mr-0.5">تومان</span>
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address Information */}
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-[#20B2AA]/10 rounded-full blur-[40px] pointer-events-none" />

        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#20B2AA]/10 border border-[#20B2AA]/15 dark:border-white/5">
            <MapPin className="w-4.5 h-4.5 text-[#20B2AA]" />
          </div>
          <span>مشخصات تحویل و ارسال</span>
        </h2>

        <div className="text-xs space-y-3">
          {addressInfo ? (
            <div className="space-y-3.5">
              {addressInfo.fullName && (
                <div className="flex gap-2.5 items-start bg-white/20 dark:bg-white/5 p-2.5 rounded-xl border border-white/30 dark:border-white/5">
                  <User className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold">نام تحویل‌گیرنده</p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-extrabold">{addressInfo.fullName}</p>
                  </div>
                </div>
              )}

              {addressInfo.phone && (
                <div className="flex gap-2.5 items-start bg-white/20 dark:bg-white/5 p-2.5 rounded-xl border border-white/30 dark:border-white/5">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold">شماره تماس اضطراری</p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-extrabold tracking-wide" dir="ltr">{addressInfo.phone}</p>
                  </div>
                </div>
              )}

              {(addressInfo.province || addressInfo.city) && (
                <div className="flex gap-2.5 items-start bg-white/20 dark:bg-white/5 p-2.5 rounded-xl border border-white/30 dark:border-white/5">
                  <Globe className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold">استان / شهر مقصد</p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-extrabold">
                      {addressInfo.province}، {addressInfo.city}
                    </p>
                  </div>
                </div>
              )}

              {addressInfo.address && (
                <div className="flex gap-2.5 items-start bg-white/20 dark:bg-white/5 p-2.5 rounded-xl border border-white/30 dark:border-white/5">
                  <Compass className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold">نشانی دقیق پستی</p>
                    <p className="text-zinc-700 dark:text-zinc-300 font-normal leading-relaxed text-[11px]" dir="ltr">
                      {addressInfo.address}
                    </p>
                  </div>
                </div>
              )}

              {addressInfo.postalCode && (
                <div className="flex gap-2.5 items-start bg-white/20 dark:bg-white/5 p-2.5 rounded-xl border border-white/30 dark:border-white/5">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold">کد پستی ده رقمی</p>
                    <p className="text-zinc-850 dark:text-zinc-200 font-black tracking-widest">{addressInfo.postalCode}</p>
                  </div>
                </div>
              )}
            </div>
          ) : order.shipping_address ? (
            <div className="bg-white/20 dark:bg-white/5 p-3 rounded-xl border border-white/30 dark:border-white/5 text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal text-[11px]">
              {typeof order.shipping_address === 'string'
                ? order.shipping_address
                : JSON.stringify(order.shipping_address)}
            </div>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500 font-bold">آدرس ارسال در سیستم یافت نشد</p>
          )}
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-[-25%] right-[-15%] w-36 h-36 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

        <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15 dark:border-white/5">
            <CreditCard className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <span>مشخصات مالی و درگاه</span>
        </h2>

        <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between items-center">
            <span>شیوه تسویه حساب</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-black">
              {order.payment_method === 'online' ? 'درگاه آنلاین شتاب' : order.payment_method || 'پرداخت الکترونیک'}
            </span>
          </div>

          <div className="flex justify-between items-center bg-white/20 dark:bg-white/5 p-2 rounded-xl border border-white/30 dark:border-white/5">
            <span className="flex items-center gap-1">
              <Clipboard className="w-3.5 h-3.5 text-zinc-400" />
              <span>کد پیگیری تراکنش</span>
            </span>
            <span className="font-black text-zinc-850 dark:text-zinc-100 tracking-wider" dir="ltr">
              {order.payment_ref || 'ثبت نشده'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
