import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, BookOpen } from 'lucide-react';
import { useHabitStore } from '@/store/habitStore';
import type { EnergyLevel } from '@/types/types';

interface JournalModalProps {
    onClose: () => void;
}

const MOOD_OPTIONS = [
    { value: 1, emoji: '😴', label: 'Exhausted' },
    { value: 2, emoji: '😔', label: 'Low' },
    { value: 3, emoji: '🙂', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🔥', label: 'Amazing' },
];

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; color: string }[] = [
    { value: 'low', label: 'Low Energy', color: '#ef4444' },
    { value: 'medium', label: 'Medium', color: '#f97316' },
    { value: 'high', label: 'High Energy', color: '#22c55e' },
];

export default function JournalModal({ onClose }: JournalModalProps) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const journalEntries = useHabitStore((s) => s.journalEntries);
    const saveJournalEntry = useHabitStore((s) => s.saveJournalEntry);

    const existing = journalEntries.find((j) => j.date === today);

    const [mood, setMood] = useState<number>(existing?.mood ?? 3);
    const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(existing?.energyLevel ?? 'medium');
    const [note, setNote] = useState(existing?.note ?? '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (saved) {
            const t = setTimeout(onClose, 700);
            return () => clearTimeout(t);
        }
    }, [saved, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await saveJournalEntry({ date: today, mood, energyLevel, note });
        setSaving(false);
        setSaved(true);
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
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                        >
                            <BookOpen className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                                Today's Check-In
                            </h2>
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {format(new Date(), 'EEEE, MMMM d')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Mood Picker */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            How are you feeling today?
                        </label>
                        <div className="flex gap-2">
                            {MOOD_OPTIONS.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMood(m.value)}
                                    title={m.label}
                                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                                    style={{
                                        borderColor: mood === m.value ? '#6366f1' : 'var(--border-default)',
                                        backgroundColor: mood === m.value ? '#6366f115' : 'transparent',
                                        transform: mood === m.value ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                >
                                    <span className="text-xl">{m.emoji}</span>
                                    <span className="text-[9px] font-medium" style={{ color: mood === m.value ? '#6366f1' : 'var(--text-muted)' }}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Energy Level */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Energy Level
                        </label>
                        <div className="flex gap-2">
                            {ENERGY_OPTIONS.map((e) => (
                                <button
                                    key={e.value}
                                    type="button"
                                    onClick={() => setEnergyLevel(e.value)}
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-2"
                                    style={{
                                        borderColor: energyLevel === e.value ? e.color : 'var(--border-default)',
                                        backgroundColor: energyLevel === e.value ? `${e.color}20` : 'transparent',
                                        color: energyLevel === e.value ? e.color : 'var(--text-secondary)',
                                    }}
                                >
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-5">
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Quick Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What's on your mind? Any obstacles to your habits today?"
                            rows={3}
                            maxLength={400}
                            className="w-full px-3 py-2.5 rounded-xl text-sm border resize-none focus:outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                borderColor: 'var(--border-default)',
                                color: 'var(--text-primary)',
                            }}
                        />
                        <p className="text-right text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{note.length}/400</p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                            style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || saved}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 transition-all"
                            style={{
                                background: saved
                                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                            }}
                        >
                            {saved ? '✓ Saved!' : saving ? 'Saving…' : existing ? 'Update Entry' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
