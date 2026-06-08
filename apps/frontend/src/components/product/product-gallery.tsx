"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Maximize2, X, ChevronRight, ChevronLeft, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "https://ranew.s3.ir-thr-at1.arvanstorage.ir/placeholder.png"

export function ProductGallery({ images }: { images: string[] }) {
  const finalImages = images.filter(Boolean).length > 0 ? images.filter(Boolean) : [PLACEHOLDER]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightbox, setIsLightbox] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => { setMounted(true) }, [])

  const next = useCallback(() => setActiveIndex(i => (i + 1) % finalImages.length), [finalImages.length])
  const prev = useCallback(() => setActiveIndex(i => (i - 1 + finalImages.length) % finalImages.length), [finalImages.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightbox(false)
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  useEffect(() => {
    document.body.style.overflow = isLightbox ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isLightbox])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div
          className={cn(
            "group relative aspect-square w-full overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner",
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsZoomed(z => !z)}
        >
          <Image
            src={finalImages[activeIndex]}
            alt="تصویر محصول"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={cn(
              "object-contain p-6 transition-all duration-500",
              isZoomed ? "scale-[2]" : "group-hover:scale-105"
            )}
            style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
          />

          {/* Gradient overlay on bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-b-3xl" />

          {/* Image counter */}
          {finalImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {finalImages.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActiveIndex(i) }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === activeIndex ? "w-6 h-2 bg-white shadow" : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Nav arrows on hover */}
          {finalImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>زوم</span>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={e => { e.stopPropagation(); setIsZoomed(false); setIsLightbox(true) }}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 shadow opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:text-primary"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails */}
        {finalImages.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {finalImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300",
                  activeIndex === idx
                    ? "border-primary ring-2 ring-primary/20 scale-95 shadow-lg"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 hover:border-primary/50 opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt={`تصویر ${idx + 1}`} fill sizes="80px" className="object-contain p-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {mounted && isLightbox && createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col bg-black/98 backdrop-blur-2xl animate-in fade-in duration-200">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="text-white/60 text-sm font-medium">{activeIndex + 1} / {finalImages.length}</span>
            <button onClick={() => setIsLightbox(false)} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center px-16">
            <div className="relative w-full max-w-4xl aspect-square">
              <Image src={finalImages[activeIndex]} alt="تصویر تمام‌صفحه" fill sizes="100vw" className="object-contain" />
            </div>

            {finalImages.length > 1 && (
              <>
                <button onClick={prev} className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110">
                  <ChevronRight className="w-7 h-7" />
                </button>
                <button onClick={next} className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110">
                  <ChevronLeft className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {finalImages.length > 1 && (
            <div className="flex justify-center gap-2 px-6 py-4 border-t border-white/10 overflow-x-auto">
              {finalImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    i === activeIndex ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-80"
                  )}
                >
                  <Image src={img} alt="" fill sizes="56px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
