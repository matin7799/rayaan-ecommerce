'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md">
      {/* Product Image */}
      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-muted/50">
        <Image
          src={safeImage}
          alt={item.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base line-clamp-2 mb-1">{item.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          {safePrice.toLocaleString()} تومان
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handleDecrease}
              disabled={item.quantity <= 1 || isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxQuantity || isUpdating}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            <span>حذف</span>
          </Button>
        </div>

        {item.quantity >= item.maxQuantity && (
          <p className="text-xs text-orange-500 mt-2">حداکثر موجودی</p>
        )}
      </div>

      {/* Line Total (Desktop) */}
      <div className="hidden sm:block text-left shrink-0">
        <p className="text-sm text-muted-foreground mb-1">جمع سطر:</p>
        <p className="font-bold text-lg text-primary">
          {(safePrice * item.quantity).toLocaleString()} <span className="text-sm font-normal">تومان</span>
        </p>
      </div>
    </div>
  );
}
