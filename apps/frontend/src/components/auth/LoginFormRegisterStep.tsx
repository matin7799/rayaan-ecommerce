'use client';

import type { FormEvent } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface LoginFormRegisterStepProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  showRegisterPassword: boolean;
  setShowRegisterPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  error: string;
  handleRegisterSubmit: (e: FormEvent) => void;
  goToPhoneStep: () => void;
}

export function LoginFormRegisterStep({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  regPassword,
  setRegPassword,
  showRegisterPassword,
  setShowRegisterPassword,
  loading,
  error,
  handleRegisterSubmit,
  goToPhoneStep,
}: LoginFormRegisterStepProps) {
  return (
    <form
      onSubmit={handleRegisterSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
        شماره تایید شد. اطلاعات خود را تکمیل کنید.
      </div>

      <div className="space-y-4">
        <div className="group relative">
          <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
          <Input
            className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pr-12 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13"
            placeholder="نام"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="group relative">
          <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
          <Input
            className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pr-12 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13"
            placeholder="نام خانوادگی"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="group relative">
          <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
          <Input
            className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pr-12 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13"
            placeholder="ایمیل (اختیاری)"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="group relative">
          <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
          <Input
            type={showRegisterPassword ? 'text' : 'password'}
            className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 pl-12 pr-12 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-13"
            placeholder="تعیین رمز عبور"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            dir="ltr"
            disabled={loading}
          />

          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
            onClick={() => setShowRegisterPassword((prev) => !prev)}
          >
            {showRegisterPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 sm:h-13"
        disabled={loading}
      >
        {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام نهایی'}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-12 w-full rounded-2xl border-zinc-200 bg-white/70 font-bold dark:border-zinc-800 dark:bg-zinc-900/70 sm:h-13"
        onClick={goToPhoneStep}
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        بازگشت
      </Button>
    </form>
  );
}
