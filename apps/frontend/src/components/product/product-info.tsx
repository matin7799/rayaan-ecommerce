"use client"

import { useState } from "react"
import { Star, Truck, ShoppingCart, Heart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { cartService } from "@/services/cart.service"

interface ProductColor {
  id: string
  name: string
  hex?: string
}

interface ProductInfoProps {
  product: {
    id: string
    title: string
    brand: string
    shortDescription?: string
    price: number
    originalPrice?: number
    discountPercentage?: number
    rating: number
    reviewsCount: number
    stockStatus: number
    colors: ProductColor[]
    variants?: Array<{ id: string; sku: string; price: number }>
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id || product.variants?.[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const variantId = selectedColor || product.variants?.[0]?.id
      
      if (!variantId) {
        toast.error('لطفا یک گزینه انتخاب کنید')
        return
      }

      await cartService.addToCart({ variantId, quantity })
      toast.success('محصول به سبد خرید اضافه شد')
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error('خطا در افزودن به سبد خرید')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* برند و امتیاز */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{product.brand}</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewsCount} نظر)</span>
        </div>
      </div>

      {/* عنوان */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">{product.title}</h1>
        {product.shortDescription && <p className="text-sm text-muted-foreground">{product.shortDescription}</p>}
      </div>

      {/* رنگ‌ها */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">رنگ:</span>
            {product.colors.find((c: ProductColor) => c.id === selectedColor)?.name}
          </div>
          <div className="flex gap-2">
          {product.colors.map((color: ProductColor) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all cursor-pointer hover:scale-110 flex items-center justify-center text-xs font-medium",
                selectedColor === color.id
                  ? "border-primary ring-2 ring-primary/30 scale-110"
                  : "border-border hover:border-primary/50"
              )}
              style={color.hex ? { backgroundColor: color.hex } : {}}
              title={color.name}
            >
              {!color.hex && <span>{color.name.substring(0, 2)}</span>}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* قیمت */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-primary">{product.price.toLocaleString()}</span>
          <span className="text-lg text-muted-foreground">تومان</span>
        </div>
        {product.originalPrice && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg text-muted-foreground line-through">{product.originalPrice.toLocaleString()}</span>
            {product.discountPercentage && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-500 text-white text-sm font-bold">
                {product.discountPercentage}% تخفیف
              </span>
            )}
          </div>
        )}
      </div>

      {/* موجودی */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
        <Activity className="w-5 h-5 text-primary" />
        <span className="text-sm">
          {product.stockStatus > 0 ? (
            <>موجودی: <strong>{product.stockStatus}</strong> عدد</>
          ) : (
            <strong className="text-red-500">ناموجود</strong>
          )}
        </span>
      </div>

      {/* تعداد و دکمه‌ها */}
      <div className="flex gap-3">
        
        {/* انتخاب تعداد */}
        <div className="flex items-center border border-border rounded-xl overflow-hidden">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 hover:bg-muted transition-colors"
          >
            -
          </button>
          <div className="px-6 py-3 font-bold min-w-[60px] text-center border-x border-border">
            {quantity}
          </div>
          <button 
            onClick={() => setQuantity(Math.min(product.stockStatus, quantity + 1))}
            className="px-4 py-3 hover:bg-muted transition-colors"
            disabled={quantity >= product.stockStatus}
          >
            +
          </button>
        </div>

        <Button 
          size="lg"
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stockStatus === 0}
          className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
        >
          <ShoppingCart className="w-5 h-5 ml-2" />
          {isAddingToCart ? 'در حال افزودن...' : product.stockStatus === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
        </Button>

        <Button 
          size="lg" 
          variant="outline"
          className="h-14 px-4 border-2"
        >
          <Heart className="w-5 h-5" />
        </Button>
        
      </div>

      {/* ارسال رایگان */}
      <div className="flex items-center gap-3 p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl border border-green-500/20">
        <Truck className="w-5 h-5" />
        <span className="text-sm font-medium">ارسال رایگان برای سفارش‌های بالای 500 هزار تومان</span>
      </div>

    </div>
  )
}
