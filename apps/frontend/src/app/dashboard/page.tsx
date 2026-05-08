'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { userService } from '@/services';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/error-handler';

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!accessToken,
  });

  // Initialize form with profile data (derived state)
  const initialFirstName = useMemo(() => profile?.firstName || '', [profile?.firstName]);
  const initialLastName = useMemo(() => profile?.lastName || '', [profile?.lastName]);
  const initialEmail = useMemo(() => profile?.email || '', [profile?.email]);

  // Only set state if it's different from initial (avoid unnecessary re-renders)
  if (profile && firstName === '' && lastName === '' && email === '') {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail);
  }

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

  if (!accessToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">پیشخوان کاربری</h1>
        <p className="text-zinc-500">اطلاعات شخصی خود را مدیریت کنید</p>
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-6">اطلاعات شخصی</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">نام</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="نام خود را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">نام خانوادگی</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="نام خانوادگی خود را وارد کنید"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              value={profile?.phone || ''}
              disabled
              className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-left"
              dir="ltr"
            />
            <p className="text-xs text-zinc-500">برای تغییر شماره موبایل با پشتیبانی تماس بگیرید.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="h-12 rounded-xl text-left"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <Button
              type="submit"
              size="lg"
              className="rounded-xl w-full sm:w-auto px-8"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                'ثبت تغییرات'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
