// apps/frontend/src/hooks/auth/useAuthQuery.ts
// React Query hooks برای Auth

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  RequestOtpRequest,
  VerifyOtpRequest,
  CompleteRegistrationRequest,
  LoginRequest,
  DirectRegisterRequest,
} from '@/types/auth.types';

/**
 * درخواست ارسال OTP
 */
export function useRequestOtp() {
  const { setStep } = useAuthStore();

  return useMutation({
    mutationFn: (data: RequestOtpRequest) => authService.requestOtp(data),
    onSuccess: () => {
      setStep('otp');
    },
  });
}

/**
 * تأیید کد OTP
 */
export function useVerifyOtp() {
  const { setStep, setTempToken, setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (response) => {
      if (response.data.needsRegistration) {
        // کاربر جدید → ذخیره tempToken و رفتن به مرحله ثبت‌نام
        setTempToken(response.data.tempToken!);
        setStep('register');
      } else {
        // کاربر موجود → ذخیره توکن‌ها و redirect
        // TODO: دریافت اطلاعات کاربر از /users/me
        setUser({
          id: response.data.userId!,
          phone: '', // باید از API بیاید
          firstName: '',
          lastName: '',
          role: 'customer',
          createdAt: '',
          updatedAt: '',
        });
        router.push('/profile');
      }
    },
  });
}

/**
 * تکمیل ثبت‌نام (بعد از OTP)
 */
export function useCompleteRegistration() {
  const { setUser, setTempToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CompleteRegistrationRequest) =>
      authService.completeRegistration(data),
    onSuccess: (response) => {
      // پاک کردن tempToken
      setTempToken(null);
      
      // TODO: دریافت اطلاعات کاربر از /users/me
      setUser({
        id: response.data.userId,
        phone: '',
        firstName: '',
        lastName: '',
        role: 'customer',
        createdAt: '',
        updatedAt: '',
      });
      
      router.push('/profile');
    },
  });
}

/**
 * ورود با رمز عبور
 */
export function useLogin() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // TODO: دریافت اطلاعات کاربر از /users/me
      setUser({
        id: response.data.userId,
        phone: '',
        firstName: '',
        lastName: '',
        role: 'customer',
        createdAt: '',
        updatedAt: '',
      });
      
      router.push('/profile');
    },
  });
}

/**
 * ثبت‌نام مستقیم (Fallback)
 */
export function useDirectRegister() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: DirectRegisterRequest) =>
      authService.directRegister(data),
    onSuccess: (response) => {
      // TODO: دریافت اطلاعات کاربر از /users/me
      setUser({
        id: response.data.userId,
        phone: '',
        firstName: '',
        lastName: '',
        role: 'customer',
        createdAt: '',
        updatedAt: '',
      });
      
      router.push('/profile');
    },
  });
}

/**
 * خروج از حساب
 */
export function useLogout() {
  const { logout: logoutStore } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logoutStore();
      router.push('/login');
    },
  });
}
