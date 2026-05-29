import type { AuthUser } from '@/types/auth';

const BASE = '/api/auth';

interface AuthResponse {
    token: string;
    user: AuthUser;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data as T;
}

export const authApi = {
    register: (email: string, password: string, name?: string) =>
        request<AuthResponse>('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    login: (email: string, password: string) =>
        request<AuthResponse>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    me: (token: string) =>
        fetch(`${BASE}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Unauthorized');
            return data as AuthUser;
        }),
};
