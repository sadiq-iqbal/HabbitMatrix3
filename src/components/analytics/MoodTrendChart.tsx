import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { MoodTrendPoint } from '@/types/types';
import { formatDateShort } from '@/lib/utils';

interface MoodTrendChartProps {
    data: MoodTrendPoint[];
}

const MOOD_LABELS: Record<number, string> = {
    1: '😴 Exhausted',
    2: '😔 Low',
    3: '🙂 Okay',
    4: '😊 Good',
    5: '🔥 Amazing',
};

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
    const hasMoodData = data.some((d) => d.mood !== null);
    if (!hasMoodData) return null;

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
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Mood vs. Completion Rate
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Correlate how you feel with how consistent you are
            </p>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(d: string) => formatDateShort(d)}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                        interval={tickInterval}
                    />
                    {/* Left Y axis: completion % */}
                    <YAxis
                        yAxisId="completion"
                        domain={[0, 100]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                        unit="%"
                    />
                    {/* Right Y axis: mood 1-5 */}
                    <YAxis
                        yAxisId="mood"
                        orientation="right"
                        domain={[1, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={false}
                    />
                    <Tooltip
                        content={(props) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const { active, payload, label } = props as any;
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as MoodTrendPoint;
                                return (
                                    <div
                                        className="p-3"
                                        style={{
                                            backgroundColor: 'var(--bg-card)',
                                            border: '1px solid var(--border-default)',
                                            borderRadius: '12px',
                                            boxShadow: 'var(--shadow-md)',
                                            color: 'var(--text-primary)',
                                            fontSize: '12px',
                                            maxWidth: '200px'
                                        }}
                                    >
                                        <p className="font-bold mb-2">{formatDateShort(label)}</p>
                                        <div className="flex justify-between mb-1">
                                            <span style={{ color: '#6366f1' }}>Completion:</span>
                                            <span className="font-semibold">{data.completionRate}%</span>
                                        </div>
                                        {data.mood !== null && (
                                            <div className="flex justify-between mb-1">
                                                <span style={{ color: '#f97316' }}>Mood:</span>
                                                <span className="font-semibold">{MOOD_LABELS[data.mood] ?? data.mood}</span>
                                            </div>
                                        )}
                                        {data.note && (
                                            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="font-semibold block mb-0.5">Note:</span>
                                                    {data.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
                    />
                    <Line
                        yAxisId="completion"
                        type="monotone"
                        dataKey="completionRate"
                        name="Completion %"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                    />
                    <Line
                        yAxisId="mood"
                        type="monotone"
                        dataKey="mood"
                        name="mood"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#f97316', stroke: 'white', strokeWidth: 1 }}
                        activeDot={{ r: 5, fill: '#f97316', stroke: 'white', strokeWidth: 2 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
