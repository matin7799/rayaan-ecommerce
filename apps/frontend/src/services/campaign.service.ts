import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// ========== Types ==========
export interface CampaignProduct {
  productId: string;
  discountPercent: number;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products: CampaignProduct[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

// ========== Campaign Service ==========
export const campaignService = {
  /**
   * Get all campaigns
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await apiClient.get<ApiResponse<Campaign[]>>(
      API_ENDPOINTS.CAMPAIGNS.LIST
    );
    return data.data;
  },

  /**
   * Get active campaigns only
   */
  getActiveCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await apiClient.get<ApiResponse<Campaign[]>>(
      API_ENDPOINTS.CAMPAIGNS.ACTIVE
    );
    return data.data;
  },

  /**
   * Get single campaign by ID
   */
  getCampaignById: async (id: string): Promise<Campaign> => {
    const { data } = await apiClient.get<ApiResponse<Campaign>>(
      API_ENDPOINTS.CAMPAIGNS.DETAIL(id)
    );
    return data.data;
  },
};
