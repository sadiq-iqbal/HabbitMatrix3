import { parseISO, differenceInCalendarDays, format, eachDayOfInterval } from 'date-fns';
import type {
    Habit,
    HabitEntry,
    StreakData,
    HabitStats,
    HeatmapDay,
    TrendDataPoint,
    DayOfWeekData,
    Insight,
    JournalEntry,
    MoodTrendPoint,
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
    const habitEntries = new Set(
        entries.filter((e) => e.habitId === habit.id && e.completed).map((e) => e.date)
    );

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const createdDate = parseISO(habit.createdAt.split('T')[0] ?? habit.createdAt);
    const todayDate = parseISO(todayStr);
    
    // Instead of time-math which can jump days due to DST/timezone parsing, 
    // let's get all days from createdDate to today
    const allDays = eachDayOfInterval({ start: createdDate, end: todayDate }).map(d => format(d, 'yyyy-MM-dd'));

    let longestStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;
    
    for (const dateStr of allDays) {
        if (!isHabitExpectedOnDate(habit, dateStr)) {
            continue; // Ignore non-expected days
        }
        
        if (habitEntries.has(dateStr)) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }
    
    // For current streak, count backward from the end of the expected days list
    const expectedDays = allDays.filter(d => isHabitExpectedOnDate(habit, d));
    for (let i = expectedDays.length - 1; i >= 0; i--) {
        const d = expectedDays[i];
        if (habitEntries.has(d)) {
            currentStreak++;
        } else {
            // Allow today to be uncompleted without breaking the streak from yesterday
            if (d === todayStr) {
                continue;
            }
            break;
        }
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

/**
 * Calculate completion rate by day of the week (Sun - Sat)
 */
export function getCompletionByDayOfWeek(
    entries: HabitEntry[],
    habits: Habit[],
    startDate: string,
    endDate: string
): DayOfWeekData[] {
    const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
    });

    const activeHabits = habits.filter((h) => !h.archived);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const completeds = [0, 0, 0, 0, 0, 0, 0];

    for (const day of days) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayOfWeek = day.getDay(); // 0-6

        for (const habit of activeHabits) {
            if (isHabitExpectedOnDate(habit, dateStr)) {
                totals[dayOfWeek]++;
                const entry = entries.find(
                    (e) => e.habitId === habit.id && e.date === dateStr && e.completed
                );
                if (entry) completeds[dayOfWeek]++;
            }
        }
    }

    return dayNames.map((name, i) => ({
        day: name,
        completionRate: totals[i] > 0 ? Math.round((completeds[i] / totals[i]) * 100) : 0,
    }));
}

/**
 * Generate smart textual insights based on habit data
 */
export function getInsights(
    habits: Habit[],
    entries: HabitEntry[],
    startDate: string,
    endDate: string
): Insight[] {
    const insights: Insight[] = [];
    const activeHabits = habits.filter((h) => !h.archived);
    if (activeHabits.length === 0) return insights;

    const stats = getHabitStats(activeHabits, entries, startDate, endDate);
    const dayOfWeekData = getCompletionByDayOfWeek(entries, activeHabits, startDate, endDate);

    // Insight 1: Best / Worst day of the week
    let bestDay = dayOfWeekData[0];
    let worstDay = dayOfWeekData[0];
    for (const d of dayOfWeekData) {
        if (d.completionRate > bestDay.completionRate) bestDay = d;
        if (d.completionRate < worstDay.completionRate) worstDay = d;
    }

    if (bestDay && bestDay.completionRate > 0) {
        insights.push({
            id: 'best-day',
            type: 'positive',
            message: `You're most consistent on ${bestDay.day}s (${bestDay.completionRate}% completion).`,
        });
    }

    if (worstDay && worstDay.completionRate < 50 && bestDay.completionRate - worstDay.completionRate > 20) {
        insights.push({
            id: 'worst-day',
            type: 'warning',
            message: `${worstDay.day}s are your toughest days (${worstDay.completionRate}%). Try to plan ahead!`,
        });
    }

    // Insight 2: Streaks
    const bestCurrent = stats.sort((a, b) => b.currentStreak - a.currentStreak)[0];
    if (bestCurrent && bestCurrent.currentStreak >= 3) {
        insights.push({
            id: 'best-streak',
            type: 'positive',
            message: `You're on fire with '${bestCurrent.habitName}'! (${bestCurrent.currentStreak} day streak)`,
        });
    }

    // Insight 3: Struggling habit
    const struggling = stats.filter((s) => s.completionRate < 30 && s.totalExpected > 3)[0];
    if (struggling) {
        insights.push({
            id: 'struggling',
            type: 'warning',
            message: `You've been missing '${struggling.habitName}' lately. Consider adjusting your goal.`,
        });
    }

    return insights;
}

/**
 * Generate a combined mood + completion trend per day
 */
export function getMoodTrend(
    journalEntries: JournalEntry[],
    trendData: TrendDataPoint[]
): MoodTrendPoint[] {
    const journalMap = new Map<string, JournalEntry>();
    for (const j of journalEntries) {
        journalMap.set(j.date, j);
    }

    return trendData.map((t) => {
        const j = journalMap.get(t.date);
        return {
            date: t.date,
            completionRate: t.completionRate,
            mood: j?.mood ?? null,
            note: j?.note,
        };
    });
}
