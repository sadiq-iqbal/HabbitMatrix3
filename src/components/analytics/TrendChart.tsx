import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { TrendDataPoint } from '@/types/types';
import { formatDateShort } from '@/lib/utils';

interface TrendChartProps {
    data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
    if (data.length === 0) return null;

    // Show max 30 ticks on x-axis
    const tickInterval = Math.max(1, Math.floor(data.length / 15)) - 1;

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
                Daily Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(d: string) => formatDateShort(d)}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                        interval={tickInterval}
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
                        labelFormatter={(d: string) => formatDateShort(d)}
                        formatter={(value: number) => [`${value}%`, 'Completion']}
                    />
                    <Line
                        type="monotone"
                        dataKey="completionRate"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
