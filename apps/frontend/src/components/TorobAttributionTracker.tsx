'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clearResponseCache } from '@/services/api-client';

const TOROB_ATTR_KEY = 'torob_attribution_until';

export function TorobAttributionTracker() {
  const queryClient = useQueryClient();
  const [activeUntil, setActiveUntil] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check localStorage initially
    const stored = localStorage.getItem(TOROB_ATTR_KEY);
    const initialUntil = stored ? parseInt(stored, 10) : 0;
    const now = Date.now();

    if (Number.isFinite(initialUntil) && initialUntil > now) {
      setActiveUntil(initialUntil);
    }

    // Set up timer check every 1 second
    const interval = setInterval(() => {
      const currentNow = Date.now();
      const currentStored = localStorage.getItem(TOROB_ATTR_KEY);
      const currentUntil = currentStored ? parseInt(currentStored, 10) : 0;

      // Case 1: Active attribution exists
      if (Number.isFinite(currentUntil) && currentUntil > currentNow) {
        // If a new or refreshed attribution has started/extended
        if (currentUntil !== activeUntil) {
          // If activeUntil was 0 (inactive), show success activation toast
          if (activeUntil === 0) {
            toast.success('تخفیف ویژه ۲۰ دقیقه‌ای ترب برای شما فعال شد!', {
              description: 'قیمت‌های سایت با تخفیف ویژه ترب به شما نمایش داده می‌شوند.',
              duration: 5000,
            });
          }
          setActiveUntil(currentUntil);
        }
      }

      // Case 2: Attribution has expired (was active, now current time exceeds it)
      if (activeUntil > 0 && currentNow >= activeUntil) {
        // Clear all states and cookies
        localStorage.removeItem(TOROB_ATTR_KEY);
        document.cookie = `${TOROB_ATTR_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
        setActiveUntil(0);

        // Clear local Axios GET response caches
        clearResponseCache();

        // Invalidate TanStack Query caches to force immediate Farsi pricing refetch
        queryClient.invalidateQueries();

        // Show prominent warning toast
        toast.warning('زمان تخفیف ویژه ترب شما به پایان رسید', {
          description: 'محدودیت زمانی ۲۰ دقیقه تمام شد. قیمت‌ها به حالت عادی بازگشتند.',
          duration: 7000,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeUntil, queryClient]);

  return null;
}
