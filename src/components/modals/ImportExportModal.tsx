import { useState, useRef } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { importDataSchema } from '@/lib/schemas';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportExportModalProps {
    onClose: () => void;
}

export default function ImportExportModal({ onClose }: ImportExportModalProps) {
    const importData = useHabitStore((s) => s.importData);

    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [preview, setPreview] = useState<{ habits: number; entries: number } | null>(null);
    const [pendingData, setPendingData] = useState<ReturnType<typeof importDataSchema.parse> | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed: unknown = JSON.parse(text);
            const result = importDataSchema.safeParse(parsed);

            if (!result.success) {
                setStatus('error');
                setErrorMsg(
                    `Invalid data format: ${result.error.issues.map((i) => i.message).join(', ')}`
                );
                return;
            }

            setPreview({
                habits: result.data.habits.length,
                entries: result.data.entries.length,
            });
            setPendingData(result.data);
            setStatus('idle');
            setErrorMsg('');
        } catch {
            setStatus('error');
            setErrorMsg('Failed to parse file. Please upload a valid JSON file.');
        }
    };

    const handleImport = () => {
        if (!pendingData) return;
        importData(pendingData.habits, pendingData.entries, pendingData.settings);
        setStatus('success');
        setTimeout(onClose, 1200);
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
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        Import Data
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* File Upload Area */}
                <div
                    className="border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors"
                    style={{
                        borderColor: 'var(--border-default)',
                        backgroundColor: 'var(--bg-app)',
                    }}
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Click to select a JSON file
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Upload a previously exported Habit Matrix file
                    </p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Error */}
                {status === 'error' && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                    </div>
                )}

                {/* Success */}
                {status === 'success' && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-4">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-xs text-green-600 dark:text-green-400">Data imported successfully!</p>
                    </div>
                )}

                {/* Preview */}
                {preview && status === 'idle' && (
                    <div
                        className="p-3 rounded-xl mb-4"
                        style={{ backgroundColor: 'var(--bg-app)' }}
                    >
                        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Preview
                        </p>
                        <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>
                                <strong style={{ color: 'var(--text-primary)' }}>{preview.habits}</strong> habits
                            </span>
                            <span>
                                <strong style={{ color: 'var(--text-primary)' }}>{preview.entries}</strong> entries
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Cancel
                    </button>
                    {pendingData && status === 'idle' && (
                        <button
                            onClick={handleImport}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            Import Data
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
