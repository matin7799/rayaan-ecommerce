"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Maximize2, X, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images }: { images: string[] }) {
  // فیلتر کردن تصاویر خالی و تنظیم تصویر پیش‌فرض
  const validImages = images.filter(img => img && img.trim() !== "")
  const finalImages = validImages.length > 0 ? validImages : ["https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png"]
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // برای جلوگیری از خطای Hydration در استفاده از Portal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // بستن مودال با دکمه Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // جلوگیری از اسکرول صفحه وقتی مودال باز است
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isFullscreen])

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % finalImages.length)
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length)

  const lightboxContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <button
        onClick={() => setIsFullscreen(false)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-destructive/80 text-white transition-colors"
      >
        <X className="size-6" />
      </button>

      <button onClick={prevImage} className="absolute left-4 md:left-12 z-50 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:-translate-x-1">
        <ChevronLeft className="size-8" />
      </button>

      <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video px-4 md:px-12">
        <Image
          src={finalImages[activeIndex]}
          alt="تصویر تمام صفحه"
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <button onClick={nextImage} className="absolute right-4 md:right-12 z-50 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:translate-x-1">
        <ChevronRight className="size-8" />
      </button>
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-secondary/10 border border-border/50">
          <Image
            src={finalImages[activeIndex]}
            alt="تصویر محصول"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 z-10 p-3 rounded-full bg-background/80 backdrop-blur-md border shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:text-primary"
          >
            <Maximize2 className="size-5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {finalImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300",
                activeIndex === idx
                  ? "border-primary ring-4 ring-primary/20 scale-95"
                  : "border-transparent bg-secondary/20 hover:border-primary/40 opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* استفاده از Portal برای انتقال مودال به body */}
      {mounted && isFullscreen && createPortal(lightboxContent, document.body)}
    </>
  )
}
