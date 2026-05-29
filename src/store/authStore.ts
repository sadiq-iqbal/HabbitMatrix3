import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';
import { authApi } from '@/lib/authApi';

const TOKEN_KEY = 'hm_token';

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    authLoading: boolean;
    authError: string | null;

    // Initialise — check stored token on app start
    initAuth: () => Promise<void>;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    clearAuthError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    authLoading: true,
    authError: null,

    initAuth: async () => {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (!stored) {
            set({ authLoading: false });
            return;
        }
        try {
            const user = await authApi.me(stored);
            set({ user, token: stored, authLoading: false });
        } catch {
            localStorage.removeItem(TOKEN_KEY);
            set({ user: null, token: null, authLoading: false });
        }
    },

    login: async (email, password) => {
        set({ authError: null });
        try {
            const { token, user } = await authApi.login(email, password);
            localStorage.setItem(TOKEN_KEY, token);
            set({ user, token, authError: null });
        } catch (err) {
            set({ authError: err instanceof Error ? err.message : 'Login failed' });
            throw err;
        }
    },

    register: async (email, password, name) => {
        set({ authError: null });
        try {
            const { token, user } = await authApi.register(email, password, name);
            localStorage.setItem(TOKEN_KEY, token);
            set({ user, token, authError: null });
        } catch (err) {
            set({ authError: err instanceof Error ? err.message : 'Registration failed' });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null });
    },

    clearAuthError: () => set({ authError: null }),
}));

export function getToken(): string | null {
    return useAuthStore.getState().token;
}
