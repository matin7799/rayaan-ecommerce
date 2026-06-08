'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { cartService } from '@/services/cart.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  isCenter?: boolean;
  badge?: number;
  match?: (pathname: string) => boolean;
};

const PRODUCTS_HREF = '/products';
// اگر هنوز مسیر محصولاتت /products است، این را بگذار:
// const PRODUCTS_HREF = '/products';

function formatBadgeCount(count?: number) {
  if (!count || count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const { user, accessToken, sessionChecked } = useAuthStore();

  const isLoggedIn = sessionChecked && Boolean(accessToken) && Boolean(user);

  const { data: cart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => cartService.getCart(),
    enabled: isLoggedIn,
    retry: 1,
    staleTime: 1000 * 60,
  });

  const cartItemCount = cart?.totalItems ?? 0;

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        name: 'محصولات',
        icon: LayoutGrid,
        href: PRODUCTS_HREF,
        match: (path) =>
          path === PRODUCTS_HREF || path.startsWith(`${PRODUCTS_HREF}/`),
      },
      {
        name: 'علاقه‌مندی',
        icon: Heart,
        href: '/wishlist',
        match: (path) => path === '/wishlist' || path.startsWith('/wishlist/'),
      },
      {
        name: 'خانه',
        icon: Home,
        href: '/',
        isCenter: true,
        match: (path) => path === '/',
      },
      {
        name: 'سبد خرید',
        icon: ShoppingCart,
        href: '/cart',
        badge: cartItemCount,
        match: (path) => path === '/cart' || path.startsWith('/cart/'),
      },
      {
        name: 'پروفایل',
        icon: User,
        href: isLoggedIn ? '/dashboard' : '/login',
        match: (path) =>
          path === '/dashboard' ||
          path.startsWith('/dashboard/') ||
          path === '/login',
      },
    ],
    [cartItemCount, isLoggedIn],
  );

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      <div className="absolute inset-0 border-t border-gray-200/70 bg-white/90 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-gray-800/70 dark:bg-gray-950/90" />

      <div className="relative mx-auto flex h-[74px] max-w-md items-end justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match?.(pathname) ?? pathname === item.href;
          const badgeLabel = formatBadgeCount(item.badge);

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                aria-current={isActive ? 'page' : undefined}
                className="group relative z-10 -mt-7 flex w-full flex-col items-center justify-center"
              >
                <span
                  className={cn(
                    'flex size-14 items-center justify-center rounded-full text-white shadow-lg shadow-teal-700/30',
                    'bg-gradient-to-tr from-[#008080] via-[#0b9c9c] to-[#20B2AA]',
                    'transition-all duration-300 ease-out',
                    'group-active:scale-95',
                    isActive && 'scale-105 shadow-teal-700/45',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-6 transition-transform duration-300',
                      isActive ? 'scale-110' : 'group-hover:scale-105',
                    )}
                    strokeWidth={isActive ? 2.6 : 2.2}
                  />
                </span>

                <span
                  className={cn(
                    'mt-1.5 text-[10px] transition-colors duration-300',
                    isActive
                      ? 'font-bold text-[#008080] dark:text-[#20B2AA]'
                      : 'font-medium text-gray-500 dark:text-gray-400',
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex w-full flex-col items-center justify-center gap-1.5 pb-1 pt-3',
                'transition-colors duration-300 ease-out',
                isActive
                  ? 'text-[#008080] dark:text-[#20B2AA]'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
              )}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    'size-6 transition-all duration-300 ease-out',
                    isActive
                      ? 'scale-110 drop-shadow-sm'
                      : 'group-hover:-translate-y-0.5 group-hover:scale-105',
                  )}
                  strokeWidth={isActive ? 2.6 : 2.1}
                />

                {badgeLabel ? (
                  <span
                    className={cn(
                      'absolute -right-2.5 -top-2 flex min-w-4 items-center justify-center rounded-full',
                      'bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white',
                      'border-2 border-white shadow-sm dark:border-gray-950',
                    )}
                  >
                    {badgeLabel}
                  </span>
                ) : null}
              </span>

              <span
                className={cn(
                  'text-[10px] transition-all duration-300',
                  isActive ? 'font-bold' : 'font-medium',
                )}
              >
                {item.name}
              </span>

              {isActive ? (
                <span className="absolute bottom-0 size-1 rounded-full bg-[#008080] dark:bg-[#20B2AA]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
