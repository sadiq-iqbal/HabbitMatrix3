import { useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';
import Sidebar from '@/components/Sidebar';
import HabitGrid from '@/components/grid/HabitGrid';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function App() {
    const theme = useHabitStore((s) => s.settings.theme);
    const viewMode = useHabitStore((s) => s.viewMode);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

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
