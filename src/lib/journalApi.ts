import type { JournalEntry } from '@/types/types';

const BASE = '/api/journal';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('hm_token');
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options?.headers ?? {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? 'Request failed');
    }
    return res.json() as Promise<T>;
}

export const journalApi = {
    list(): Promise<JournalEntry[]> {
        return apiFetch<JournalEntry[]>(BASE);
    },

    upsert(entry: Omit<JournalEntry, 'note'> & { note?: string }): Promise<JournalEntry> {
        return apiFetch<JournalEntry>(BASE, {
            method: 'POST',
            body: JSON.stringify(entry),
        });
    },
};
