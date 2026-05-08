"use client"

import { useMemo } from "react"
import {
  AlignLeft,
  Settings,
  MessageSquare,
  Star,
  CheckCircle2,
  ThumbsUp,
  PencilLine,
  MessageSquareDashed,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductTabsProps {
  product: {
    fullDescription: string
    specifications: { name: string; value: string }[]
    rating: number
    reviewsCount: number
    reviews: {
      id: string
      user: string
      date: string
      rating: number
      comment: string
      isBuyer: boolean
      likes: number
    }[]
  }
}

// هدر سکشن‌ها با دیزاین مدرن‌تر
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-8 w-2 animate-pulse rounded-full bg-primary/40 blur-sm md:h-10" />
        <span className="relative h-8 w-2 rounded-full bg-primary md:h-10" />
      </div>
      <h3 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h3>
    </div>
  )
}

function StarRating({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            `size-${size}`,
            s <= Math.round(rating)
              ? "fill-amber-500 text-amber-500 drop-shadow-sm"
              : "fill-muted/30 text-muted"
          )}
        />
      ))}
    </div>
  )
}

// کارت مشخصات با افکت هاور شناور
function SpecItem({ name, value }: { name: string; value: string }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-gradient-to-l from-background/40 to-secondary/10 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground md:text-base">
        {name}
      </span>
      <span className="font-mono text-sm font-semibold tracking-wide dir-ltr md:text-base">
        {value}
      </span>
    </div>
  )
}

// کارت نظرات با دیزاین پریمیوم
function ReviewCard({ review }: { review: ProductTabsProps["product"]["reviews"][number] }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/40 bg-background p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 md:p-6">
      {/* یک درخشش ملایم در پس زمینه کارت هنگام هاور */}
      <div className="absolute -inset-x-20 -inset-y-20 z-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10 mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* آواتار با گرادیانت */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 pt-1 text-lg font-extrabold text-primary shadow-inner ring-1 ring-primary/10 md:size-14 md:text-xl">
            {review.user.charAt(0)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold">{review.user}</span>

              {review.isBuyer && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 backdrop-blur-sm dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  خریدار محصول
                </span>
              )}
            </div>
            <div className="mt-1 text-xs font-medium text-muted-foreground/70">{review.date}</div>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-2xl border border-border/50 bg-secondary/20 px-3 py-1.5 shadow-sm">
          <span className="pt-0.5 text-sm font-bold">{review.rating}</span>
          <Star className="size-4 fill-amber-500 text-amber-500 drop-shadow-sm" />
        </div>
      </div>

      <p className="relative z-10 mb-5 text-sm leading-8 text-muted-foreground text-justify md:text-[15px]">
        {review.comment}
      </p>

      <div className="relative z-10 flex items-center justify-end border-t border-border/40 pt-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <span className="pt-0.5">{review.likes}</span>
          <ThumbsUp className="size-4 transition-transform group-hover:scale-110" />
          <span className="pt-0.5">مفید بود</span>
        </button>
      </div>
    </article>
  )
}

function ReviewSummary({
  rating,
  reviewsCount,
  distribution,
}: {
  rating: number
  reviewsCount: number
  distribution: { star: number; count: number; percent: number }[]
}) {
  return (
    <aside className="rounded-3xl border border-border/50 bg-secondary/10 p-6 md:p-8 lg:sticky lg:top-32 shadow-sm">
      <div className="mb-8 flex items-center gap-5">
        {/* گرادیانت روی عدد امتیاز */}
        <div className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-black leading-none text-transparent md:text-6xl pt-2">
          {rating.toFixed(1)}
        </div>

        <div className="space-y-1.5">
          <StarRating rating={rating} size={5} />
          <div className="text-sm font-medium text-muted-foreground">
            بر اساس {reviewsCount} نظر ثبت‌شده
          </div>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        {distribution.map((item) => (
          <div key={item.star} className="group flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm font-bold text-muted-foreground transition-colors group-hover:text-foreground">
              {item.star} ستاره
            </span>
            <Progress 
              value={item.percent} 
              className="h-2.5 flex-1 bg-secondary/50 [&>div]:bg-amber-500" 
            />
            <span className="w-10 shrink-0 text-left text-xs font-medium text-muted-foreground">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      <Button className="group h-12 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/30">
        <PencilLine className="ml-2 size-5 transition-transform group-hover:-rotate-12" />
        ثبت نظر جدید
      </Button>
    </aside>
  )
}

export function ProductTabs({ product }: ProductTabsProps) {
  const reviewDistribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((star) => {
      const count = product.reviews.filter((r) => Math.round(r.rating) === star).length
      const percent = product.reviewsCount
        ? (count / product.reviewsCount) * 100
        : 0

      return { star, count, percent }
    })
    return counts
  }, [product.reviews, product.reviewsCount])

  return (
    <section className="mt-14 w-full md:mt-20">
      <Tabs defaultValue="description" className="w-full">
        
        {/* Tabs Header */}
        <div className="sticky top-16 z-30 mb-8 border-b border-border/30 bg-background/70 pb-4 backdrop-blur-xl md:top-20 md:mb-10">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="flex h-14 w-max min-w-full justify-start gap-2 rounded-2xl border border-border/40 bg-secondary/20 p-1.5 shadow-inner">
              <TabsTrigger
                value="description"
                className="whitespace-nowrap rounded-xl px-5 py-2.5 transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md md:px-7"
              >
                <span className="flex items-center gap-2.5">
                  <AlignLeft className="size-4.5" />
                  <span className="text-[15px] font-bold tracking-wide">معرفی محصول</span>
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="specifications"
                className="whitespace-nowrap rounded-xl px-5 py-2.5 transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md md:px-7"
              >
                <span className="flex items-center gap-2.5">
                  <Settings className="size-4.5" />
                  <span className="text-[15px] font-bold tracking-wide">مشخصات فنی</span>
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="reviews"
                className="whitespace-nowrap rounded-xl px-5 py-2.5 transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md md:px-7"
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className="size-4.5" />
                  <span className="text-[15px] font-bold tracking-wide">نظرات کاربران</span>
                  <span className="ml-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {product.reviewsCount}
                  </span>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content: Description */}
        <TabsContent
          value="description"
          className="animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          <div className="rounded-3xl border border-border/40 bg-secondary/5 p-6 shadow-sm md:p-8 lg:p-10">
            <SectionHeader title="معرفی کامل محصول" />
            <div className="prose prose-neutral max-w-none leading-9 text-muted-foreground dark:prose-invert md:text-[17px]">
              <p className="text-justify">{product.fullDescription}</p>
            </div>
          </div>
        </TabsContent>

        {/* Content: Specifications */}
        <TabsContent
          value="specifications"
          className="animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          <div className="rounded-3xl border border-border/40 bg-secondary/5 p-6 shadow-sm md:p-8 lg:p-10">
            <SectionHeader title="مشخصات فنی" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8 lg:gap-x-12">
              {product.specifications.map((spec, index) => (
                <SpecItem key={`${spec.name}-${index}`} name={spec.name} value={spec.value} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Content: Reviews */}
        <TabsContent
          value="reviews"
          className="animate-in fade-in slide-in-from-bottom-6 duration-500"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <ReviewSummary
                rating={product.rating}
                reviewsCount={product.reviewsCount}
                distribution={reviewDistribution}
              />
            </div>

            <div className="space-y-5 lg:col-span-8">
              {product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-secondary/5 py-16 text-center transition-colors hover:border-primary/30 hover:bg-secondary/10">
                  <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <MessageSquareDashed className="size-8" />
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-foreground">هنوز نظری ثبت نشده</h4>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    شما اولین نفری باشید که تجربه استفاده از این محصول را با دیگران به اشتراک می‌گذارد.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
      </Tabs>
    </section>
  )
}
