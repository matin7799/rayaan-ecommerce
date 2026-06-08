'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export interface LoginFormOtpStepProps {
  otpValue: string;
  setOtpValue: (val: string) => void;
  clearError: () => void;
  handleOtpComplete: (value: string) => void;
  loading: boolean;
  error: string;
  timer: number;
  formatTime: (seconds: number) => string;
  handleResendOtp: () => void;
  setStep: (step: 'PHONE' | 'OTP' | 'REGISTER') => void;
}

export function LoginFormOtpStep({
  otpValue,
  setOtpValue,
  clearError,
  handleOtpComplete,
  loading,
  error,
  timer,
  formatTime,
  handleResendOtp,
  setStep,
}: LoginFormOtpStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-4">
        <Label className="block text-center text-sm font-bold text-zinc-700 dark:text-zinc-200">
          کد تایید ۶ رقمی
        </Label>

        <div className="w-full overflow-x-auto" dir="ltr">
          <div className="flex min-w-max justify-center px-1">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => {
                setOtpValue(value);
                clearError();
                if (value.length === 6) handleOtpComplete(value);
              }}
              disabled={loading}
            >
              <InputOTPGroup className="gap-1.5 sm:gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-10 rounded-xl border-zinc-200 bg-zinc-50/80 text-lg font-bold shadow-sm transition-all focus:ring-2 focus:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-950/50 sm:h-14 sm:w-12 sm:rounded-2xl sm:text-xl"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-center text-sm font-medium text-primary">
            در حال بررسی کد...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-950/50 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-center text-zinc-500 dark:text-zinc-400 sm:text-right">
          {timer > 0
            ? `${formatTime(timer)} تا ارسال مجدد`
            : 'زمان به پایان رسید'}
        </span>

        {timer === 0 && (
          <button
            type="button"
            onClick={handleResendOtp}
            className="font-bold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
            disabled={loading}
          >
            ارسال مجدد
          </button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-12 w-full rounded-2xl border-zinc-200 bg-white/70 font-bold dark:border-zinc-800 dark:bg-zinc-900/70 sm:h-13"
        onClick={() => {
          setStep('PHONE');
          setOtpValue('');
          clearError();
        }}
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        بازگشت
      </Button>
    </div>
  );
}
