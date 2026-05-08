import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils'; // فرض بر این است که تابع cn برای ترکیب کلاس‌ها وجود دارد

export type BannerVariant = 'premium' | 'neon' | 'sale' | 'minimal';
export type BannerSize = 'sm' | 'md' | 'lg';

export interface BannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: BannerVariant;
  size?: BannerSize;
  className?: string;
  imagePosition?: 'left' | 'right';
}

const variantStyles: Record<BannerVariant, string> = {
  premium:
    'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 text-white',
  neon: 
    'bg-slate-950 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] text-white transition-shadow duration-500',
  sale: 
    'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white',
  minimal: 
    'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800',
};

const sizeStyles: Record<BannerSize, string> = {
  sm: 'min-h-[160px] p-6',
  md: 'min-h-[240px] p-8 md:p-10',
  lg: 'min-h-[360px] p-10 md:p-16',
};

export function Banner({
  title,
  subtitle,
  description,
  imageUrl,
  ctaText,
  ctaLink,
  variant = 'minimal',
  size = 'md',
  className,
  imagePosition = 'left',
}: BannerProps) {
  const isRightImage = imagePosition === 'right';

  return (
    <div
      className={cn(
        'relative flex w-full overflow-hidden rounded-2xl group',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {/* Background Decorators based on variant */}
      {variant === 'neon' && (
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-500/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      )}
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      )}
      {variant === 'sale' && (
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Content Wrapper */}
      <div
        className={cn(
          'relative z-10 flex flex-col justify-center w-full md:w-1/2 h-full gap-4',
          isRightImage ? 'md:order-1' : 'md:order-2',
          isRightImage ? 'text-right' : 'text-right md:text-left md:items-end'
        )}
      >
        {subtitle && (
          <span
            className={cn(
              'text-sm font-bold tracking-wider uppercase',
              variant === 'premium' ? 'text-amber-400' : 
              variant === 'neon' ? 'text-cyan-400' : 
              variant === 'sale' ? 'text-rose-200' : 
              'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {subtitle}
          </span>
        )}
        
        <h3 className={cn(
          'font-black leading-tight',
          size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-6xl'
        )}>
          {title}
        </h3>

        {description && (
          <p className={cn(
            'max-w-md mt-2',
            size === 'sm' ? 'text-sm hidden md:block' : 'text-base',
            variant === 'minimal' ? 'text-zinc-600 dark:text-zinc-400' : 'text-white/80'
          )}>
            {description}
          </p>
        )}

        {ctaText && ctaLink && (
          <Link
            href={ctaLink}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-6 py-3 mt-4 text-sm font-semibold rounded-xl transition-all duration-300 w-fit',
              variant === 'premium' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' :
              variant === 'neon' ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
              variant === 'sale' ? 'bg-white text-red-600 hover:bg-zinc-100' :
              'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:scale-105'
            )}
          >
            {ctaText}
            <ArrowLeft className="w-4 h-4" /> {/* پیکان به سمت چپ برای زبان فارسی */}
          </Link>
        )}
      </div>

      {/* Image Section */}
      {imageUrl && (
        <div
          className={cn(
            'absolute inset-0 md:relative md:w-1/2 flex items-center justify-center',
            isRightImage ? 'md:order-2' : 'md:order-1'
          )}
        >
          {/* Overlay for mobile readability if image is background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:hidden z-0" />
          
          <div className="relative w-full h-full min-h-[200px] z-0 md:z-10 group-hover:scale-105 transition-transform duration-700 ease-out">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover object-center md:object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={size === 'lg'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
