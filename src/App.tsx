import { useEffect, useState } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Sidebar';
import HabitGrid from '@/components/grid/HabitGrid';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import AuthPage from '@/components/auth/AuthPage';
import { Menu, Layers } from 'lucide-react';

export default function App() {
    const theme = useHabitStore((s) => s.settings.theme);
    const viewMode = useHabitStore((s) => s.viewMode);
    const loading = useHabitStore((s) => s.loading);
    const error = useHabitStore((s) => s.error);
    const init = useHabitStore((s) => s.init);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { user, authLoading, token, initAuth } = useAuthStore();

    // 1. Check stored JWT on mount
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // 2. Once authenticated, load habit data from server
    useEffect(() => {
        if (user && token) {
            init();
        }
    }, [user, token, init]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // ── Auth loading ──
    if (authLoading) {
        return (
            <div
                className="flex h-screen w-screen items-center justify-center"
                style={{ backgroundColor: 'var(--bg-app)' }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
            </div>
        );
    }

    // ── Not authenticated ──
    if (!user) {
        return <AuthPage />;
    }

    // ── Data loading ──
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
            className="flex h-screen w-screen overflow-hidden flex-col md:flex-row"
            style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
        >
            {/* Mobile Header */}
            <div 
                className="md:hidden flex items-center justify-between p-4 border-b shrink-0" 
                style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-sidebar)' }}
            >
                <div className="flex items-center gap-2.5">
                    <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center" 
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg leading-tight">Habit Matrix</span>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 cursor-pointer">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div 
                className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 overflow-hidden flex flex-col min-w-0 w-full relative">
                {viewMode === 'grid' ? <HabitGrid /> : <AnalyticsDashboard />}
            </main>
        </div>
    );
}
