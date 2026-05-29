import { memo, useCallback } from 'react';
import { Check } from 'lucide-react';

interface GridCellProps {
    habitId: string;
    date: string;
    completed: boolean;
    expected: boolean;
    focused: boolean;
    color: string;
    row: number;
    col: number;
    onToggle: (habitId: string, date: string) => void;
}

const GridCell = memo(function GridCell({
    habitId,
    date,
    completed,
    expected,
    focused,
    color,
    row,
    col,
    onToggle,
}: GridCellProps) {
    const handleClick = useCallback(() => {
        if (expected) {
            onToggle(habitId, date);
        }
    }, [habitId, date, expected, onToggle]);

    if (!expected) {
        return (
            <td
                data-row={row}
                data-col={col}
                className="border-b text-center"
                style={{
                    borderColor: 'var(--border-default)',
                    backgroundColor: 'var(--border-subtle)',
                    width: '40px',
                    minWidth: '40px',
                }}
            >
                <div className="w-full h-9 flex items-center justify-center">
                    <span
                        className="w-2 h-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
                    />
                </div>
            </td>
        );
    }

    return (
        <td
            data-row={row}
            data-col={col}
            className="border-b text-center cursor-pointer transition-all duration-150"
            style={{
                borderColor: 'var(--border-default)',
                width: '40px',
                minWidth: '40px',
                outline: focused ? `2px solid var(--border-focus)` : 'none',
                outlineOffset: '-2px',
            }}
            onClick={handleClick}
        >
            <div
                className={`w-full h-9 flex items-center justify-center ${completed ? 'animate-check-pop' : ''}`}
            >
                {completed ? (
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{
                            backgroundColor: color,
                            boxShadow: `0 2px 6px ${color}44`,
                        }}
                    >
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                ) : (
                    <div
                        className="w-6 h-6 rounded-md border-2 transition-all duration-200 hover:scale-110"
                        style={{
                            borderColor: 'var(--border-default)',
                            backgroundColor: 'transparent',
                        }}
                    />
                )}
            </div>
        </td>
    );
});

export default GridCell;
