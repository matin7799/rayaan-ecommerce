import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// آدرس پایه API از متغیرهای محیطی خوانده می‌شود
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: برای تزریق Token به هدر درخواست‌ها
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: خواندن توکن از Zustand Store یا کوکی (بستگی به پیاده‌سازی Auth شما دارد)
    // const token = useAuthStore.getState().accessToken;
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: برای مدیریت خطاها و Refresh Token
apiClient.interceptors.response.use(
  (response) => {
    // در صورت موفقیت‌آمیز بودن، مستقیماً داده‌ها را برمی‌گرداند
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // اگر خطای 401 (Unauthorized) گرفتیم و قبلاً تلاش مجدد نکرده‌ایم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // TODO: پیاده‌سازی منطق Refresh Token
        // const refreshToken = useAuthStore.getState().refreshToken;
        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        // const { accessToken } = response.data;
        
        // به‌روزرسانی توکن در استور
        // useAuthStore.getState().setTokens(accessToken, refreshToken);
        
        // تنظیم مجدد هدر و ارسال دوباره درخواست اصلی
        // if (originalRequest.headers) {
        //   originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        // }
        // return apiClient(originalRequest);
        
      } catch (refreshError) {
        // اگر Refresh Token هم منقضی شده بود، کاربر باید لاگ‌اوت شود
        // useAuthStore.getState().logout();
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // برای سایر خطاها (مثل 400, 404, 500) ساختار خطای تمیزتری برمی‌گردانیم
    return Promise.reject(error.response?.data || error.message);
  }
);
