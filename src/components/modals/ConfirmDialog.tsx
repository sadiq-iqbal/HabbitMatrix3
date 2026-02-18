import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirm',
    destructive = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
                style={{
                    backgroundColor: 'var(--bg-modal)',
                    boxShadow: 'var(--shadow-xl)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3 mb-4">
                    {destructive && (
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                        style={{
                            backgroundColor: destructive ? '#ef4444' : 'var(--check-color)',
                            color: 'white',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
