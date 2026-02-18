import { create } from 'zustand';
import type {
    Habit,
    HabitEntry,
    Settings,
    FrequencyConfig,
    ViewMode,
} from '@/types/types';
import { loadState, saveState } from '@/lib/storage';
import { generateId, getRandomColor } from '@/lib/utils';
import { format, subDays } from 'date-fns';

interface HabitStore {
    // ── State ──
    habits: Habit[];
    entries: HabitEntry[];
    settings: Settings;
    viewMode: ViewMode;

    // ── Habit Actions ──
    addHabit: (name: string, frequency: FrequencyConfig) => void;
    deleteHabit: (id: string) => void;
    renameHabit: (id: string, name: string) => void;
    archiveHabit: (id: string) => void;
    unarchiveHabit: (id: string) => void;

    // ── Entry Actions ──
    toggleEntry: (habitId: string, date: string) => void;

    // ── Settings Actions ──
    setTheme: (theme: 'light' | 'dark') => void;
    setDateRange: (startDate: string, endDate: string) => void;
    setViewMode: (mode: ViewMode) => void;

    // ── Data Actions ──
    importData: (habits: Habit[], entries: HabitEntry[], settings?: Settings) => void;
    clearAllData: () => void;

    // ── Internal ──
    _persist: () => void;
}

const initialState = loadState();

export const useHabitStore = create<HabitStore>((set, get) => ({
    // ── Initial State ──
    habits: initialState.habits,
    entries: initialState.entries,
    settings: initialState.settings,
    viewMode: 'grid' as ViewMode,

    // ── Persist Helper ──
    _persist: () => {
        const { habits, entries, settings } = get();
        saveState({ version: 1, habits, entries, settings });
    },

    // ── Habit CRUD ──
    addHabit: (name, frequency) => {
        const newHabit: Habit = {
            id: generateId(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
            archived: false,
            frequency,
            color: getRandomColor(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        get()._persist();
    },

    deleteHabit: (id) => {
        set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
            entries: state.entries.filter((e) => e.habitId !== id),
        }));
        get()._persist();
    },

    renameHabit: (id, name) => {
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, name: name.trim() } : h
            ),
        }));
        get()._persist();
    },

    archiveHabit: (id) => {
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, archived: true } : h
            ),
        }));
        get()._persist();
    },

    unarchiveHabit: (id) => {
        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === id ? { ...h, archived: false } : h
            ),
        }));
        get()._persist();
    },

    // ── Entry Toggle ──
    toggleEntry: (habitId, date) => {
        set((state) => {
            const existing = state.entries.find(
                (e) => e.habitId === habitId && e.date === date
            );

            if (existing) {
                // Toggle existing entry
                return {
                    entries: state.entries.map((e) =>
                        e.habitId === habitId && e.date === date
                            ? { ...e, completed: !e.completed }
                            : e
                    ),
                };
            } else {
                // Create new entry as completed
                return {
                    entries: [
                        ...state.entries,
                        { habitId, date, completed: true },
                    ],
                };
            }
        });
        get()._persist();
    },

    // ── Settings ──
    setTheme: (theme) => {
        set((state) => ({
            settings: { ...state.settings, theme },
        }));
        get()._persist();
    },

    setDateRange: (startDate, endDate) => {
        set((state) => ({
            settings: { ...state.settings, startDate, endDate },
        }));
        get()._persist();
    },

    setViewMode: (mode) => {
        set({ viewMode: mode });
    },

    // ── Import/Export ──
    importData: (habits, entries, settings) => {
        const defaultSettings: Settings = {
            theme: 'light',
            startDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        };
        set({
            habits,
            entries,
            settings: settings ?? defaultSettings,
        });
        get()._persist();
    },

    clearAllData: () => {
        const defaultSettings: Settings = {
            theme: 'light',
            startDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd'),
        };
        set({
            habits: [],
            entries: [],
            settings: defaultSettings,
        });
        get()._persist();
    },
}));
