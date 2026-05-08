'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MegaMenu } from './MegaMenu';
import { AdvancedSearch } from './AdvancedSearch';
import { CartDropdown } from '@/components/cart/cart-dropdown';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  showHero?: boolean;
}

export function Header({ showHero = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, accessToken, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/40 dark:bg-gray-950/40 backdrop-blur-xl saturate-150 border-b border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-1'
            : 'bg-transparent pt-4'
        }`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">

          {/* Right: Logo + nav links */}
          <div className="flex items-center gap-6 xl:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 ml-2 drop-shadow-sm transition-transform hover:scale-105"
              title="رایان تِک"
            >
              <Image
                src="/images/logo-dark.svg"
                alt="رایان تِک"
                width={110}
                height={36}
                className="dark:hidden object-contain h-8 w-auto md:h-10"
                priority
              />
              <Image
                src="/images/logo-light.svg"
                alt="رایان تِک"
                width={110}
                height={36}
                className="hidden dark:block object-contain h-8 w-auto md:h-10"
                priority
              />
            </Link>

            <div className="hidden lg:flex items-center gap-1 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-2xl px-2 py-1.5 border border-white/50 dark:border-gray-700/50 shadow-sm">
              <MegaMenu />
              <div className="h-5 w-px bg-gray-300/60 dark:bg-gray-700/60 mx-2" />
              {['مجله', 'درباره ما', 'ارتباط با ما'].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/${item === 'مجله' ? 'blog' : item === 'درباره ما' ? 'about' : 'contact'}`}
                  className="text-sm font-medium px-4 py-2 text-gray-700 hover:text-[#008080] dark:text-gray-200 dark:hover:text-[#20B2AA] transition-all rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Search */}
          <AdvancedSearch />

          {/* Left: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full h-11 w-11 text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-md border border-white/40 dark:border-gray-700/50 shadow-sm transition-all focus-visible:ring-0 focus-visible:ring-offset-0 outline-none hover:rotate-12"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            )}

            <CartDropdown />

            {accessToken && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-2xl bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 h-11 px-4 shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-800 dark:text-gray-100"
                >
                  <User className="w-4 h-4 text-[#008080]" />
                  <span className="max-w-[100px] truncate">
                    {user.firstName || user.phone}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-11 w-11 rounded-full text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border border-white/40 dark:border-gray-700/50"
                  title="خروج"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden align-middle sm:flex rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 hover:from-[#008080] hover:to-[#006666] dark:hover:from-[#008080] dark:hover:to-[#006666] dark:hover:text-white transition-all h-11 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium border border-transparent dark:border-white/10"
              >
                <User className="w-4 h-4 ml-2 my-auto" />
                <p className="my-auto">ورود | ثبت نام</p>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - فقط زمانی که showHero=true */}
      {showHero && (
        <section className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-[#008080] via-[#20B2AA] to-[#48D1CC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-center text-white space-y-6 z-10">
              <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
                به رایان تِک خوش آمدید
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                بهترین محصولات تکنولوژی را با ما تجربه کنید
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
