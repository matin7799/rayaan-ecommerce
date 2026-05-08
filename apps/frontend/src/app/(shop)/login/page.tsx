import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'ورود / ثبت‌نام | فروشگاه',
  description: 'به حساب کاربری خود وارد شوید یا ثبت‌نام کنید.',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 overflow-hidden">
      {/* Modern Ambient Mesh Gradient Background */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-zinc-50 to-zinc-50 dark:from-primary/10 dark:via-zinc-950 dark:to-zinc-950" />

      {/* Animated Light Orbs */}
      <div className="absolute top-0 right-0 w-160 h-160 bg-primary/5 rounded-full blur-[100px] animate-pulse duration-10000" />
      <div className="absolute bottom-0 left-0 w-120 h-120 bg-blue-500/5 rounded-full blur-[100px] animate-pulse duration-7000" />

      {/* Form Wrapper */}
      <div className="relative z-10 w-full max-w-105">
        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
