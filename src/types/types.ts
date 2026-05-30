// ── Frequency Configuration ──
export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface FrequencyConfig {
    type: FrequencyType;
    days?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat — used for 'weekly' and 'custom'
}

// ── Habit Model ──
export interface Habit {
    id: string;
    name: string;
    createdAt: string; // ISO string
    archived: boolean;
    frequency: FrequencyConfig;
    color: string; // Hex color for charts
}

// ── Habit Entry Model ──
export interface HabitEntry {
    habitId: string;
    date: string; // ISO date string (YYYY-MM-DD)
    completed: boolean;
}

// ── Settings ──
export interface Settings {
    theme: 'light' | 'dark';
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
}

// ── App State ──
export interface AppState {
    habits: Habit[];
    entries: HabitEntry[];
    settings: Settings;
}

// ── Storage Schema ──
export interface StorageSchema {
    version: number;
    habits: Habit[];
    entries: HabitEntry[];
    settings: Settings;
}

// ── Analytics Types ──
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
}

export interface HeatmapDay {
    date: string;
    count: number;  // 0-4 intensity level
    completed: boolean;
}

export interface TrendDataPoint {
    date: string;
    completionRate: number;
    completed: number;
    total: number;
}

export interface HabitStats {
    habitId: string;
    habitName: string;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
    totalExpected: number;
    color: string;
}

// ── View Types ──
export type ViewMode = 'grid' | 'analytics';

// ── Analytics Enhanced Types ──
export interface DayOfWeekData {
    day: string;
    completionRate: number;
}

export interface Insight {
    id: string;
    type: 'positive' | 'warning' | 'neutral';
    message: string;
}

// ── Journal Types ──
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface JournalEntry {
    date: string;         // YYYY-MM-DD
    mood: number;         // 1-5
    energyLevel: EnergyLevel;
    note: string;
}

export interface MoodTrendPoint {
    date: string;
    mood: number | null;
    completionRate: number;
    note?: string;
}
