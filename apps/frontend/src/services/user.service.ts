import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AuthUser } from '@/lib/store/auth-store';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  role: 'customer' | 'admin' | 'super_admin' | 'partner' | 'guest';
  status: 'active' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>(
      API_ENDPOINTS.USERS.ME,
    );
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<AuthUser> => {
    const { data } = await apiClient.patch<ApiResponse<AuthUser>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      payload,
    );
    return data.data;
  },

  getAdminUsers: async (limit = 100): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<ApiResponse<AdminUser[]>>(
      `${API_ENDPOINTS.USERS.ADMIN_ALL}?limit=${limit}`,
    );
    return data.data;
  },

  updateThemePartner: async (userId: string, isPartner: boolean): Promise<AdminUser> => {
    const { data } = await apiClient.patch<ApiResponse<AdminUser>>(
      API_ENDPOINTS.USERS.ADMIN_THEME_PARTNER(userId),
      { isPartner },
    );
    return data.data;
  },
};
