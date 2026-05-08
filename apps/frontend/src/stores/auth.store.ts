// apps/frontend/src/stores/auth.store.ts
// Zustand Store برای مدیریت وضعیت احراز هویت

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthStep } from '@/types/auth.types';

interface AuthState {
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
  reset: () => void;
  logout: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  currentStep: 'phone' as AuthStep,
  phone: '',
  tempToken: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setStep: (step) =>
        set({
          currentStep: step,
        }),

      setPhone: (phone) =>
        set({
          phone,
        }),

      setTempToken: (token) =>
        set({
          tempToken: token,
        }),

      reset: () =>
        set({
          currentStep: 'phone',
          phone: '',
          tempToken: null,
        }),

      logout: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: 'auth-storage',
      // فقط user و isAuthenticated را persist می‌کنیم
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
