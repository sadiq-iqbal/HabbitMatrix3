import { useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';
import Sidebar from '@/components/Sidebar';
import HabitGrid from '@/components/grid/HabitGrid';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function App() {
    const theme = useHabitStore((s) => s.settings.theme);
    const viewMode = useHabitStore((s) => s.viewMode);
    const loading = useHabitStore((s) => s.loading);
    const error = useHabitStore((s) => s.error);
    const init = useHabitStore((s) => s.init);

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    if (loading) {
        return (
            <div
                className="flex h-screen w-screen items-center justify-center"
                style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <span className="text-sm opacity-60">Loading habits…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex h-screen w-screen items-center justify-center"
                style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="text-2xl">⚠️</span>
                    <p className="font-medium">Cannot reach the server</p>
                    <p className="text-sm opacity-60">Make sure the backend is running on port 3001</p>
                    <button
                        onClick={() => init()}
                        className="mt-2 rounded-md bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex h-screen w-screen overflow-hidden"
            style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
        >
            <Sidebar />
            <main className="flex-1 overflow-hidden flex flex-col">
                {viewMode === 'grid' ? <HabitGrid /> : <AnalyticsDashboard />}
            </main>
        </div>
    );
}
