import { eachDayOfInterval, parseISO, getDay, format } from 'date-fns';
import type { Habit, FrequencyConfig } from '@/types/types';

/**
 * Generate a unique ID using crypto.randomUUID
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Get an array of ISO date strings between start and end (inclusive)
 */
export function getDateRange(start: string, end: string): string[] {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    if (startDate > endDate) return [];
    return eachDayOfInterval({ start: startDate, end: endDate }).map((d) =>
        format(d, 'yyyy-MM-dd')
    );
}

/**
 * Check if a habit is expected on a given date based on its frequency config
 */
export function isHabitExpectedOnDate(
    habit: Habit,
    dateStr: string
): boolean {
    const freq: FrequencyConfig = habit.frequency;
    if (freq.type === 'daily') return true;

    const dayOfWeek = getDay(parseISO(dateStr)); // 0=Sun .. 6=Sat
    if (freq.type === 'weekly' || freq.type === 'custom') {
        return freq.days?.includes(dayOfWeek) ?? true;
    }
    return true;
}

/**
 * Merge class names — simple utility to join strings
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Format a date string to a short readable format
 */
export function formatDateShort(dateStr: string): string {
    return format(parseISO(dateStr), 'MMM d');
}

/**
 * Format a date string to include day of week
 */
export function formatDateWithDay(dateStr: string): string {
    return format(parseISO(dateStr), 'EEE, MMM d');
}

/**
 * Format a date string to compact format for grid column headers (e.g., "19\nFeb")
 */
export function formatDateCompact(dateStr: string): { day: string; weekday: string; month: string } {
    const d = parseISO(dateStr);
    return {
        day: format(d, 'd'),
        weekday: format(d, 'EEE'),
        month: format(d, 'MMM'),
    };
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getToday(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Generate a random pastel color hex string
 */
const HABIT_COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#2563eb',
];

export function getRandomColor(): string {
    return HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)] ?? '#6366f1';
}

/**
 * Convert entries to CSV string
 */
export function entriesToCSV(
    habits: Habit[],
    entries: { habitId: string; date: string; completed: boolean }[]
): string {
    const headers = ['Date', ...habits.map((h) => h.name)];
    const dateSet = new Set(entries.map((e) => e.date));
    const dates = [...dateSet].sort();

    const rows = dates.map((date) => {
        const row = [date];
        for (const habit of habits) {
            const entry = entries.find(
                (e) => e.habitId === habit.id && e.date === date
            );
            row.push(entry?.completed ? '1' : '0');
        }
        return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}
