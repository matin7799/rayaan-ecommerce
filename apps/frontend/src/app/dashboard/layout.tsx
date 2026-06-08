'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, ShoppingBag, MapPin, LogOut, ChevronLeft, ShieldCheck, Package, CreditCard, Users, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

import { performBulletproofLogout } from '@/utils/logout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdmin = ['admin', 'super_admin'].includes(String(user?.role ?? '').toLowerCase());
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  useEffect(() => {
    if (isAdminRoute && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isAdminRoute, router]);

  if (isAdminRoute && !isAdmin) {
    return null;
  }

  const menuItems = [
    { title: 'اطلاعات حساب', href: '/dashboard', icon: User },
    { title: 'سفارش‌های من', href: '/dashboard/orders', icon: ShoppingBag },
    { title: 'آدرس‌ها', href: '/dashboard/addresses', icon: MapPin },
    ...(isAdmin
      ? [
          { title: 'ادمین سفارش‌ها', href: '/dashboard/admin/orders', icon: ShieldCheck },
          { title: 'ادمین کاربران', href: '/dashboard/admin/users', icon: Users },
          { title: 'ادمین محصولات', href: '/dashboard/admin/products', icon: Package },
          { title: 'ادمین پرداخت‌ها', href: '/dashboard/admin/payments', icon: CreditCard },
          { title: 'ادمین بنرها', href: '/dashboard/admin/banners', icon: ImageIcon },
          { title: 'ادمین استوری‌ها', href: '/dashboard/admin/stories', icon: Sparkles },
        ]
      : []),
  ];


  const handleLogout = () => {
    performBulletproofLogout();
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">کاربر عزیز</p>
                  <h2 className="font-bold text-lg">
                    {user ? `${user.firstName} ${user.lastName}`.trim() || user.phone : 'خوش آمدید'}
                  </h2>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-2xl transition-colors group',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    )}
                  >
                    <div className="flex items-center gap-3 group-hover:text-black dark:group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-3 rounded-2xl transition-colors w-full mt-6 text-right"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">خروج از حساب</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full md:w-3/4">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 min-h-[500px] shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
