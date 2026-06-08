// apps/frontend/src/services/auth.service.ts
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  LoginRequest,
  LoginResponse,
  DirectRegisterRequest,
  DirectRegisterResponse,
} from '@/types/auth.types';

// ========== Auth Service ==========
export const authService = {
  /**
   * درخواست ارسال OTP
   */
  requestOtp: async (payload: RequestOtpRequest): Promise<RequestOtpResponse> => {
    const { data } = await apiClient.post<RequestOtpResponse>(
      API_ENDPOINTS.AUTH.REQUEST_OTP,
      payload
    );
    return data;
  },

  /**
   * تأیید کد OTP
   */
  verifyOtp: async (payload: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      payload
    );
    return data;
  },

  /**
   * تکمیل ثبت‌نام (بعد از تأیید OTP)
   * نیاز به tempToken در هدر Authorization
   */
  completeRegistration: async (
    payload: CompleteRegistrationRequest
  ): Promise<CompleteRegistrationResponse> => {
    const { tempToken, ...registerData } = payload;
    
    const { data } = await apiClient.post<CompleteRegistrationResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerData,
      {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }
    );
    return data;
  },

  /**
   * ورود با شماره تلفن و رمز عبور
   */
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    return data;
  },

  /**
   * ثبت‌نام مستقیم (Fallback - بدون OTP)
   */
  directRegister: async (payload: DirectRegisterRequest): Promise<DirectRegisterResponse> => {
    const { data } = await apiClient.post<DirectRegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload
    );
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      const { useAuthStore } = await import('@/lib/store/auth-store');
      const refreshToken = useAuthStore.getState().refreshToken || '';
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch (error) {
      console.error('Failed to log out from backend:', error);
    }
  },

  refreshSession: async (): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      {}
    );
    return data;
  },
};
