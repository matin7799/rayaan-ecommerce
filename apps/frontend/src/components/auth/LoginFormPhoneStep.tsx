'use client';

import type { FormEvent } from 'react';
import { Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface LoginFormPhoneStepProps {
  authMode: 'OTP' | 'PASSWORD';
  setAuthMode: (mode: 'OTP' | 'PASSWORD') => void;
  phone: string;
  setPhone: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
  error: string;
  clearError: () => void;
  loading: boolean;
  handlePasswordLogin: (e: FormEvent) => void;
  handlePhoneSubmit: (e: FormEvent) => void;
}

export function LoginFormPhoneStep({
  authMode,
  setAuthMode,
  phone,
  setPhone,
  password,
  setPassword,
  showLoginPassword,
  setShowLoginPassword,
  error,
  clearError,
  loading,
  handlePasswordLogin,
  handlePhoneSubmit,
}: LoginFormPhoneStepProps) {
  return (
    <form
      onSubmit={authMode === 'PASSWORD' ? handlePasswordLogin : handlePhoneSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="space-y-3">
        <Label
          htmlFor="phone"
          className="text-sm font-bold text-zinc-700 dark:text-zinc-200"
        >
          شماره موبایل
        </Label>

        <div className="group relative">
          <Smartphone className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
          <Input
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError();
            }}
            className={`h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pr-12 text-base shadow-sm transition-all placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13 sm:text-lg sm:tracking-widest ${
              error ? 'border-red-400 focus-visible:ring-red-200' : ''
            }`}
            placeholder="09123456789"
            dir="ltr"
            maxLength={11}
            autoFocus
            disabled={loading}
          />
        </div>
      </div>

      {authMode === 'PASSWORD' && (
        <div className="space-y-3">
          <Label
            htmlFor="password"
            className="text-sm font-bold text-zinc-700 dark:text-zinc-200"
          >
            رمز عبور
          </Label>

          <div className="group relative">
            <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              type={showLoginPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pl-12 pr-12 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13"
              placeholder="رمز عبور خود را وارد کنید"
              dir="ltr"
              disabled={loading}
            />

            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
              onClick={() => setShowLoginPassword((prev) => !prev)}
            >
              {showLoginPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-2xl bg-primary font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 sm:h-13"
        disabled={loading}
      >
        {loading
          ? authMode === 'PASSWORD'
            ? 'در حال ورود...'
            : 'در حال ارسال...'
          : authMode === 'PASSWORD'
          ? 'ورود به حساب'
          : 'دریافت کد تایید'}
      </Button>

      <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-center text-sm text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
        {authMode === 'OTP' ? (
          <>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <button
              type="button"
              onClick={() => {
                clearError();
                setAuthMode('PASSWORD');
              }}
              className="font-bold text-primary transition-colors hover:text-primary/80"
            >
              ورود با رمز عبور
            </button>
          </>
        ) : (
          <>
            ترجیح می‌دهید با کد تایید وارد شوید؟{' '}
            <button
              type="button"
              onClick={() => {
                clearError();
                setAuthMode('OTP');
                setPassword('');
              }}
              className="font-bold text-primary transition-colors hover:text-primary/80"
            >
              ورود با کد تایید
            </button>
          </>
        )}
      </div>
    </form>
  );
}
