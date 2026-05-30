import { Sparkles, AlertTriangle, Info } from 'lucide-react';
import type { Insight } from '@/types/types';

interface InsightsPanelProps {
    insights: Insight[];
}

const CONFIG = {
    positive: {
        icon: Sparkles,
        bg: '#22c55e12',
        border: '#22c55e40',
        iconColor: '#22c55e',
        textColor: '#16a34a',
    },
    warning: {
        icon: AlertTriangle,
        bg: '#f9731612',
        border: '#f9731640',
        iconColor: '#f97316',
        textColor: '#c2410c',
    },
    neutral: {
        icon: Info,
        bg: '#6366f112',
        border: '#6366f140',
        iconColor: '#6366f1',
        textColor: '#4f46e5',
    },
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
    if (insights.length === 0) return null;

    return (
        <div
            className="rounded-2xl p-5 animate-slide-up mb-6"
            style={{
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-default)',
            }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" style={{ color: '#6366f1' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Smart Insights
                </h3>
            </div>

            <div className="flex flex-col gap-2.5">
                {insights.map((insight) => {
                    const cfg = CONFIG[insight.type];
                    const Icon = cfg.icon;
                    return (
                        <div
                            key={insight.id}
                            className="flex items-start gap-3 rounded-xl px-4 py-3"
                            style={{
                                backgroundColor: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                            }}
                        >
                            <Icon
                                className="w-4 h-4 mt-0.5 shrink-0"
                                style={{ color: cfg.iconColor }}
                            />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {insight.message}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
