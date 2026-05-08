import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: read token directly from Zustand store (always in-memory, never stale)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: only auto-logout on 401 for authenticated routes
// DO NOT redirect or toast here — let individual call sites handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const isOnLoginPage =
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/login');

    // Only force logout+redirect if we have a 401 AND the user was authenticated AND we're not on the login page
    if (status === 401 && !isOnLoginPage) {
      const hasToken = !!useAuthStore.getState().accessToken;
      if (hasToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Just reject — let each call site handle errors and toasts
    return Promise.reject(error);
  },
);
