import { useHabitStore } from '@/store/habitStore';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

export default function DateNavigator() {
    const settings = useHabitStore((s) => s.settings);
    const setDateRange = useHabitStore((s) => s.setDateRange);

    const rangeLength =
        Math.ceil(
            (parseISO(settings.endDate).getTime() - parseISO(settings.startDate).getTime()) /
            86400000
        ) + 1;

    const handlePrev = () => {
        const newStart = format(subDays(parseISO(settings.startDate), rangeLength), 'yyyy-MM-dd');
        const newEnd = format(subDays(parseISO(settings.endDate), rangeLength), 'yyyy-MM-dd');
        setDateRange(newStart, newEnd);
    };

    const handleNext = () => {
        const newStart = format(addDays(parseISO(settings.startDate), rangeLength), 'yyyy-MM-dd');
        const newEnd = format(addDays(parseISO(settings.endDate), rangeLength), 'yyyy-MM-dd');
        setDateRange(newStart, newEnd);
    };

    const handleToday = () => {
        const today = new Date();
        const newStart = format(today, 'yyyy-MM-dd');
        const newEnd = format(addDays(today, rangeLength - 1), 'yyyy-MM-dd');
        setDateRange(newStart, newEnd);
    };

    return (
        <div
            className="flex items-center justify-between px-5 py-3 border-b shrink-0"
            style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-default)',
            }}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm font-semibold px-2" style={{ color: 'var(--text-primary)' }}>
                    {formatDateShort(settings.startDate)} — {formatDateShort(settings.endDate)}
                </span>

                <button
                    onClick={handleNext}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <button
                onClick={handleToday}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
                style={{
                    backgroundColor: 'var(--check-bg)',
                    color: 'var(--check-color)',
                }}
            >
                <Calendar className="w-3.5 h-3.5" />
                Today
            </button>
        </div>
    );
}
