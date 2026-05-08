import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export enum BannerPosition {
  HOME_HERO = 'home_hero',
  HOME_SECONDARY = 'home_secondary',
  CATEGORY_TOP = 'category_top',
  SIDEBAR = 'sidebar',
  FOOTER = 'footer',
}

export interface Banner {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  clickCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export const bannerService = {
  /**
   * Get all active banners
   */
  getActiveBanners: async (): Promise<Banner[]> => {
    const { data } = await apiClient.get<ApiResponse<Banner[]>>(
      `${API_ENDPOINTS.BANNERS.LIST}?active=true`
    );
    return data.data;
  },

  /**
   * Get banners by position
   */
  getBannersByPosition: async (position: BannerPosition): Promise<Banner[]> => {
    const { data } = await apiClient.get<ApiResponse<Banner[]>>(
      API_ENDPOINTS.BANNERS.BY_POSITION(position)
    );
    return data.data;
  },
};
