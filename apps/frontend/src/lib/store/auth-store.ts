import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Matches exactly what the backend returns from GET /users/me
export interface AuthUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'partner';
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionChecked: boolean;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setSessionChecked: (checked: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionChecked: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      setSessionChecked: (sessionChecked) => set({ sessionChecked }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null, sessionChecked: true }),
    }),
    {
      name: 'auth-session-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
