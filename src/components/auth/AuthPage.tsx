import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type Mode = 'login' | 'register';

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login, register, authError, clearAuthError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
        } catch {
            // error shown via authError
        } finally {
            setSubmitting(false);
        }
    };

    const switchMode = (m: Mode) => {
        setMode(m);
        clearAuthError();
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--bg-app)' }}
        >
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'var(--check-bg)' }}
                    >
                        ✦
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        HabitMatrix
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-default)',
                    }}
                >
                    {/* Tab switcher */}
                    <div
                        className="flex rounded-xl p-1 mb-6"
                        style={{ backgroundColor: 'var(--bg-app)' }}
                    >
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                                style={{
                                    backgroundColor: mode === m ? 'var(--bg-card)' : 'transparent',
                                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                                    boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                                }}
                            >
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === 'register' && (
                            <div>
                                <label
                                    className="block text-xs font-medium mb-1.5"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--bg-app)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-default)',
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-app)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-default)',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                className="block text-xs font-medium mb-1.5"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-app)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-default)',
                                }}
                            />
                        </div>

                        {authError && (
                            <p
                                className="text-xs px-3 py-2 rounded-lg"
                                style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                }}
                            >
                                {authError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60"
                            style={{
                                backgroundColor: 'var(--check-color)',
                                color: '#fff',
                            }}
                        >
                            {submitting
                                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                                : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
