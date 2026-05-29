import { useState } from 'react';
import { useHabitStore } from '@/store/habitStore';
import { useAuthStore } from '@/store/authStore';
import { exportAsJSON, exportAsCSV } from '@/lib/storage';
import { entriesToCSV } from '@/lib/utils';
import HabitModal from '@/components/modals/HabitModal';
import ImportExportModal from '@/components/modals/ImportExportModal';
import {
    LayoutGrid,
    BarChart3,
    Plus,
    Sun,
    Moon,
    Download,
    Upload,
    Layers,
    LogOut,
} from 'lucide-react';

export default function Sidebar() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const { user, logout } = useAuthStore();
    const viewMode = useHabitStore((s) => s.viewMode);
    const setViewMode = useHabitStore((s) => s.setViewMode);
    const theme = useHabitStore((s) => s.settings.theme);
    const setTheme = useHabitStore((s) => s.setTheme);
    const habits = useHabitStore((s) => s.habits);
    const entries = useHabitStore((s) => s.entries);
    const settings = useHabitStore((s) => s.settings);

    const activeCount = habits.filter((h) => !h.archived).length;
    const archivedCount = habits.filter((h) => h.archived).length;

    const handleExportJSON = () => {
        exportAsJSON({ version: 1, habits, entries, settings });
    };

    const handleExportCSV = () => {
        const csv = entriesToCSV(habits, entries);
        exportAsCSV(csv);
    };

    return (
        <>
            <aside
                className="w-64 flex flex-col border-r shrink-0 animate-fade-in"
                style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-default)',
                }}
            >
                {/* ── Logo ── */}
                <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            }}
                        >
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                Habit Matrix
                            </h1>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Track · Analyze · Grow
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 p-3 flex flex-col gap-1">
                    <button
                        id="nav-grid"
                        onClick={() => setViewMode('grid')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                        style={{
                            backgroundColor: viewMode === 'grid' ? 'var(--check-bg)' : 'transparent',
                            color: viewMode === 'grid' ? 'var(--check-color)' : 'var(--text-secondary)',
                        }}
                    >
                        <LayoutGrid className="w-4.5 h-4.5" />
                        <span>Habit Grid</span>
                        {activeCount > 0 && (
                            <span
                                className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                    backgroundColor: viewMode === 'grid' ? 'var(--check-color)' : 'var(--border-default)',
                                    color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                                }}
                            >
                                {activeCount}
                            </span>
                        )}
                    </button>

                    <button
                        id="nav-analytics"
                        onClick={() => setViewMode('analytics')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                        style={{
                            backgroundColor: viewMode === 'analytics' ? 'var(--check-bg)' : 'transparent',
                            color: viewMode === 'analytics' ? 'var(--check-color)' : 'var(--text-secondary)',
                        }}
                    >
                        <BarChart3 className="w-4.5 h-4.5" />
                        <span>Analytics</span>
                    </button>

                    {/* ── Add Habit Button ── */}
                    <button
                        id="add-habit-btn"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Add Habit</span>
                    </button>

                    {/* ── Stats Summary ── */}
                    <div
                        className="mt-4 p-3 rounded-xl text-xs"
                        style={{
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <div className="flex justify-between mb-1.5">
                            <span>Active habits</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Archived</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{archivedCount}</span>
                        </div>
                    </div>
                </nav>

                {/* ── Bottom Actions ── */}
                <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border-default)' }}>
                    {/* Export/Import */}
                    <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export JSON</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Import Data</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        id="theme-toggle"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-1 cursor-pointer"
                        style={{
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="w-4 h-4" />
                                <span>Dark Mode</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-4 h-4" />
                                <span>Light Mode</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* ── Modals ── */}
            {showAddModal && (
                <HabitModal onClose={() => setShowAddModal(false)} />
            )}
            {showImportModal && (
                <ImportExportModal onClose={() => setShowImportModal(false)} />
            )}
        </>
    );
}
