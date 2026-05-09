'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService, userService } from '@/services';

function AuthSessionBootstrap() {
  const { accessToken, setAuth, setTokens, logout, setSessionChecked } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      setSessionChecked(true);
      return;
    }

    let mounted = true;
    const restore = async () => {
      try {
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
        setSessionChecked(true);
      } catch {
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
    };
  }, [accessToken, setAuth, setTokens, logout, setSessionChecked]);

  return null;
}

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
      <Toaster position="top-center" richColors />
      {children}
    </QueryClientProvider>
  );
}
