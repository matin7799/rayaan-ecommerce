'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { useBanners } from '@/lib/hooks/queries/useBanners';
import { BannerPosition } from '@/services/banner.service';

const gradients = [
  'from-orange-600/80 to-red-700/90',
  'from-purple-600/80 to-indigo-700/90',
  'from-blue-600/80 to-cyan-700/90',
];

export function HeroSideBanners() {
  const { data: banners, isLoading } = useBanners(BannerPosition.SIDEBAR);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 lg:gap-6 h-full">
        <div className="flex-1 rounded-2xl bg-neutral-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
        <div className="flex-1 rounded-2xl bg-neutral-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const displayBanners = banners.slice(0, 2);

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full">
      {displayBanners.map((banner, index) => {
        const gradient = gradients[index % gradients.length];
        return (
          <Link
            key={banner.id}
            href={banner.linkUrl || '/products'}
            className="relative flex-1 rounded-2xl overflow-hidden group cursor-pointer bg-neutral-900 shadow-xl hover:shadow-2xl transition-all"
          >
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                sizes="33vw"
              />
            </div>

            {/* Gradients */}
            <div className={`absolute inset-0 z-10 bg-gradient-to-t ${gradient} mix-blend-multiply`} />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Glow */}
            <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            </div>

            {/* Badge */}
            {banner.description && (
              <div className="absolute top-4 lg:top-5 xl:top-6 right-4 lg:right-5 xl:right-6 z-30">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs lg:text-sm font-bold border border-white/30">
                  <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  {banner.description}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 xl:p-8 z-20 flex justify-between items-end gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg lg:text-xl xl:text-2xl mb-1.5 drop-shadow-lg">
                  {banner.title}
                </h3>
                {banner.description && (
                  <p className="text-white/90 text-sm lg:text-base font-medium drop-shadow-md line-clamp-1">
                    {banner.description}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 group-hover:scale-110 shadow-lg">
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
      })}
    </div>
  );
}
