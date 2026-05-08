import { useQuery } from '@tanstack/react-query';
import { bannerService, BannerPosition } from '@/services/banner.service';

export function useBanners(position?: BannerPosition) {
  return useQuery({
    queryKey: ['banners', position],
    queryFn: () => 
      position 
        ? bannerService.getBannersByPosition(position)
        : bannerService.getActiveBanners(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
