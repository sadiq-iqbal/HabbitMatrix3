import { create } from 'zustand';
import type {
    Habit,
    HabitEntry,
    Settings,
    FrequencyConfig,
    ViewMode,
} from '@/types/types';
import { habitsApi, entriesApi, settingsApi, dataApi } from '@/lib/api';
import { getDefaultState } from '@/lib/storage';
import { format, subDays } from 'date-fns';

interface HabitStore {
    // ── State ──
    habits: Habit[];
    entries: HabitEntry[];
    settings: Settings;
    viewMode: ViewMode;
    loading: boolean;
    error: string | null;

    // ── Bootstrap ──
    init: () => Promise<void>;

    // ── Habit Actions ──
    addHabit: (name: string, frequency: FrequencyConfig) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    renameHabit: (id: string, name: string) => Promise<void>;
    archiveHabit: (id: string) => Promise<void>;
    unarchiveHabit: (id: string) => Promise<void>;

    // ── Entry Actions ──
    toggleEntry: (habitId: string, date: string) => Promise<void>;

    // ── Settings Actions ──
    setTheme: (theme: 'light' | 'dark') => Promise<void>;
    setDateRange: (startDate: string, endDate: string) => Promise<void>;
    setViewMode: (mode: ViewMode) => void;

    // ── Data Actions ──
    importData: (habits: Habit[], entries: HabitEntry[], settings?: Settings) => Promise<void>;
    clearAllData: () => Promise<void>;
}

const defaults = getDefaultState();

export const useHabitStore = create<HabitStore>((set, get) => ({
    // ── Initial State ──
    habits: defaults.habits,
    entries: defaults.entries,
    settings: defaults.settings,
    viewMode: 'grid' as ViewMode,
    loading: true,
    error: null,

    // ── Bootstrap: load all data from server ──
    init: async () => {
        try {
            const [habits, entries, settings] = await Promise.all([
                habitsApi.list(),
                entriesApi.list(),
                settingsApi.get(),
            ]);
            set({ habits, entries, settings, loading: false, error: null });
        } catch (err) {
            console.error('[HabitMatrix] Failed to load data from server:', err);
            set({ loading: false, error: 'Could not connect to server' });
        }
    },

    // ── Habit CRUD ──
    addHabit: async (name, frequency) => {
        const habit = await habitsApi.create(name, frequency);
        set((state) => ({ habits: [...state.habits, habit] }));
    },

    deleteHabit: async (id) => {
        // Optimistic update
        const prev = get().habits;
        const prevEntries = get().entries;
        set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
            entries: state.entries.filter((e) => e.habitId !== id),
        }));
        try {
            await habitsApi.remove(id);
        } catch (err) {
            // Rollback on failure
            set({ habits: prev, entries: prevEntries });
            throw err;
        }
    },

    renameHabit: async (id, name) => {
        const prev = get().habits;
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, name: name.trim() } : h
            ),
        }));
        try {
            await habitsApi.update(id, { name: name.trim() });
        } catch (err) {
            set({ habits: prev });
            throw err;
        }
    },

    archiveHabit: async (id) => {
        const prev = get().habits;
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, archived: true } : h
            ),
        }));
        try {
            await habitsApi.update(id, { archived: true });
        } catch (err) {
            set({ habits: prev });
            throw err;
        }
    },

    unarchiveHabit: async (id) => {
        const prev = get().habits;
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, archived: false } : h
            ),
        }));
        try {
            await habitsApi.update(id, { archived: false });
        } catch (err) {
            set({ habits: prev });
            throw err;
        }
    },

    // ── Entry Toggle (optimistic) ──
    toggleEntry: async (habitId, date) => {
        const prevEntries = get().entries;

        // Optimistic local update
        set((state) => {
            const existing = state.entries.find(
                (e) => e.habitId === habitId && e.date === date
            );
            if (existing) {
                return {
                    entries: state.entries.map((e) =>
                        e.habitId === habitId && e.date === date
                            ? { ...e, completed: !e.completed }
                            : e
                    ),
                };
            }
            return {
                entries: [...state.entries, { habitId, date, completed: true }],
            };
        });

        try {
            const updated = await entriesApi.toggle(habitId, date);
            // Sync server truth
            set((state) => {
                const idx = state.entries.findIndex(
                    (e) => e.habitId === habitId && e.date === date
                );
                if (idx !== -1) {
                    const entries = [...state.entries];
                    entries[idx] = updated;
                    return { entries };
                }
                return {};
            });
        } catch (err) {
            set({ entries: prevEntries });
            throw err;
        }
    },

    // ── Settings ──
    setTheme: async (theme) => {
        set((state) => ({ settings: { ...state.settings, theme } }));
        await settingsApi.update({ theme });
    },

    setDateRange: async (startDate, endDate) => {
        set((state) => ({ settings: { ...state.settings, startDate, endDate } }));
        await settingsApi.update({ startDate, endDate });
    },

    setViewMode: (mode) => {
        set({ viewMode: mode });
    },

    // ── Import / Export ──
    importData: async (habits, entries, settings) => {
        const defaultSettings: Settings = {
            theme: 'light',
            startDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        };
        const resolvedSettings = settings ?? defaultSettings;
        await dataApi.import(habits, entries, resolvedSettings);
        set({ habits, entries, settings: resolvedSettings });
    },

    clearAllData: async () => {
        const defaultSettings: Settings = {
            theme: 'light',
            startDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        };
        await dataApi.clear();
        set({ habits: [], entries: [], settings: defaultSettings });
    },
}));
