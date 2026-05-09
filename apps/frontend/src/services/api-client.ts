import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1');
const TOROB_ATTR_KEY = 'torob_attribution_until';
const TOROB_ATTR_TTL_MS = 20 * 60 * 1000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshTorobAttribution = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const now = Date.now();
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source')?.toLowerCase();
  const hasTorobSignal = source === 'torob';

  if (hasTorobSignal) {
    const expiresAt = now + TOROB_ATTR_TTL_MS;
    window.localStorage.setItem(TOROB_ATTR_KEY, String(expiresAt));
    document.cookie = `${TOROB_ATTR_KEY}=${expiresAt}; Max-Age=1200; Path=/; SameSite=Lax`;
    return true;
  }

  const until = Number.parseInt(
    window.localStorage.getItem(TOROB_ATTR_KEY) ?? '0',
    10,
  );
  if (Number.isFinite(until) && until > now) {
    return true;
  }

  // Ensure attribution is fully cleared after expiry.
  window.localStorage.removeItem(TOROB_ATTR_KEY);
  document.cookie = `${TOROB_ATTR_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
  return false;
};

// Request Interceptor: read token directly from Zustand store (always in-memory, never stale)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      if (refreshTorobAttribution() && config.headers) {
        config.headers['X-Attribution-Source'] = 'torob';
      }

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
