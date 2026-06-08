'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    quantity: number;
    maxQuantity: number;
  };
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  isUpdating = false,
  isRemoving = false 
}: CartItemProps) {
  const PLACEHOLDER_IMAGE = 'https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png';
  const safeImage = item.image && item.image.trim().length > 0 ? item.image : PLACEHOLDER_IMAGE;
  const safePrice = Number(item.price) || 0;
  const safeOriginalPrice = Number(item.originalPrice) || 0;
  const hasDiscount = safeOriginalPrice > safePrice;
  const isOutOfStock = Number(item.maxQuantity) <= 0;

  const handleDecrease = () => {
    if (item.quantity > 1 && onUpdateQuantity) {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.maxQuantity && onUpdateQuantity) {
      onUpdateQuantity(item.quantity + 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden flex flex-col gap-4 p-5 backdrop-blur-md rounded-2xl border transition-all duration-300 shadow-sm ${
        isOutOfStock 
          ? 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20 shadow-rose-500/5' 
          : 'bg-white/45 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-white/10 hover:border-[#008080]/30 hover:shadow-[0_8px_30px_rgb(0,128,128,0.06)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-zinc-200/60 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/50">
          <Image
            src={safeImage}
            alt={item.title}
            fill
            sizes="96px"
            className={`object-cover transition-transform duration-500 hover:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-zinc-800 dark:text-zinc-100 line-clamp-2 mb-1.5 leading-relaxed">{item.title}</h3>
          
          <div className="flex items-center gap-3 mb-3">
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {safeOriginalPrice.toLocaleString('fa-IR')} تومان
              </span>
            )}
            <span className="text-sm font-extrabold text-[#008080] dark:text-[#20B2AA]">
              {safePrice.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          {/* Quantity Controls & Delete */}
          <div className="flex items-center gap-4">
            {!isOutOfStock ? (
              <div className="flex items-center gap-1 bg-zinc-100/60 dark:bg-zinc-900/40 p-0.5 rounded-xl border border-zinc-200/40 dark:border-white/5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-zinc-800"
                  onClick={handleDecrease}
                  disabled={item.quantity <= 1 || isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  )}
                </Button>
                <span className="w-8 text-center text-sm font-bold text-zinc-700 dark:text-zinc-200">{item.quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-zinc-800"
                  onClick={handleIncrease}
                  disabled={item.quantity >= item.maxQuantity || isUpdating}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                </Button>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>اتمام موجودی</span>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl"
              onClick={onRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              <span className="mr-1">حذف</span>
            </Button>
          </div>

          {!isOutOfStock && item.quantity >= item.maxQuantity && (
            <p className="text-[11px] text-amber-500 font-bold mt-2 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              حداکثر موجودی در انبار
            </p>
          )}
        </div>

        {/* Line Total (Desktop) */}
        {!isOutOfStock && (
          <div className="hidden sm:block text-left shrink-0 pl-2">
            <p className="text-[11px] text-zinc-400 mb-1">جمع سطر:</p>
            <p className="font-extrabold text-base sm:text-lg text-[#008080] dark:text-[#20B2AA]">
              {(safePrice * item.quantity).toLocaleString('fa-IR')}{' '}
              <span className="text-[10px] font-medium text-zinc-500">تومان</span>
            </p>
          </div>
        )}
      </div>

      {/* Sleek Glassmorphism Alert Banner when Out of Stock */}
      {isOutOfStock && (
        <div className="w-full mt-1.5 p-3.5 rounded-xl bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-1">
          <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-ping" />
          <span className="leading-relaxed">ناموجود: این کالا به دلیل اتمام موجودی قابل سفارش نیست و باید از سبد خرید حذف گردد.</span>
        </div>
      )}
    </motion.div>
  );
}
