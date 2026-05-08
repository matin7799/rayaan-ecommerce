import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AuthUser } from '@/lib/store/auth-store';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
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
};
