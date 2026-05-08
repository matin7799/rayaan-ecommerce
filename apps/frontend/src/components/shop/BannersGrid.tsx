'use client';

import React from 'react';
import { useBanners } from '@/lib/hooks/queries/useBanners';
import { BannerPosition } from '@/services/banner.service';
import { Banner, BannerVariant, BannerSize } from './Banner';
import { Loader2 } from 'lucide-react';

interface BannersGridProps {
  position?: BannerPosition;
  variant?: BannerVariant;
  size?: BannerSize;
  className?: string;
  gridClassName?: string;
  limit?: number;
}

export function BannersGrid({ 
  position,
  variant = 'minimal', 
  size = 'md',
  className,
  gridClassName = 'grid grid-cols-1 md:grid-cols-2 gap-6',
  limit
}: BannersGridProps) {
  const { data: banners, isLoading } = useBanners(position);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[240px] rounded-2xl bg-zinc-100 dark:bg-zinc-900 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const displayBanners = limit ? banners.slice(0, limit) : banners;

  if (displayBanners.length === 0) {
    return null;
  }

  return (
    <div className={gridClassName}>
      {displayBanners.map((banner) => (
        <Banner
          key={banner.id}
          title={banner.title}
          subtitle={banner.description || undefined}
          imageUrl={banner.imageUrl}
          ctaText={banner.linkUrl ? 'مشاهده بیشتر' : undefined}
          ctaLink={banner.linkUrl || undefined}
          variant={variant}
          size={size}
          className={className}
        />
      ))}
    </div>
  );
}
