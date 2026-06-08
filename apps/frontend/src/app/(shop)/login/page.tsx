import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'ورود / ثبت‌نام | فروشگاه',
  description: 'به حساب کاربری خود وارد شوید یا ثبت‌نام کنید.',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 overflow-hidden">

      {/* Form Wrapper */}
      <div className="relative z-10 w-full max-w-110">
        <Suspense fallback={<div>در حال بارگذاری...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
