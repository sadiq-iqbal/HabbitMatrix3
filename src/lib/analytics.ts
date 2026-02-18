import { parseISO, differenceInCalendarDays, format, eachDayOfInterval } from 'date-fns';
import type {
    Habit,
    HabitEntry,
    StreakData,
    HabitStats,
    HeatmapDay,
    TrendDataPoint,
} from '@/types/types';
import { isHabitExpectedOnDate } from './utils';

/**
 * Calculate current and longest streak for a habit.
 * Iterates backward from today counting consecutive completed expected days.
 */
export function calculateStreak(
    entries: HabitEntry[],
    habit: Habit
): StreakData {
    const habitEntries = entries
        .filter((e) => e.habitId === habit.id && e.completed)
        .map((e) => e.date)
        .sort()
        .reverse();

    const completedSet = new Set(habitEntries);
    const today = format(new Date(), 'yyyy-MM-dd');

    // Current streak: iterate backward from today
    let currentStreak = 0;
    let checkDate = parseISO(today);

    for (let i = 0; i < 1000; i++) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');

        if (!isHabitExpectedOnDate(habit, dateStr)) {
            // Skip non-expected days
            checkDate = new Date(checkDate.getTime() - 86400000);
            continue;
        }

        if (completedSet.has(dateStr)) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
            break;
        }
    }

    // Longest streak: scan all entries
    let longestStreak = 0;
    let tempStreak = 0;

    const createdDate = parseISO(habit.createdAt.split('T')[0] ?? habit.createdAt);
    const todayDate = parseISO(today);
    const totalDays = differenceInCalendarDays(todayDate, createdDate) + 1;

    let scanDate = createdDate;
    for (let i = 0; i < totalDays && i < 1000; i++) {
        const dateStr = format(scanDate, 'yyyy-MM-dd');

        if (!isHabitExpectedOnDate(habit, dateStr)) {
            scanDate = new Date(scanDate.getTime() + 86400000);
            continue;
        }

        if (completedSet.has(dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }

        scanDate = new Date(scanDate.getTime() + 86400000);
    }

    return { currentStreak, longestStreak };
}

/**
 * Calculate completion rate for a habit over a date range.
 * Takes frequency rules into account.
 */
export function calculateCompletionRate(
    entries: HabitEntry[],
    habit: Habit,
    startDate: string,
    endDate: string
): number {
    const dates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
    });

    let expected = 0;
    let completed = 0;

    const completedSet = new Set(
        entries
            .filter((e) => e.habitId === habit.id && e.completed)
            .map((e) => e.date)
    );

    for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (isHabitExpectedOnDate(habit, dateStr)) {
            expected++;
            if (completedSet.has(dateStr)) {
                completed++;
            }
        }
    }

    if (expected === 0) return 0;
    return Math.round((completed / expected) * 100);
}

/**
 * Generate stats for all active habits
 */
export function getHabitStats(
    habits: Habit[],
    entries: HabitEntry[],
    startDate: string,
    endDate: string
): HabitStats[] {
    return habits
        .filter((h) => !h.archived)
        .map((habit) => {
            const streak = calculateStreak(entries, habit);
            const completionRate = calculateCompletionRate(
                entries,
                habit,
                startDate,
                endDate
            );

            const totalCompleted = entries.filter(
                (e) => e.habitId === habit.id && e.completed
            ).length;

            const dates = eachDayOfInterval({
                start: parseISO(startDate),
                end: parseISO(endDate),
            });
            const totalExpected = dates.filter((d) =>
                isHabitExpectedOnDate(habit, format(d, 'yyyy-MM-dd'))
            ).length;

            return {
                habitId: habit.id,
                habitName: habit.name,
                completionRate,
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalCompleted,
                totalExpected,
                color: habit.color,
            };
        });
}

/**
 * Generate heatmap data for a specific habit over a year
 */
export function generateHeatmapData(
    entries: HabitEntry[],
    habitId: string | null,
    year: number
): HeatmapDay[] {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const completedSet = new Set(
        entries
            .filter((e) => {
                if (habitId && e.habitId !== habitId) return false;
                return e.completed;
            })
            .map((e) => e.date)
    );

    // Count completions per date (across all habits if no habitId)
    const dateCounts = new Map<string, number>();
    for (const entry of entries) {
        if (habitId && entry.habitId !== habitId) continue;
        if (!entry.completed) continue;
        const current = dateCounts.get(entry.date) ?? 0;
        dateCounts.set(entry.date, current + 1);
    }

    const maxCount = Math.max(1, ...dateCounts.values());

    return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = dateCounts.get(dateStr) ?? 0;
        // Normalize to 0-4 intensity
        const intensity = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);
        return {
            date: dateStr,
            count: intensity,
            completed: completedSet.has(dateStr),
        };
    });
}

/**
 * Generate daily trend data — overall completion rate per day
 */
export function getDailyTrend(
    entries: HabitEntry[],
    habits: Habit[],
    startDate: string,
    endDate: string
): TrendDataPoint[] {
    const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
    });

    const activeHabits = habits.filter((h) => !h.archived);

    return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        let total = 0;
        let completed = 0;

        for (const habit of activeHabits) {
            if (isHabitExpectedOnDate(habit, dateStr)) {
                total++;
                const entry = entries.find(
                    (e) => e.habitId === habit.id && e.date === dateStr && e.completed
                );
                if (entry) completed++;
            }
        }

        return {
            date: dateStr,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            completed,
            total,
        };
    });
}
