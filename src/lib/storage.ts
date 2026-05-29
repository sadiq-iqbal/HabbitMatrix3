import { format, addDays } from 'date-fns';
import type { StorageSchema, Settings } from '@/types/types';
import { storageSchema } from './schemas';

const STORAGE_KEY = 'habit-matrix-data-v1';
const CURRENT_VERSION = 1;

/**
 * Create default state when no data exists or data is corrupted
 */
export function getDefaultState(): StorageSchema {
    const today = new Date();
    const startDate = format(today, 'yyyy-MM-dd');
    const endDate = format(addDays(today, 29), 'yyyy-MM-dd');

    return {
        version: CURRENT_VERSION,
        habits: [],
        entries: [],
        settings: {
            theme: 'light',
            startDate,
            endDate,
        },
    };
}

/**
 * Migrate schema from older versions. Currently v1 only.
 */
function migrateSchema(data: Record<string, unknown>): StorageSchema {
    const version = (data.version as number) || 0;

    if (version < 1) {
        // Migration from v0 (pre-versioning) to v1
        return {
            version: CURRENT_VERSION,
            habits: Array.isArray(data.habits) ? data.habits : [],
            entries: Array.isArray(data.entries) ? data.entries : [],
            settings: (data.settings as Settings) || getDefaultState().settings,
        } as StorageSchema;
    }

    return data as StorageSchema;
}

/**
 * Load state from localStorage with validation and migration
 */
export function loadState(): StorageSchema {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getDefaultState();

        const parsed: unknown = JSON.parse(raw);

        if (typeof parsed !== 'object' || parsed === null) {
            console.warn('[HabitMatrix] Invalid storage data, using defaults');
            return getDefaultState();
        }

        // Attempt migration if needed
        const migrated = migrateSchema(parsed as Record<string, unknown>);

        // Validate with Zod
        const result = storageSchema.safeParse(migrated);
        if (!result.success) {
            console.warn('[HabitMatrix] Schema validation failed:', result.error.issues);
            return getDefaultState();
        }

        return result.data;
    } catch (error) {
        console.warn('[HabitMatrix] Failed to load state:', error);
        return getDefaultState();
    }
}

/**
 * Save state to localStorage
 */
export function saveState(state: StorageSchema): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('[HabitMatrix] Failed to save state:', error);
    }
}

/**
 * Export data as JSON file download
 */
export function exportAsJSON(state: StorageSchema): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-matrix-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file download
 */
export function exportAsCSV(
    csvContent: string
): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-matrix-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
