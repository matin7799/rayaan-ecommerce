import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get<ApiResponse<Address[]>>(
      API_ENDPOINTS.ADDRESSES.LIST
    );
    return data.data;
  },

  createAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    const { data } = await apiClient.post<ApiResponse<Address>>(
      API_ENDPOINTS.ADDRESSES.CREATE,
      payload
    );
    return data.data;
  },

  updateAddress: async (
    id: string,
    payload: Partial<CreateAddressPayload>
  ): Promise<Address> => {
    const { data } = await apiClient.patch<ApiResponse<Address>>(
      API_ENDPOINTS.ADDRESSES.UPDATE(id),
      payload
    );
    return data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ADDRESSES.DELETE(id));
  },

  setDefaultAddress: async (id: string): Promise<Address> => {
    const { data } = await apiClient.patch<ApiResponse<Address>>(
      API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id)
    );
    return data.data;
  },
};
