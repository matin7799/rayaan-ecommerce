'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { Smartphone, Lock, Mail, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { authService, userService } from '@/services';
import { useAuthStore } from '@/lib/store/auth-store';
import { getErrorMessage } from '@/lib/api/error-handler';
import { toast } from 'sonner';

type Step = 'PHONE' | 'OTP' | 'REGISTER' | 'PASSWORD';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setTokens } = useAuthStore();

  const [step, setStep] = useState<Step>('PHONE');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // OTP countdown timer
  useEffect(() => {
    if (step !== 'OTP' || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

  const clearError = () => setError('');

  const validatePhone = () => {
    const parsed = z
      .string()
      .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد')
      .safeParse(phone);

    if (!parsed.success) {
      setError(parsed.error.flatten().formErrors[0]);
      return false;
    }

    return true;
  };

  // ── Step 1: Request OTP ──────────────────────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validatePhone()) return;

    setLoading(true);
    try {
      await authService.requestOtp({ phone });
      toast.success('کد تایید ارسال شد');
      setStep('OTP');
      setTimer(120);
      setOtpValue('');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOtpComplete = async (value: string) => {
    if (value.length !== 6 || loading) return;

    setLoading(true);
    clearError();

    try {
      const response = await authService.verifyOtp({ phone, code: value });

      if (response.data.needsRegistration) {
        // New user → show registration form, DO NOT call getProfile
        setTempToken(response.data.tempToken!);
        setStep('REGISTER');
        toast.info('شماره تایید شد. لطفا اطلاعات خود را تکمیل کنید');
      } else {
        // Existing user → tokens are valid, fetch profile then redirect
        const { accessToken, refreshToken } = response.data;
        setTokens(accessToken!, refreshToken!);

        try {
          const user = await userService.getProfile();
          setAuth(user, accessToken!, refreshToken!);
        } catch {
          // Even if profile fetch fails, tokens are set — user can retry later
        }

        toast.success('ورود موفقیت‌آمیز بود');
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      setOtpValue('');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3a: Password login ──────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validatePhone()) {
      setStep('PHONE');
      return;
    }

    if (!password.trim()) {
      setError('رمز عبور الزامی است');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ phone, password });
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);

      try {
        const user = await userService.getProfile();
        setAuth(user, accessToken, refreshToken);
      } catch {
        // tokens still set, profile can be re-fetched later
      }

      toast.success('ورود موفقیت‌آمیز بود');
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3b: Complete registration ──────────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!firstName.trim() || !lastName.trim()) {
      setError('نام و نام خانوادگی الزامی است');
      return;
    }
    if (regPassword.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.completeRegistration({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: regPassword,
        tempToken,
      });
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);

      try {
        const user = await userService.getProfile();
        setAuth(user, accessToken, refreshToken);
      } catch {
        // tokens still valid
      }

      toast.success('ثبت‌نام با موفقیت انجام شد');
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await authService.requestOtp({ phone });
      setTimer(120);
      setOtpValue('');
      clearError();
      toast.success('کد تایید مجدداً ارسال شد');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 sm:p-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-10 text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
          <Image src="/images/logo-main.svg" alt="لوگو" width={200} height={200} className="drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {step === 'PHONE' && 'خوش آمدید'}
            {step === 'OTP' && 'تایید شماره موبایل'}
            {step === 'PASSWORD' && 'ورود به حساب'}
            {step === 'REGISTER' && 'تکمیل اطلاعات'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {step === 'PHONE'
              ? 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید'
              : `شماره موبایل: ${phone}`}
          </p>
        </div>
      </div>

      {/* ── PHONE step ── */}
      {step === 'PHONE' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-3">
            <Label htmlFor="phone">شماره موبایل</Label>
            <div className="relative group">
              <Smartphone className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError();
                }}
                className={`h-12 pr-12 text-lg tracking-widest rounded-xl ${error ? 'border-red-500' : ''}`}
                placeholder="09123456789"
                dir="ltr"
                maxLength={11}
                autoFocus
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
            {loading ? 'در حال ارسال...' : 'دریافت کد تایید'}
          </Button>

          <div className="text-center text-sm text-zinc-500">
            قبلا ثبت‌نام کرده‌اید؟{' '}
            <button
              type="button"
              onClick={() => {
                clearError();
                if (!validatePhone()) return;
                setStep('PASSWORD');
              }}
              className="text-primary font-medium hover:underline"
            >
              ورود با رمز عبور
            </button>
          </div>
        </form>
      )}

      {/* ── OTP step ── */}
      {step === 'OTP' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-4">
            <Label>کد تایید ۶ رقمی</Label>
            <div className="flex justify-center" dir="ltr">
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
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl rounded-xl" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            {loading && <p className="text-sm text-primary font-medium text-center">در حال بررسی...</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              {timer > 0 ? `${formatTime(timer)} تا ارسال مجدد` : 'زمان به پایان رسید'}
            </span>
            {timer === 0 && (
              <button type="button" onClick={handleResendOtp} className="text-primary font-medium hover:underline" disabled={loading}>
                ارسال مجدد
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-xl"
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
      )}

      {/* ── PASSWORD step ── */}
      {step === 'PASSWORD' && (
        <form onSubmit={handlePasswordLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-3">
            <Label htmlFor="password">رمز عبور</Label>
            <div className="relative group">
              <Lock className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="h-12 pr-12 pl-12 rounded-xl"
                placeholder="رمز عبور خود را وارد کنید"
                dir="ltr"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                className="absolute left-3 top-3.5 text-zinc-400 hover:text-zinc-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <div className="space-y-3">
            <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-medium" disabled={loading}>
              {loading ? 'در حال ورود...' : 'ورود به حساب'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl"
              onClick={() => {
                setStep('PHONE');
                setPassword('');
                clearError();
              }}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              بازگشت
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep('PHONE');
                clearError();
              }}
              className="text-sm text-primary font-medium hover:underline"
            >
              ورود با کد تایید
            </button>
          </div>
        </form>
      )}

      {/* ── REGISTER step ── */}
      {step === 'REGISTER' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
            <span>✓</span>
            <span>شماره تایید شد. اطلاعات خود را تکمیل کنید.</span>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                className="h-12 pr-12 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50"
                placeholder="نام"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="relative group">
              <User className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                className="h-12 pr-12 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50"
                placeholder="نام خانوادگی"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="relative group">
              <Mail className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                className="h-12 pr-12 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50"
                placeholder="ایمیل (اختیاری)"
                type="email"
                dir="ltr"
                disabled={loading}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute right-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                className="h-12 pr-12 pl-12 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50"
                placeholder="تعیین رمز عبور (حداقل ۸ کاراکتر)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                dir="ltr"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute left-3 top-3.5 text-zinc-400 hover:text-zinc-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-medium shadow-lg shadow-primary/25" disabled={loading}>
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام نهایی'}
          </Button>
        </form>
      )}
    </div>
  );
}
