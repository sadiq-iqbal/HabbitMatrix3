import { useState } from 'react';
import type { Habit } from '@/types/types';
import { useHabitStore } from '@/store/habitStore';
import HabitModal from '@/components/modals/HabitModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { MoreVertical, Pencil, Trash2, Archive } from 'lucide-react';
import { formatDateCompact } from '@/lib/utils';


/**
 * Renders the date header row (top) for the transposed grid.
 * Dates are displayed as columns, habits as rows.
 */
export function DateHeaderRow({ dates, focusCol }: { dates: string[]; focusCol: number }) {
    return (
        <thead>
            <tr>
                {/* Corner cell */}
                <th
                    className="sticky top-0 left-0 z-20 px-3 py-2 text-xs font-semibold text-left border-b border-r"
                    style={{
                        backgroundColor: 'var(--bg-header)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-muted)',
                        minWidth: '160px',
                        width: '160px',
                    }}
                >
                    Habit
                </th>

                {/* Date column headers */}
                {dates.map((date, idx) => {
                    const { day, weekday } = formatDateCompact(date);
                    const isToday = date === new Date().toISOString().slice(0, 10);
                    const isFocused = idx === focusCol;
                    return (
                        <th
                            key={date}
                            className="sticky top-0 z-10 px-0.5 py-2 border-b text-center"
                            style={{
                                backgroundColor: isToday
                                    ? 'var(--check-bg)'
                                    : isFocused
                                        ? 'var(--check-bg)'
                                        : 'var(--bg-header)',
                                borderColor: 'var(--border-default)',
                            }}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <span
                                    className="text-[9px] font-medium leading-none uppercase"
                                    style={{ color: isToday ? 'var(--check-color)' : 'var(--text-muted)' }}
                                >
                                    {weekday}
                                </span>
                                <span
                                    className="text-xs font-bold leading-none"
                                    style={{ color: isToday ? 'var(--check-color)' : 'var(--text-secondary)' }}
                                >
                                    {day}
                                </span>
                                {isToday && (
                                    <span
                                        className="w-1 h-1 rounded-full"
                                        style={{ backgroundColor: 'var(--check-color)' }}
                                    />
                                )}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}

/**
 * Renders a habit row header cell (first column of each habit row).
 * Includes the context menu for edit/archive/delete.
 */
export default function HabitRowHeader({ habit, isFocused }: { habit: Habit; isFocused: boolean }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

    const deleteHabit = useHabitStore((s) => s.deleteHabit);
    const archiveHabit = useHabitStore((s) => s.archiveHabit);

    return (
        <>
            <td
                className="sticky left-0 z-10 px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b border-r"
                style={{
                    backgroundColor: isFocused ? 'var(--check-bg)' : 'var(--bg-header)',
                    borderColor: 'var(--border-default)',
                    color: isFocused ? 'var(--check-color)' : 'var(--text-secondary)',
                    minWidth: '160px',
                    width: '160px',
                }}
            >
                <div className="flex items-center gap-2 relative">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color }}
                    />
                    <span className="truncate max-w-[100px]" title={habit.name}>
                        {habit.name}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="p-0.5 rounded opacity-40 hover:opacity-100 transition-opacity cursor-pointer ml-auto"
                    >
                        <MoreVertical className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    </button>

                    {/* Context Menu */}
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                            <div
                                className="absolute left-full top-0 ml-1 z-40 rounded-xl py-1 w-36 animate-scale-in"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid var(--border-default)',
                                }}
                            >
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setEditingHabit(habit);
                                    }}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Rename
                                </button>
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onClick={() => {
                                        archiveHabit(habit.id);
                                        setMenuOpen(false);
                                    }}
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                    Archive
                                </button>
                                <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setDeletingHabit(habit);
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>

            {/* ── Modals ── */}
            {editingHabit && (
                <HabitModal
                    habit={editingHabit}
                    onClose={() => setEditingHabit(null)}
                />
            )}
            {deletingHabit && (
                <ConfirmDialog
                    title="Delete Habit"
                    message={`Are you sure you want to delete "${deletingHabit.name}"? This will also remove all related entries. This action cannot be undone.`}
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => {
                        deleteHabit(deletingHabit.id);
                        setDeletingHabit(null);
                    }}
                    onCancel={() => setDeletingHabit(null)}
                />
            )}
        </>
    );
}
