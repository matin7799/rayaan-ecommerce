// apps/frontend/src/utils/logout.ts
import { authService } from '@/services/auth.service';
import { clearResponseCache } from '@/services/api-client';

/**
 * Executes a bulletproof logout flow on the client side:
 * 1. Instructs the backend to invalidate the session cookie.
 * 2. Destroys all client cookies and localStorage tokens.
 * 3. Resets both active Zustand auth stores to initial states.
 * 4. Clears in-memory API response caches.
 * 5. Forces a full page redirection to wipe the Next.js client Router Cache.
 */
export async function performBulletproofLogout(): Promise<void> {
  // 1. Call the backend logout API (invalidates backend HttpOnly cookie)
  try {
    await authService.logout();
  } catch (error) {
    console.error('Backend logout error:', error);
  }

  // 2. Clear client-accessible cookies
  if (typeof document !== 'undefined') {
    document.cookie = 'torob_attribution_until=; Max-Age=0; Path=/; SameSite=Lax';
    document.cookie = 'refresh_token=; Max-Age=0; Path=/api/v1/auth; SameSite=Lax';
  }

  // 3. Clear localStorage completely
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('auth-storage');
    window.localStorage.removeItem('auth-session-store');
    window.localStorage.removeItem('torob_attribution_until');
  }

  // 4. Reset both Zustand stores
  try {
    const { useAuthStore: useAuthSessionStore } = await import('@/lib/store/auth-store');
    const { useAuthStore: useAuthLocalStore } = await import('@/stores/auth.store');

    useAuthSessionStore.getState().logout();
    useAuthLocalStore.getState().logout();
  } catch (error) {
    console.error('Failed to reset Zustand stores during logout:', error);
  }

  // 5. Clear client Axios response cache
  clearResponseCache();

  // 6. Hard redirect to /login to wipe in-memory Next.js Router Cache
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }
}
