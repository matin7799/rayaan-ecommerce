'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services';
import { orderService } from '@/services/order.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';
import {
  Loader2,
  ShieldCheck,
  Users,
  Package,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Award,
  Sparkles,
  ChevronLeft,
  Coins,
  ArrowUpLeft,
  Image as ImageIcon,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, setUser, sessionChecked } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (sessionChecked && !accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router, sessionChecked]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!accessToken,
  });

  const isAdmin = ['admin', 'super_admin'].includes(String(profile?.role ?? '').toLowerCase());
  const isPartner = String(profile?.role ?? '').toLowerCase() === 'partner';

  // Live Admin Stats
  const { data: adminOrders } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: () => orderService.getAdminOrders({ limit: 1 }),
    enabled: !!accessToken && isAdmin,
  });
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => userService.getAdminUsers(1000),
    enabled: !!accessToken && isAdmin,
  });

  // Live Partner/Customer orders
  const { data: myOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
    enabled: !!accessToken,
  });

  const partnerStats = useMemo(() => {
    if (!myOrders) return { totalAmount: 0, itemsCount: 0, ordersCount: 0 };
    const totalAmount = myOrders.reduce((acc, order) => acc + Number(order.total_price || 0), 0);
    const itemsCount = myOrders.reduce((acc, order) => {
      return acc + (order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0);
    }, 0);
    return { totalAmount, itemsCount, ordersCount: myOrders.length };
  }, [myOrders]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('اطلاعات با موفقیت ذخیره شد');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (!sessionChecked || isProfileLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Banner Card */}
      <div className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-8 text-white shadow-xl ${
        isAdmin 
          ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600' 
          : isPartner 
            ? 'bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-600' 
            : 'bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600'
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              {isAdmin ? 'مدیریت کل سیستم' : isPartner ? 'همکار تجاری ویژه' : 'حساب کاربری استاندارد'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              سلام، {profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'کاربر گرامی'}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">خوش آمدید! در پیشخوان کاربری خود می‌توانید فعالیت‌هایتان را مدیریت کنید.</p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            {isAdmin ? <ShieldCheck className="w-8 h-8" /> : isPartner ? <Award className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* 2. Left side: Personal Info edit form */}
        <div className="lg:col-span-1 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/55 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
            <h3 className="font-bold text-base flex items-center gap-2">اطلاعات شخصی</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs text-zinc-500">نام</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-zinc-950" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs text-zinc-500">نام خانوادگی</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-zinc-950" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-zinc-500">شماره موبایل (ثابت)</Label>
              <Input id="phone" value={profile.phone} disabled className="h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-left font-mono" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-500">ایمیل</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-zinc-950 text-left font-mono" dir="ltr" />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ثبت تغییرات'}
            </Button>
          </form>
        </div>

        {/* 3. Right side: Role specific Panels */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {isAdmin && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">کل سفارش‌ها</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{adminOrders?.total ?? '...'}</span>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/40 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">کاربران فعال</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{adminUsers?.length ?? '...'}</span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/40 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">وضعیت سیستم</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1"><TrendingUp className="w-3.5 h-3.5" /> برخط (عالی)</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-base">پیشخوان مدیریت کل</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'ادمین سفارش‌ها', href: '/dashboard/admin/orders', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-500/10' },
                    { label: 'ادمین کاربران', href: '/dashboard/admin/users', icon: Users, color: 'text-purple-600 bg-purple-500/10' },
                    { label: 'ادمین محصولات', href: '/dashboard/admin/products', icon: Package, color: 'text-pink-600 bg-pink-500/10' },
                    { label: 'ادمین پرداخت‌ها', href: '/dashboard/admin/payments', icon: CreditCard, color: 'text-cyan-600 bg-cyan-500/10' },
                    { label: 'مدیریت بنرها', href: '/dashboard/admin/banners', icon: ImageIcon, color: 'text-orange-600 bg-orange-500/10' },
                    { label: 'استوری‌ها و مقالات', href: '/dashboard/admin/stories', icon: Sparkles, color: 'text-violet-600 bg-violet-500/10' },
                  ].map((card, i) => (
                    <Link key={i} href={card.href} className="group p-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${card.color}`}><card.icon className="w-5 h-5" /></div>
                        <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">{card.label}</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:translate-x-[-4px] transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPartner && (
            <div className="space-y-6">
              <div className="relative overflow-hidden p-5 rounded-[1.5rem] border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-500/5 to-yellow-500/10">
                <h4 className="font-extrabold text-sm text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
                  <Coins className="w-4 h-4" /> مزایای حساب همکار فعال است
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  تمامی قیمت‌های کالاها در کل فروشگاه و سبد خرید با احتساب درصد تخفیف اختصاصی همکار محاسبه می‌شود. شما فاکتورها را با قیمت ویژه همکار دریافت می‌کنید.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/40 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">مجموع خریدهای همکار</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none mt-1">
                    {partnerStats.totalAmount.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-zinc-500">تومان</span>
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">کل فاکتورهای همکار</span>
                  <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200">{partnerStats.ordersCount}</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 p-4 rounded-2xl flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold mb-1">تعداد اقلام خریداری شده</span>
                  <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200">{partnerStats.itemsCount}</span>
                </div>
              </div>
            </div>
          )}

          {!isAdmin && !isPartner && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-bold mb-1 block">تعداد سفارش‌های من</span>
                    <span className="text-3xl font-black text-zinc-800 dark:text-zinc-200">{myOrders?.length ?? 0}</span>
                  </div>
                  <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-bold mb-1 block">سفارش‌های در جریان</span>
                    <span className="text-3xl font-black text-zinc-800 dark:text-zinc-200">
                      {myOrders?.filter(o => ['PENDING', 'PAID', 'SHIPPED'].includes(o.status)).length ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                </div>
              </div>
              
              <div className="p-6 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm mb-1 text-zinc-800 dark:text-zinc-200">سفارش جدید ثبت کنید</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">با افزودن کالاها به سبد خرید می‌توانید سفارش جدید ایجاد کرده و قیمت‌های شگفت‌انگیز را تجربه کنید.</p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="rounded-xl flex items-center gap-1.5 font-bold shrink-0">
                    ورود به فروشگاه <ArrowUpLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
