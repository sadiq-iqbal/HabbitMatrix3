interface StatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
}

export default function StatCard({ label, value, subtitle, icon, color }: StatCardProps) {
    return (
        <div
            className="rounded-2xl p-4 animate-slide-up"
            style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-default)',
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <span style={{ color }}>{icon}</span>
                </div>
            </div>
            <div
                className="text-2xl font-extrabold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
            >
                {value}
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {label}
            </div>
            {subtitle && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}
