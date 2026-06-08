'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { authService, userService } from '@/services';
import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api/error-handler';
import { toast } from 'sonner';
import { LoginFormPhoneStep } from './LoginFormPhoneStep';
import { LoginFormOtpStep } from './LoginFormOtpStep';
import { LoginFormRegisterStep } from './LoginFormRegisterStep';

type Step = 'PHONE' | 'OTP' | 'REGISTER';
type AuthMode = 'OTP' | 'PASSWORD';

const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و 11 رقم باشد');

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'نام الزامی است'),
  lastName: z.string().trim().min(1, 'نام خانوادگی الزامی است'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectTo = useMemo(
    () => searchParams.get('redirect') || '/',
    [searchParams]
  );
  const { user, accessToken, setAuth, setTokens } = useAuthStore();

  const [step, setStep] = useState<Step>('PHONE');
  const [authMode, setAuthMode] = useState<AuthMode>('OTP');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [tempToken, setTempToken] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (step !== 'OTP' || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (accessToken && user) {
      router.replace(redirectTo === '/' ? '/dashboard' : redirectTo);
    }
  }, [accessToken, user, router, redirectTo]);

  const clearError = () => setError('');

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const validatePhone = () => {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.flatten().formErrors[0]);
      return false;
    }
    return true;
  };

  const completeAuth = async (
    accessToken: string,
    refreshToken: string,
    successMessage: string
  ) => {
    setTokens(accessToken, refreshToken);

    try {
      const user = await userService.getProfile();
      setAuth(user, accessToken, refreshToken);

      // Merge guest cart items on login
      const guestCart = cartService.getStoredCart();
      if (guestCart && guestCart.items.length > 0) {
        await cartService.mergeCart(
          guestCart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        );
        cartService.clearStoredCart();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    } catch (err) {
      console.error('Failed to merge cart during auth completion:', err);
    }

    toast.success(successMessage);
    router.push(redirectTo);
  };

  const goToPhoneStep = () => {
    setStep('PHONE');
    setPassword('');
    setOtpValue('');
    clearError();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validatePhone()) return;

    setLoading(true);
    try {
      await authService.requestOtp({ phone });
      setStep('OTP');
      setTimer(120);
      setOtpValue('');
      toast.success('کد تایید ارسال شد');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (value: string) => {
    if (value.length !== 6 || loading) return;

    clearError();
    setLoading(true);

    try {
      const response = await authService.verifyOtp({ phone, code: value });

      if (response.data.needsRegistration) {
        setTempToken(response.data.tempToken ?? '');
        setStep('REGISTER');
        toast.info('شماره تایید شد. لطفا اطلاعات خود را تکمیل کنید');
        return;
      }

      const { accessToken, refreshToken } = response.data;
      await completeAuth(accessToken!, refreshToken!, 'ورود موفقیت‌آمیز بود');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setOtpValue('');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validatePhone()) return;

    if (!password.trim()) {
      setError('رمز عبور الزامی است');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ phone, password });
      const { accessToken, refreshToken } = response.data;
      await completeAuth(accessToken, refreshToken, 'ورود موفقیت‌آمیز بود');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = registerSchema.safeParse({
      firstName,
      lastName,
      password: regPassword,
      email,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'اطلاعات وارد شده نامعتبر است');
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
      await completeAuth(accessToken, refreshToken, 'ثبت‌نام با موفقیت انجام شد');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-zinc-50 via-white to-primary/5 px-4 py-6 dark:from-zinc-950 dark:via-zinc-950 dark:to-primary/10 sm:py-10">
      <div className="relative w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <div className="rounded-full border border-zinc-200/70 bg-white/70 px-4 py-2 text-xs font-medium text-zinc-500 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
            ورود امن به حساب کاربری
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl shadow-zinc-200/70 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/85 dark:shadow-black/40 sm:rounded-4xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent dark:via-zinc-600" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-inner ring-1 ring-primary/10 sm:h-20 sm:w-20 sm:rounded-3xl">
              <Image
                src="/images/logo-main.svg"
                alt="لوگو"
                width={170}
                height={170}
                className="drop-shadow-sm"
                priority
              />
            </div>

            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {step === 'PHONE' &&
                (authMode === 'PASSWORD' ? 'ورود به حساب' : 'خوش آمدید')}
              {step === 'OTP' && 'تایید شماره موبایل'}
              {step === 'REGISTER' && 'تکمیل اطلاعات'}
            </h2>

            <p className="mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400 sm:text-sm">
              {step === 'PHONE'
                ? authMode === 'PASSWORD'
                  ? 'برای ورود، شماره موبایل و رمز عبور خود را وارد کنید'
                  : 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید'
                : `شماره موبایل ${phone}`}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2">
            <div className="h-1.5 rounded-full bg-primary" />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'OTP' || step === 'REGISTER'
                  ? 'bg-primary'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 'REGISTER'
                  ? 'bg-primary'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          </div>

          {step === 'PHONE' && (
            <LoginFormPhoneStep
              authMode={authMode}
              setAuthMode={setAuthMode}
              phone={phone}
              setPhone={setPhone}
              password={password}
              setPassword={setPassword}
              showLoginPassword={showLoginPassword}
              setShowLoginPassword={setShowLoginPassword}
              error={error}
              clearError={clearError}
              loading={loading}
              handlePasswordLogin={handlePasswordLogin}
              handlePhoneSubmit={handlePhoneSubmit}
            />
          )}

          {step === 'OTP' && (
            <LoginFormOtpStep
              otpValue={otpValue}
              setOtpValue={setOtpValue}
              clearError={clearError}
              handleOtpComplete={handleOtpComplete}
              loading={loading}
              error={error}
              timer={timer}
              formatTime={formatTime}
              handleResendOtp={handleResendOtp}
              setStep={setStep}
            />
          )}

          {step === 'REGISTER' && (
            <LoginFormRegisterStep
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              regPassword={regPassword}
              setRegPassword={setRegPassword}
              showRegisterPassword={showRegisterPassword}
              setShowRegisterPassword={setShowRegisterPassword}
              loading={loading}
              error={error}
              handleRegisterSubmit={handleRegisterSubmit}
              goToPhoneStep={goToPhoneStep}
            />
          )}
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-zinc-400">
          با ورود یا ثبت‌نام، قوانین و شرایط استفاده را می‌پذیرید.
        </p>
      </div>
    </div>
  );
}
