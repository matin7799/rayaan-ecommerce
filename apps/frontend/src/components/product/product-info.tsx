"use client"

import { useEffect, useState } from "react"
import {
  Star, Truck, ShoppingCart, Heart, Activity, Shield,
  RefreshCw, Loader2, Minus, Plus, Zap, Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { cartService } from "@/services/cart.service"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { getErrorMessage } from "@/lib/api/error-handler"
import { DigipayWidget } from "./DigipayWidget"

interface ProductColor { id: string; name: string; hex?: string }

interface ProductInfoProps {
  product: {
    id: string; slug?: string; title: string; brand: string
    shortDescription?: string; price: number; originalPrice?: number
    discountPercentage?: number; rating: number; reviewsCount: number
    stockStatus: number; images?: string[]; colors: ProductColor[]
    variants?: Array<{ id: string; sku: string; price: number }>
    debug?: { channel?: 'public' | 'torob'; basePrice?: number; finalPrice?: number; mappedPrice?: number; mappedOriginalPrice?: number }
  }
}

const TOROB_ATTR_KEY = 'torob_attribution_until'

function TorobBanner({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 px-4 py-3 text-amber-900 dark:text-amber-300">
      <div className="p-1.5 bg-amber-400/20 rounded-lg shrink-0"><Timer className="w-4 h-4 text-amber-600" /></div>
      <div>
        <p className="text-xs font-bold">قیمت ویژه ترب فعال است</p>
        <p className="text-sm font-black tracking-widest">{m}:{s}</p>
      </div>
      <div className="mr-auto">
        <Zap className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
      </div>
    </div>
  )
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} className={cn("w-4 h-4", s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700")} />
        ))}
      </div>
      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{rating}</span>
      <span className="text-xs text-zinc-400">({count.toLocaleString('fa-IR')} نظر)</span>
    </div>
  )
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.colors[0]?.id || product.variants?.[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const toggleWishlist = useWishlistStore(s => s.toggleItem)
  const isFavorite = useWishlistStore(s => s.isInWishlist(product.id))

  const safePrice = Number(product.price) || 0
  const safeOriginalPrice = Number(product.originalPrice) || 0
  const hasDiscount = safeOriginalPrice > safePrice && safeOriginalPrice > 0
  const discountPct = hasDiscount ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100) : undefined
  const savings = hasDiscount ? safeOriginalPrice - safePrice : 0
  const isOutOfStock = product.stockStatus === 0

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('utm_source')?.toLowerCase() === 'torob') {
      url.searchParams.delete('utm_source')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
    const tick = () => {
      const until = parseInt(localStorage.getItem(TOROB_ATTR_KEY) ?? '0', 10)
      setRemainingSeconds(Math.max(0, Math.floor((until - Date.now()) / 1000)))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const variantId = selectedVariant || product.variants?.[0]?.id
      if (!variantId) { toast.error('لطفا یک گزینه انتخاب کنید'); return }
      await cartService.addToCart({ variantId, quantity })
      toast.success('محصول به سبد خرید اضافه شد ✓')
    } catch (error) {
      const msg = getErrorMessage(error)
      msg.includes('رزرو') ? toast.warning(msg) : toast.error(msg || 'خطا در افزودن به سبد خرید')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = () => {
    const added = toggleWishlist({
      id: product.id, slug: product.slug || product.id, title: product.title, brand: product.brand,
      thumbnail: product.images?.[0] || "",
      thumbnailAlt: product.title,
      price: safeOriginalPrice > safePrice ? safeOriginalPrice : safePrice,
      discountPrice: safeOriginalPrice > safePrice ? safePrice : undefined,
      rating: product.rating, reviewsCount: product.reviewsCount, inStock: product.stockStatus > 0,
    })
    toast.success(added ? "به علاقه‌مندی‌ها اضافه شد ♡" : "از علاقه‌مندی‌ها حذف شد")
  }

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      {remainingSeconds > 0 && <TorobBanner seconds={remainingSeconds} />}

      {/* Brand + Rating */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          {product.brand}
        </span>
        <StarRow rating={product.rating} count={product.reviewsCount} />
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">{product.title}</h1>
        {product.shortDescription && (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{product.shortDescription}</p>
        )}
      </div>

      {/* Variant / Color selector */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-zinc-600 dark:text-zinc-400">رنگ:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {product.colors.find(c => c.id === selectedVariant)?.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedVariant(color.id)}
                title={color.name}
                className={cn(
                  "w-10 h-10 rounded-full border-3 transition-all hover:scale-110 flex items-center justify-center text-xs font-bold",
                  selectedVariant === color.id ? "border-primary ring-3 ring-primary/25 scale-110 shadow-md" : "border-zinc-300 dark:border-zinc-600 hover:border-primary/50"
                )}
                style={color.hex ? { backgroundColor: color.hex } : {}}
              >
                {!color.hex && color.name.substring(0, 2)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Card */}
      <div className={cn(
        "rounded-2xl p-5 border",
        hasDiscount
          ? "bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border-red-200/60 dark:border-red-800/40"
          : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
      )}>
        <div className="flex items-end gap-3 mb-1">
          <span className={cn("text-4xl font-black tracking-tight", hasDiscount ? "text-red-600 dark:text-red-400" : "text-primary")}>
            {safePrice.toLocaleString('fa-IR')}
          </span>
          <span className="text-base text-zinc-500 mb-1">تومان</span>
          {discountPct && (
            <span className="mr-auto inline-flex items-center px-2.5 py-1 rounded-xl bg-red-500 text-white text-sm font-black shadow-sm shadow-red-500/30">
              {discountPct}٪ تخفیف
            </span>
          )}
        </div>

        {hasDiscount && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 line-through">{safeOriginalPrice.toLocaleString('fa-IR')} تومان</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              {savings.toLocaleString('fa-IR')} تومان سود شما
            </span>
          </div>
        )}
      </div>

      {/* DigiPay Credit & BNPL Installments Option Card */}
      {!isOutOfStock && (
        <DigipayWidget
          productTitle={product.title}
          priceTomans={safePrice}
          productId={product.id}
          variantId={selectedVariant || undefined}
        />
      )}

      {/* Stock status */}
      <div className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border",
        isOutOfStock
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400"
          : product.stockStatus <= 5
            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400"
            : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
      )}>
        <Activity className="w-4 h-4 shrink-0" />
        <span className="text-sm font-bold">
          {isOutOfStock ? "ناموجود" : product.stockStatus <= 5 ? `فقط ${product.stockStatus} عدد در انبار` : `موجود در انبار (${product.stockStatus} عدد)`}
        </span>
      </div>

      {/* Quantity row + Wishlist */}
      {!isOutOfStock && (
        <div className="flex items-center justify-between gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-11 h-11 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 text-zinc-600 dark:text-zinc-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 h-11 flex items-center justify-center font-black text-base border-x border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stockStatus, quantity + 1))}
              disabled={quantity >= product.stockStatus}
              className="w-11 h-11 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 text-zinc-600 dark:text-zinc-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Wishlist toggle */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "h-11 px-5 rounded-2xl border-2 flex items-center gap-2 text-sm font-bold transition-all duration-300",
              isFavorite
                ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-500"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            )}
          >
            <Heart className={cn("w-4 h-4 transition-all duration-300", isFavorite && "fill-rose-500 scale-125")} />
            <span className="hidden sm:inline">{isFavorite ? 'در علاقه‌مندی‌ها' : 'علاقه‌مندی'}</span>
          </button>
        </div>
      )}

      {/* ─── BIG ADD TO CART BUTTON ─── */}
      {!isOutOfStock && (
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="group relative w-full overflow-hidden rounded-3xl py-5 font-black text-xl text-white shadow-2xl shadow-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px] hover:shadow-primary/50 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/30"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)' }}
        >
          {/* Animated shimmer overlay */}
          {!isAddingToCart && (
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          )}

          {/* Soft glow ring on hover */}
          <span className="pointer-events-none absolute inset-0 rounded-3xl ring-0 group-hover:ring-4 ring-white/20 transition-all duration-300" />

          {isAddingToCart ? (
            <span className="relative flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>در حال افزودن به سبد...</span>
            </span>
          ) : (
            <span className="relative flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-5 h-5" />
              </span>
              <span className="tracking-wide">افزودن به سبد خرید</span>
              <span className="mr-1 text-sm font-bold opacity-75 bg-white/15 px-2.5 py-0.5 rounded-full">
                {(safePrice * quantity).toLocaleString('fa-IR')} ت
              </span>
            </span>
          )}
        </button>
      )}

      {/* Out of stock */}
      {isOutOfStock && (
        <button disabled className="w-full rounded-3xl py-5 font-black text-lg text-zinc-400 border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed flex items-center justify-center gap-3">
          <ShoppingCart className="w-5 h-5 opacity-40" />
          این محصول موجود نیست
        </button>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Truck, label: "ارسال سریع", sub: "سراسر کشور" },
          { icon: Shield, label: "ضمانت اصالت", sub: "کالای اورجینال" },
          { icon: RefreshCw, label: "۷ روز مرجوعی", sub: "بدون قید" },
        ].map(b => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="p-2 rounded-xl bg-primary/10">
              <b.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 leading-tight">{b.label}</span>
            <span className="text-[10px] text-zinc-400">{b.sub}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
