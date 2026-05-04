import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            {/* Logo */}
            <div className="login-logo">✦</div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem',
                }}>
                    Welcome back
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Sign in to the Church Admin Portal
                </p>
            </div>

            {status && (
                <div className="alert-success" style={{ marginBottom: '1.5rem' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        className="form-input"
                        placeholder="Enter your username"
                        value={data.username}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('username', e.target.value)}
                    />
                    <InputError message={errors.username} />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Remember me
                    </span>
                </label>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={processing}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem' }}
                >
                    {processing ? 'Signing in…' : 'Sign In'}
                </button>
            </form>
        </GuestLayout>
    );
}
