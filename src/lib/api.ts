import type { Habit, HabitEntry, Settings, FrequencyConfig, StorageSchema } from '@/types/types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${options?.method ?? 'GET'} ${path} failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
}

// ── Habits ──────────────────────────────────────────────────────────────────

export const habitsApi = {
    list: () => request<Habit[]>('/habits'),

    create: (name: string, frequency: FrequencyConfig) =>
        request<Habit>('/habits', {
            method: 'POST',
            body: JSON.stringify({ name, frequency }),
        }),

    update: (id: string, patch: Partial<Omit<Habit, 'id'>>) =>
        request<Habit>(`/habits/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patch),
        }),

    remove: (id: string) =>
        request<{ success: boolean }>(`/habits/${id}`, { method: 'DELETE' }),
};

// ── Entries ──────────────────────────────────────────────────────────────────

export const entriesApi = {
    list: (params?: { habitId?: string; startDate?: string; endDate?: string }) => {
        const qs = new URLSearchParams(
            Object.entries(params ?? {}).filter(([, v]) => v != null) as [string, string][]
        ).toString();
        return request<HabitEntry[]>(`/entries${qs ? `?${qs}` : ''}`);
    },

    toggle: (habitId: string, date: string) =>
        request<HabitEntry>('/entries/toggle', {
            method: 'POST',
            body: JSON.stringify({ habitId, date }),
        }),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsApi = {
    get: () => request<Settings>('/settings'),

    update: (patch: Partial<Settings>) =>
        request<Settings>('/settings', {
            method: 'PUT',
            body: JSON.stringify(patch),
        }),
};

// ── Data (import / export / clear) ───────────────────────────────────────────

export const dataApi = {
    export: () => request<StorageSchema>('/data'),

    import: (habits: Habit[], entries: HabitEntry[], settings?: Settings) =>
        request<{ success: boolean }>('/data/import', {
            method: 'POST',
            body: JSON.stringify({ habits, entries, settings }),
        }),

    clear: () =>
        request<{ success: boolean }>('/data', { method: 'DELETE' }),
};
