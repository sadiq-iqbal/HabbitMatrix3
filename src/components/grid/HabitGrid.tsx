import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { getDateRange, formatDateWithDay, isHabitExpectedOnDate } from '@/lib/utils';
import GridCell from './GridCell';
import DateNavigator from './DateNavigator';
import GridHeader from './GridHeader';

export default function HabitGrid() {
    const habits = useHabitStore((s) => s.habits);
    const entries = useHabitStore((s) => s.entries);
    const settings = useHabitStore((s) => s.settings);
    const toggleEntry = useHabitStore((s) => s.toggleEntry);

    const activeHabits = useMemo(
        () => habits.filter((h) => !h.archived),
        [habits]
    );

    const dates = useMemo(
        () => getDateRange(settings.startDate, settings.endDate),
        [settings.startDate, settings.endDate]
    );

    // Build lookup map for fast entry access
    const entryMap = useMemo(() => {
        const map = new Map<string, boolean>();
        for (const entry of entries) {
            if (entry.completed) {
                map.set(`${entry.habitId}:${entry.date}`, true);
            }
        }
        return map;
    }, [entries]);

    // Keyboard navigation state
    const [focusRow, setFocusRow] = useState(0);
    const [focusCol, setFocusCol] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const maxRow = dates.length - 1;
            const maxCol = activeHabits.length - 1;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusRow((r) => Math.min(r + 1, maxRow));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusRow((r) => Math.max(r - 1, 0));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setFocusCol((c) => Math.min(c + 1, maxCol));
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    setFocusCol((c) => Math.max(c - 1, 0));
                    break;
                case ' ':
                case 'Enter': {
                    e.preventDefault();
                    const habit = activeHabits[focusCol];
                    const date = dates[focusRow];
                    if (habit && date) {
                        toggleEntry(habit.id, date);
                    }
                    break;
                }
            }
        },
        [dates, activeHabits, focusCol, focusRow, toggleEntry]
    );

    // Scroll focused cell into view
    useEffect(() => {
        const cell = gridRef.current?.querySelector(`[data-row="${focusRow}"][data-col="${focusCol}"]`);
        cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [focusRow, focusCol]);

    if (activeHabits.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center animate-fade-in">
                    <div
                        className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--check-bg)' }}
                    >
                        <span className="text-3xl">✦</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        No habits yet
                    </h2>
                    <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Click <strong>"Add Habit"</strong> in the sidebar to start tracking your daily habits.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Date Navigator ── */}
            <DateNavigator />

            {/* ── Grid Container ── */}
            <div
                ref={gridRef}
                className="flex-1 overflow-auto focus:outline-none"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <table
                    className="border-collapse w-full"
                    style={{ minWidth: `${activeHabits.length * 56 + 160}px` }}
                >
                    {/* ── Header Row (Habit Names) ── */}
                    <GridHeader habits={activeHabits} focusCol={focusCol} />

                    {/* ── Grid Body ── */}
                    <tbody>
                        {dates.map((date, rowIdx) => {
                            const isToday = date === new Date().toISOString().slice(0, 10);
                            return (
                                <tr
                                    key={date}
                                    className="transition-colors"
                                    style={{
                                        backgroundColor: isToday ? 'var(--check-bg)' : undefined,
                                    }}
                                >
                                    {/* Date Column (Sticky) */}
                                    <td
                                        className="sticky left-0 z-10 px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b border-r"
                                        style={{
                                            backgroundColor: isToday ? 'var(--check-bg)' : 'var(--bg-header)',
                                            borderColor: 'var(--border-default)',
                                            color: isToday ? 'var(--check-color)' : 'var(--text-secondary)',
                                            minWidth: '140px',
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isToday && (
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: 'var(--check-color)' }}
                                                />
                                            )}
                                            {formatDateWithDay(date)}
                                        </div>
                                    </td>

                                    {/* Habit Cells */}
                                    {activeHabits.map((habit, colIdx) => {
                                        const isCompleted = entryMap.get(`${habit.id}:${date}`) ?? false;
                                        const isExpected = isHabitExpectedOnDate(habit, date);
                                        const isFocused = rowIdx === focusRow && colIdx === focusCol;

                                        return (
                                            <GridCell
                                                key={habit.id}
                                                habitId={habit.id}
                                                date={date}
                                                completed={isCompleted}
                                                expected={isExpected}
                                                focused={isFocused}
                                                color={habit.color}
                                                row={rowIdx}
                                                col={colIdx}
                                                onToggle={toggleEntry}
                                            />
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
