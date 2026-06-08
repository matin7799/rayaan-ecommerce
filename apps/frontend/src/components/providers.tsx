'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService, userService } from '@/services';
import { cartService } from '@/services/cart.service';

function AuthSessionBootstrap() {
  const { accessToken, setAuth, setTokens, logout, setSessionChecked } = useAuthStore();

  useEffect(() => {
    // Skip session check if already authenticated or no saved session exists
    if (accessToken) {
      setSessionChecked(true);
      return;
    }

    // Quick check: if no stored access token exists, skip auth restore entirely
    const storedRaw = localStorage.getItem('auth-session-store');
    const hasStoredSession = storedRaw
      ? !!JSON.parse(storedRaw)?.state?.accessToken
      : false;
    if (!hasStoredSession) {
      setSessionChecked(true);
      return;
    }

    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const restore = async () => {
      // Add a timeout to avoid hanging the app on slow network
      const timeoutPromise = new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Auth restore timeout')), 5000);
      });

      try {
        await Promise.race([
          (async () => {
            const refresh = await authService.refreshSession();
            const tokens = refresh.data;
            if (!tokens?.accessToken || !tokens?.refreshToken || !mounted) {
              return;
            }
            // Persist tokens in memory first so subsequent /users/me uses Authorization header.
            setTokens(tokens.accessToken, tokens.refreshToken);
            const user = await userService.getProfile();
            if (!mounted) return;
            setAuth(user, tokens.accessToken, tokens.refreshToken);

            // Merge guest cart items if any exist
            try {
              const guestCart = cartService.getStoredCart();
              if (guestCart && guestCart.items.length > 0) {
                await cartService.mergeCart(
                  guestCart.items.map((item) => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                  })),
                );
                cartService.clearStoredCart();
              }
            } catch (err) {
              console.error('Failed to merge cart during session restore:', err);
            }
          })(),
          timeoutPromise,
        ]);
      } catch {
        // Silently fail — user can re-authenticate when needed
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setSessionChecked(true);
        }
      }
    };

    restore();
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [accessToken, setAuth, setTokens, logout, setSessionChecked]);

  return null;
}

import { TorobAttributionTracker } from './TorobAttributionTracker';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionBootstrap />
      <TorobAttributionTracker />
      <Toaster position="top-center" richColors />
      {children}
    </QueryClientProvider>
  );
}

