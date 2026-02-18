import { useMemo } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { getHabitStats, getDailyTrend, generateHeatmapData } from '@/lib/analytics';
import StatCard from './StatCard';
import CompletionChart from './CompletionChart';
import TrendChart from './TrendChart';
import HeatmapCalendar from './HeatmapCalendar';
import { Flame, Target, TrendingUp, Trophy } from 'lucide-react';

export default function AnalyticsDashboard() {
    const habits = useHabitStore((s) => s.habits);
    const entries = useHabitStore((s) => s.entries);
    const settings = useHabitStore((s) => s.settings);

    const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

    const stats = useMemo(
        () => getHabitStats(habits, entries, settings.startDate, settings.endDate),
        [habits, entries, settings.startDate, settings.endDate]
    );

    const trendData = useMemo(
        () => getDailyTrend(entries, habits, settings.startDate, settings.endDate),
        [entries, habits, settings.startDate, settings.endDate]
    );

    const heatmapData = useMemo(
        () => generateHeatmapData(entries, null, new Date().getFullYear()),
        [entries]
    );

    // Aggregate stats
    const overallCompletion = useMemo(() => {
        if (stats.length === 0) return 0;
        const total = stats.reduce((sum, s) => sum + s.completionRate, 0);
        return Math.round(total / stats.length);
    }, [stats]);

    const bestStreak = useMemo(() => {
        if (stats.length === 0) return 0;
        return Math.max(...stats.map((s) => s.longestStreak));
    }, [stats]);

    const currentBestStreak = useMemo(() => {
        if (stats.length === 0) return 0;
        return Math.max(...stats.map((s) => s.currentStreak));
    }, [stats]);

    const totalCompletions = useMemo(
        () => entries.filter((e) => e.completed).length,
        [entries]
    );

    if (activeHabits.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center animate-fade-in">
                    <div
                        className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--check-bg)' }}
                    >
                        <TrendingUp className="w-8 h-8" style={{ color: 'var(--check-color)' }} />
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        No analytics yet
                    </h2>
                    <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Create some habits and start tracking to see your analytics come to life.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Analytics
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Your habit performance insights
                    </p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Overall Completion"
                        value={`${overallCompletion}%`}
                        icon={<Target className="w-5 h-5" />}
                        color="#6366f1"
                    />
                    <StatCard
                        label="Best Current Streak"
                        value={`${currentBestStreak}d`}
                        icon={<Flame className="w-5 h-5" />}
                        color="#f97316"
                    />
                    <StatCard
                        label="Longest Streak Ever"
                        value={`${bestStreak}d`}
                        icon={<Trophy className="w-5 h-5" />}
                        color="#eab308"
                    />
                    <StatCard
                        label="Total Completions"
                        value={totalCompletions}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="#22c55e"
                    />
                </div>

                {/* ── Charts Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <CompletionChart stats={stats} />
                    <TrendChart data={trendData} />
                </div>

                {/* ── Heatmap ── */}
                <div className="mb-6">
                    <HeatmapCalendar data={heatmapData} year={new Date().getFullYear()} />
                </div>

                {/* ── Per-Habit Stats Table ── */}
                <div
                    className="rounded-2xl overflow-hidden animate-slide-up"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border-default)',
                    }}
                >
                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            Habit Breakdown
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-header)' }}>
                                <th className="text-left px-5 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Habit
                                </th>
                                <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Completion
                                </th>
                                <th className="text-right px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Current Streak
                                </th>
                                <th className="text-right px-5 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    Best Streak
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((stat) => (
                                <tr
                                    key={stat.habitId}
                                    className="border-t"
                                    style={{ borderColor: 'var(--border-default)' }}
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: stat.color }}
                                            />
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                {stat.habitName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-default)' }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${stat.completionRate}%`,
                                                        backgroundColor: stat.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
                                                {stat.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right px-4 py-3">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {stat.currentStreak}
                                        </span>
                                        <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>days</span>
                                    </td>
                                    <td className="text-right px-5 py-3">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {stat.longestStreak}
                                        </span>
                                        <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>days</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
