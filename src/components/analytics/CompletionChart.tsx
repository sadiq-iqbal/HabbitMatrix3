import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import type { HabitStats } from '@/types/types';

interface CompletionChartProps {
    stats: HabitStats[];
}

export default function CompletionChart({ stats }: CompletionChartProps) {
    const data = useMemo(
        () =>
            stats.map((s) => ({
                name: s.habitName.length > 10 ? s.habitName.slice(0, 10) + '…' : s.habitName,
                fullName: s.habitName,
                rate: s.completionRate,
                color: s.color,
            })),
        [stats]
    );

    if (data.length === 0) return null;

    return (
        <div
            className="rounded-2xl p-5 animate-slide-up"
            style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-default)',
            }}
        >
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Completion Rate by Habit
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                        unit="%"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-md)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Completion']}
                        labelFormatter={(label: string) => {
                            const item = data.find((d) => d.name === label);
                            return item?.fullName ?? label;
                        }}
                    />
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
