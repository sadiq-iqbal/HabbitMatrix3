import { useState, useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/habitStore';
import type { Habit, FrequencyConfig } from '@/types/types';
import { X } from 'lucide-react';

interface HabitModalProps {
    habit?: Habit;
    onClose: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitModal({ habit, onClose }: HabitModalProps) {
    const addHabit = useHabitStore((s) => s.addHabit);
    const renameHabit = useHabitStore((s) => s.renameHabit);

    const [name, setName] = useState(habit?.name ?? '');
    const [freqType, setFreqType] = useState<FrequencyConfig['type']>(
        habit?.frequency.type ?? 'daily'
    );
    const [selectedDays, setSelectedDays] = useState<number[]>(
        habit?.frequency.days ?? [1, 2, 3, 4, 5] // default: weekdays
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const frequency: FrequencyConfig = {
            type: freqType,
            ...(freqType !== 'daily' ? { days: selectedDays } : {}),
        };

        if (habit) {
            renameHabit(habit.id, name);
        } else {
            addHabit(name, frequency);
        }

        onClose();
    };

    const toggleDay = (day: number) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6 animate-scale-in"
                style={{
                    backgroundColor: 'var(--bg-modal)',
                    boxShadow: 'var(--shadow-xl)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {habit ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Habit Name
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Read 30 minutes"
                            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                borderColor: 'var(--border-default)',
                                color: 'var(--text-primary)',
                                // @ts-expect-error CSS custom properties
                                '--tw-ring-color': 'var(--border-focus)',
                            }}
                            maxLength={100}
                        />
                    </div>

                    {/* Frequency Type (only for new habits) */}
                    {!habit && (
                        <div className="mb-4">
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Frequency
                            </label>
                            <div className="flex gap-2">
                                {(['daily', 'weekly', 'custom'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFreqType(type)}
                                        className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
                                        style={{
                                            backgroundColor: freqType === type ? 'var(--check-bg)' : 'transparent',
                                            borderColor: freqType === type ? 'var(--check-color)' : 'var(--border-default)',
                                            color: freqType === type ? 'var(--check-color)' : 'var(--text-secondary)',
                                        }}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Day Picker (for weekly/custom) */}
                    {!habit && freqType !== 'daily' && (
                        <div className="mb-5">
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Select Days
                            </label>
                            <div className="flex gap-1.5">
                                {DAY_LABELS.map((label, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleDay(idx)}
                                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: selectedDays.includes(idx)
                                                ? 'var(--check-color)'
                                                : 'var(--bg-app)',
                                            color: selectedDays.includes(idx)
                                                ? 'white'
                                                : 'var(--text-muted)',
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                            style={{
                                backgroundColor: 'var(--bg-app)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            {habit ? 'Save' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
