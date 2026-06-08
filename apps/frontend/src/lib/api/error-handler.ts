import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiError {
  code: string;
  message: string;
    details?: Array<{
    field?: string;
    message: string;
    [key: string]: unknown;
  }>;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiError;
  meta: {
    requestId?: string;
  };
}

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  UNAUTHORIZED: 'لطفا وارد حساب کاربری خود شوید',
  INVALID_CREDENTIALS: 'شماره موبایل یا رمز عبور اشتباه است',
  TEMP_TOKEN_INVALID: 'لینک ثبت‌نام منقضی شده. لطفا دوباره OTP دریافت کنید',
  PHONE_ALREADY_EXISTS: 'این شماره موبایل قبلاً ثبت شده است',
  OTP_INVALID: 'کد تایید نامعتبر یا منقضی شده است',
  OTP_NOT_FOUND: 'کد تایید یافت نشد. لطفا مجددا درخواست دهید',
  OTP_MAX_ATTEMPTS: 'تعداد تلاش‌های شما به حد مجاز رسیده است',
  RATE_LIMIT_EXCEEDED: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفا کمی صبر کنید',
  OTP_RATE_LIMITED: 'تعداد درخواست‌های OTP بیش از حد مجاز است. لطفا چند دقیقه صبر کنید',
  USER_NOT_FOUND: 'کاربر یافت نشد',
  
  // Validation errors
  VALIDATION_ERROR: 'اطلاعات وارد شده نامعتبر است',
  
  // Resource errors
  NOT_FOUND: 'موردی یافت نشد',
  ALREADY_EXISTS: 'این مورد قبلا ثبت شده است',
  
  // Cart errors
  INSUFFICIENT_STOCK: 'موجودی کافی نیست',
  CART_EMPTY: 'سبد خرید شما خالی است',
  
  // Order errors
  ORDER_NOT_FOUND: 'سفارش یافت نشد',
  
  // Payment errors
  PAYMENT_FAILED: 'پرداخت ناموفق بود',
  PAYMENT_CANCELLED: 'پرداخت لغو شد',
  
  // Server errors
  INTERNAL_ERROR: 'خطای سرور. لطفا بعدا تلاش کنید',
  SERVICE_UNAVAILABLE: 'سرویس در دسترس نیست',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;
    const nestError = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;
    
    if (apiError?.error?.code) {
      return ERROR_MESSAGES[apiError.error.code] || apiError.error.message || 'خطای نامشخص';
    }
    
    // HTTP status based messages
    if (error.response?.status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.response?.status === 404) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (error.response?.status === 429) {
      return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    }
    if (error.response?.status === 500) {
      return ERROR_MESSAGES.INTERNAL_ERROR;
    }
    if (error.response?.status === 503) {
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    }

    if (Array.isArray(nestError?.message) && nestError.message.length > 0) {
      return String(nestError.message[0]);
    }
    if (typeof nestError?.message === 'string' && nestError.message.trim().length > 0) {
      return nestError.message;
    }
    
    return error.message || 'خطای نامشخص';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'خطای نامشخص';
}

export function handleApiError(error: unknown, customMessage?: string) {
  const message = customMessage || getErrorMessage(error);
  
  // Show toast notification
  toast.error(message);
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
    
    if (error instanceof AxiosError) {
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
    }
  }
  
  return message;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;
    return apiError?.error?.code === 'VALIDATION_ERROR';
  }
  return false;
}

export function getValidationErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse;
    if (apiError?.error?.details && Array.isArray(apiError.error.details)) {
      return apiError.error.details.reduce((acc, detail) => {
        if (detail.field && detail.message) {
          acc[detail.field] = detail.message;
        }
        return acc;
      }, {} as Record<string, string>);
    }
  }
  return {};
}
