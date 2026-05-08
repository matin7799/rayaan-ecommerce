// apps/frontend/src/types/auth.types.ts
// تایپ‌های احراز هویت

// ========== Request OTP ==========
export interface RequestOtpRequest {
  phone: string;
}

export interface RequestOtpResponse {
  success: boolean;
  data: {
    expiresAt: string; // ISO timestamp
  };
  error: null;
  meta: Record<string, unknown>;
}

// ========== Verify OTP ==========
export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  data: {
    userId: string; // همیشه موجود است
    needsRegistration: boolean;
    tempToken?: string; // فقط برای کاربران جدید
    accessToken?: string; // فقط برای کاربران موجود
    refreshToken?: string; // فقط برای کاربران موجود
  };
  error: null;
  meta: Record<string, unknown>;
}

// ========== Complete Registration (بعد از OTP) ==========
export interface CompleteRegistrationRequest {
  tempToken: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CompleteRegistrationResponse {
  success: boolean;
  data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
  };
  error: null;
  meta: Record<string, unknown>;
}

// ========== Login با Password ==========
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
  };
  error: null;
  meta: Record<string, unknown>;
}

// ========== Direct Register (Fallback - بدون OTP) ==========
export interface DirectRegisterRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface DirectRegisterResponse {
  success: boolean;
  data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
  };
  error: null;
  meta: Record<string, unknown>;
}

// ========== User Info ==========
export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// ========== Auth Store State ==========
export type AuthStep = 'phone' | 'otp' | 'register' | 'password';

export interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Flow state
  currentStep: AuthStep;
  phone: string;
  tempToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setStep: (step: AuthStep) => void;
  setPhone: (phone: string) => void;
  setTempToken: (token: string | null) => void;
  logout: () => void;
}

// ========== API Error ==========
export interface ApiError {
  code: string;
  message: string;
}
