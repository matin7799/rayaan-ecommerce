// apps/frontend/src/providers/auth-provider.tsx
// Auth Provider - مدیریت وضعیت احراز هویت در سطح اپلیکیشن

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: React.ReactNode;
}

// مسیرهای عمومی که نیاز به احراز هویت ندارند
const PUBLIC_ROUTES = ['/login', '/register'];

// مسیرهای Auth که کاربر لاگین شده نباید به آن‌ها دسترسی داشته باشد
const AUTH_ROUTES = ['/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // اگر کاربر لاگین است و در صفحه Auth است، به پروفایل هدایت شود
    if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
      router.replace('/profile');
      return;
    }

    // اگر کاربر لاگین نیست و در مسیر خصوصی است، به لاگین هدایت شود
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      // فقط برای مسیرهای خصوصی
      if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, pathname, router]);

  // TODO: در Phase بعدی، اینجا می‌توانیم user را از /users/me بگیریم
  // useEffect(() => {
  //   if (isAuthenticated && !user) {
  //     // Fetch user data
  //   }
  // }, [isAuthenticated]);

  return <>{children}</>;
}
