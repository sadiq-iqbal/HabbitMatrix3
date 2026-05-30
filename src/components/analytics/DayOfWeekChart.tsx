import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import type { DayOfWeekData } from '@/types/types';

interface DayOfWeekChartProps {
    data: DayOfWeekData[];
}

export default function DayOfWeekChart({ data }: DayOfWeekChartProps) {
    if (!data || data.every((d) => d.completionRate === 0)) return null;

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
                Performance by Day of Week
            </h3>
            <ResponsiveContainer width="100%" height={260}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="var(--border-default)" />
                    <PolarAngleAxis
                        dataKey="day"
                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}
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
                    />
                    <Radar
                        name="Completion"
                        dataKey="completionRate"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.25}
                        strokeWidth={2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
