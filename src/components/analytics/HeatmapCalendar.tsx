import { useMemo } from 'react';
import { getDay, getWeek, parseISO, format } from 'date-fns';
import type { HeatmapDay } from '@/types/types';

interface HeatmapCalendarProps {
    data: HeatmapDay[];
    year: number;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INTENSITY_COLORS_LIGHT = [
    '#ebedf0',
    '#c6e48b',
    '#7bc96f',
    '#239a3b',
    '#196127',
];

const INTENSITY_COLORS_DARK = [
    '#161b22',
    '#0e4429',
    '#006d32',
    '#26a641',
    '#39d353',
];

export default function HeatmapCalendar({ data, year }: HeatmapCalendarProps) {
    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? INTENSITY_COLORS_DARK : INTENSITY_COLORS_LIGHT;

    // Group days into weeks
    const weeks = useMemo(() => {
        const weekMap = new Map<number, HeatmapDay[]>();

        for (const day of data) {
            const date = parseISO(day.date);
            const weekNum = getWeek(date, { weekStartsOn: 0 });
            const yearWeek = parseInt(format(date, 'MM')) * 100 + weekNum;
            if (!weekMap.has(yearWeek)) {
                weekMap.set(yearWeek, []);
            }
            weekMap.get(yearWeek)!.push(day);
        }

        // Convert to sorted array of weeks
        const sorted: HeatmapDay[][] = [];
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        let currentWeek: HeatmapDay[] = [];
        let lastWeekIndex = -1;

        for (const day of data) {
            const date = parseISO(day.date);
            if (date < startDate || date > endDate) continue;

            const weekIndex = Math.floor(
                (date.getTime() - startDate.getTime() + startDate.getDay() * 86400000) /
                (7 * 86400000)
            );

            if (weekIndex !== lastWeekIndex) {
                if (currentWeek.length > 0) sorted.push(currentWeek);
                currentWeek = [];
                lastWeekIndex = weekIndex;
            }
            currentWeek.push(day);
        }
        if (currentWeek.length > 0) sorted.push(currentWeek);

        return sorted;
    }, [data, year]);

    // Month label positions
    const monthPositions = useMemo(() => {
        const positions: { label: string; x: number }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIdx) => {
            const firstDay = week[0];
            if (firstDay) {
                const month = parseISO(firstDay.date).getMonth();
                if (month !== lastMonth) {
                    positions.push({ label: MONTH_LABELS[month] ?? '', x: weekIdx });
                    lastMonth = month;
                }
            }
        });

        return positions;
    }, [weeks]);

    const cellSize = 12;
    const cellGap = 2;
    const totalSize = cellSize + cellGap;
    const labelOffset = 28;
    const topOffset = 20;

    return (
        <div
            className="rounded-2xl p-5 animate-slide-up overflow-x-auto"
            style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-default)',
            }}
        >
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Activity Heatmap — {year}
            </h3>

            <svg
                width={labelOffset + weeks.length * totalSize + 20}
                height={topOffset + 7 * totalSize + 10}
                className="block"
            >
                {/* Month labels */}
                {monthPositions.map((m, i) => (
                    <text
                        key={i}
                        x={labelOffset + m.x * totalSize}
                        y={12}
                        fontSize={10}
                        fill="var(--text-muted)"
                    >
                        {m.label}
                    </text>
                ))}

                {/* Day labels */}
                {DAY_LABELS.map((label, i) => (
                    <text
                        key={i}
                        x={0}
                        y={topOffset + i * totalSize + cellSize - 1}
                        fontSize={9}
                        fill="var(--text-muted)"
                    >
                        {label}
                    </text>
                ))}

                {/* Cells */}
                {weeks.map((week, weekIdx) =>
                    week.map((day) => {
                        const dayOfWeek = getDay(parseISO(day.date));
                        const colorIdx = Math.min(day.count, 4);
                        return (
                            <rect
                                key={day.date}
                                x={labelOffset + weekIdx * totalSize}
                                y={topOffset + dayOfWeek * totalSize}
                                width={cellSize}
                                height={cellSize}
                                rx={2}
                                ry={2}
                                fill={colors[colorIdx]}
                                className="transition-colors duration-150"
                            >
                                <title>{`${day.date}: ${day.count > 0 ? day.count + ' activities' : 'No activity'}`}</title>
                            </rect>
                        );
                    })
                )}
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Less</span>
                {colors.map((color, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                    />
                ))}
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>More</span>
            </div>
        </div>
    );
}
