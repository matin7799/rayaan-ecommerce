'use client';

import { Package, Hash, CircleDot, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DashboardOrderItem {
  id?: string;
  variant_id?: string;
  variant_sku?: string;
  product_title?: string;
  productTitle?: string;
  variantSku?: string;
  price?: string | number;
  quantity?: number;
  total_price?: string | number;
  subtotal?: string | number;
}

interface OrderItemsListProps {
  items: DashboardOrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-3xl p-5 sm:p-6.5 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.3)] relative overflow-hidden" dir="rtl">
      {/* Decorative ambient spot */}
      <div className="absolute bottom-[-20%] left-[-10%] w-36 h-36 bg-[#008080]/5 rounded-full blur-[40px] pointer-events-none" />

      <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#008080]/10 border border-[#008080]/15 dark:border-white/5">
          <Package className="w-4.5 h-4.5 text-[#008080] dark:text-[#20B2AA]" />
        </div>
        <span>لیست کالاهای سفارش</span>
      </h2>

      <div className="space-y-4">
        {items && items.length > 0 ? (
          items.map((item) => {
            const unitPrice = Number(item.price || 0);
            const qty = Number(item.quantity || 0);
            const lineTotal = Number(item.total_price || item.subtotal || unitPrice * qty);

            return (
              <motion.div
                key={item.id || item.variant_id}
                whileHover={{ scale: 1.005 }}
                className="p-4 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/5 hover:border-[#008080]/20 flex flex-col sm:flex-row gap-4.5 relative overflow-hidden transition-all duration-300"
              >
                {/* Product Image Preview */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 bg-white/60 dark:bg-zinc-900/60 rounded-xl flex items-center justify-center border border-white/50 dark:border-white/5 shadow-inner">
                  <Package className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                </div>

                {/* Product details */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-relaxed mb-2">
                      {item.product_title || item.productTitle || 'محصول سفارش داده شده'}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      <span className="flex items-center gap-1 bg-white/30 dark:bg-white/5 px-2 py-0.5 rounded-md border border-white/40 dark:border-white/5">
                        <Hash className="w-3 h-3 text-zinc-400" />
                        <span>شناسه کالا: {item.variant_sku || item.variantSku || 'نامشخص'}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-white/30 dark:bg-white/5 px-2 py-0.5 rounded-md border border-white/40 dark:border-white/5">
                        <Tag className="w-3 h-3 text-[#008080] dark:text-[#20B2AA]" />
                        <span>قیمت واحد: {unitPrice.toLocaleString('fa-IR')} تومان</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 dark:border-white/5">
                    <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <CircleDot className="w-3 h-3 text-zinc-350" />
                      <span>{qty.toLocaleString('fa-IR')} عدد</span>
                    </span>
                    <p className="font-black text-sm text-[#008080] dark:text-[#20B2AA]">
                      {lineTotal.toLocaleString('fa-IR')}{' '}
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mr-0.5">تومان</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white/10 dark:bg-white/5 rounded-2xl border border-dashed border-white/30 dark:border-white/5 font-extrabold text-xs text-zinc-500 dark:text-zinc-400">
            هیچ محصولی در این سفارش یافت نشد.
          </div>
        )}
      </div>
    </div>
  );
}
