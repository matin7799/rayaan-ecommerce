import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimated_days: number | null;
  is_active: boolean;
  is_pay_on_delivery: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export const shippingService = {
  getShippingMethods: async (): Promise<ShippingMethod[]> => {
    const { data } = await apiClient.get<ApiResponse<ShippingMethod[]>>(
      API_ENDPOINTS.SHIPPING_METHODS
    );
    return data.data;
  },
};
