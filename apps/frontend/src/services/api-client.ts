import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';

const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1');

// Simple in-memory response cache for GET requests (client-side only)
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds
const CACHE_MAX_SIZE = 50; // Max cached entries

export const clearResponseCache = () => {
  responseCache.clear();
};


const TOROB_ATTR_KEY = 'torob_attribution_until';
const TOROB_ATTR_TTL_MS = 20 * 60 * 1000;

// Only use cache on client-side, not during SSR
const getCacheKey = (config: { method?: string; url?: string; params?: unknown }): string | null => {
  if (typeof window === 'undefined') return null;
  if (config.method !== 'get' && config.method !== 'GET') return null;
  
  // Exclude highly dynamic cart and checkout endpoints from client cache to ensure real-time UI updates
  if (config.url?.includes('/cart') || config.url?.includes('cart') || config.url?.includes('/checkout') || config.url?.includes('checkout')) {
    return null;
  }
  
  return `${config.url}|${JSON.stringify(config.params ?? {})}`;
};

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

// Request Interceptor: read token directly from Zustand store + in-memory cache check
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

      // Return cached response for GET requests
      const cacheKey = getCacheKey(config);
      if (cacheKey && !config.headers?.['X-Bypass-Cache']) {
        const cached = responseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          // Return cached response by rejecting with special flag
          return Promise.reject({
            __fromCache: true,
            data: cached.data,
            config,
          } as any);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: cache successful GETs + auto-logout on 401
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    const cacheKey = getCacheKey(response.config);
    if (cacheKey) {
      if (responseCache.size >= CACHE_MAX_SIZE) {
        // Evict oldest entry
        const oldestKey = responseCache.keys().next().value;
        if (oldestKey) responseCache.delete(oldestKey);
      }
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error: AxiosError | any) => {
    // Handle cache hits (they come through as rejected for bypassing request interceptor)
    if (error?.__fromCache) {
      return Promise.resolve({ data: error.data, config: error.config, status: 200, statusText: 'OK', headers: {}, request: {} });
    }

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
