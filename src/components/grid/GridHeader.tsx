import { useState } from 'react';
import type { Habit } from '@/types/types';
import { useHabitStore } from '@/store/habitStore';
import HabitModal from '@/components/modals/HabitModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { MoreVertical, Pencil, Trash2, Archive } from 'lucide-react';

interface GridHeaderProps {
    habits: Habit[];
    focusCol: number;
}

export default function GridHeader({ habits, focusCol }: GridHeaderProps) {
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

    const deleteHabit = useHabitStore((s) => s.deleteHabit);
    const archiveHabit = useHabitStore((s) => s.archiveHabit);

    return (
        <>
            <thead>
                <tr>
                    {/* Corner cell */}
                    <th
                        className="sticky top-0 left-0 z-20 px-3 py-3 text-xs font-semibold text-left border-b border-r"
                        style={{
                            backgroundColor: 'var(--bg-header)',
                            borderColor: 'var(--border-default)',
                            color: 'var(--text-muted)',
                            minWidth: '140px',
                        }}
                    >
                        Date
                    </th>

                    {/* Habit name headers */}
                    {habits.map((habit, idx) => (
                        <th
                            key={habit.id}
                            className="sticky top-0 z-10 px-1 py-3 border-b text-center relative"
                            style={{
                                backgroundColor: idx === focusCol ? 'var(--check-bg)' : 'var(--bg-header)',
                                borderColor: 'var(--border-default)',
                                width: '56px',
                                minWidth: '56px',
                            }}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: habit.color }}
                                />
                                <span
                                    className="text-[10px] font-semibold leading-tight max-w-[52px] truncate block"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title={habit.name}
                                >
                                    {habit.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(menuOpen === habit.id ? null : habit.id);
                                    }}
                                    className="p-0.5 rounded opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <MoreVertical className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>

                            {/* Context Menu */}
                            {menuOpen === habit.id && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(null)} />
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 rounded-xl py-1 w-36 animate-scale-in"
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
                                                setMenuOpen(null);
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
                                                setMenuOpen(null);
                                            }}
                                        >
                                            <Archive className="w-3.5 h-3.5" />
                                            Archive
                                        </button>
                                        <button
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setMenuOpen(null);
                                                setDeletingHabit(habit);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>

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
