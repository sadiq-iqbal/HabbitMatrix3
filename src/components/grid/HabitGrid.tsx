import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useHabitStore } from '@/store/habitStore';
import { getDateRange, isHabitExpectedOnDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import GridCell from './GridCell';
import DateNavigator from './DateNavigator';
import HabitRowHeader, { DateHeaderRow } from './GridHeader';
import HabitModal from '@/components/modals/HabitModal';

export default function HabitGrid() {
    const today = format(new Date(), 'yyyy-MM-dd');
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

    // Keyboard navigation state — now row = habit index, col = date index
    const [focusRow, setFocusRow] = useState(0);
    const [focusCol, setFocusCol] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const maxRow = activeHabits.length - 1;
            const maxCol = dates.length - 1;

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
                    const habit = activeHabits[focusRow];
                    const date = dates[focusCol];
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
                    className="border-collapse w-max min-w-full"
                    style={{ tableLayout: 'fixed' }}
                >
                    {/* ── Date Header Row (dates as columns) ── */}
                    <DateHeaderRow dates={dates} focusCol={focusCol} />

                    {/* ── Grid Body (habits as rows) ── */}
                    <tbody>
                        {activeHabits.map((habit, rowIdx) => (
                            <tr key={habit.id} className="transition-colors">
                                {/* Habit Name (Sticky Left Column) */}
                                <HabitRowHeader
                                    habit={habit}
                                    isFocused={rowIdx === focusRow}
                                />

                                {/* Date Cells for this habit */}
                                {dates.map((date, colIdx) => {
                                    const isCompleted = entryMap.get(`${habit.id}:${date}`) ?? false;
                                    const isExpected = isHabitExpectedOnDate(habit, date);
                                    const isFocused = rowIdx === focusRow && colIdx === focusCol;

                                    return (
                                        <GridCell
                                            key={date}
                                            habitId={habit.id}
                                            date={date}
                                            completed={isCompleted}
                                            expected={isExpected}
                                            focused={isFocused}
                                            disabled={date !== today}
                                            color={habit.color}
                                            row={rowIdx}
                                            col={colIdx}
                                            onToggle={toggleEntry}
                                        />
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile FAB ── */}
            <button
                onClick={() => setShowAddModal(true)}
                className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all z-40"
            >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {/* ── Add Habit Modal ── */}
            {showAddModal && <HabitModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
