import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="login-logo">✦</div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.5rem', fontWeight: '800',
                    color: 'var(--text-primary)', marginBottom: '0.35rem',
                }}>
                    Create Account
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Join the Church Admin Portal
                </p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input id="name" type="text" className="form-input" placeholder="John Doe"
                        value={data.name} autoComplete="name" autoFocus
                        onChange={(e) => setData('name', e.target.value)} required />
                    <InputError message={errors.name} />
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input id="email" type="email" className="form-input" placeholder="you@example.com"
                        value={data.email} autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)} required />
                    <InputError message={errors.email} />
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input id="password" type="password" className="form-input" placeholder="••••••••"
                        value={data.password} autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)} required />
                    <InputError message={errors.password} />
                </div>

                <div className="form-group">
                    <label htmlFor="password_confirmation" className="form-label">Confirm Password</label>
                    <input id="password_confirmation" type="password" className="form-input" placeholder="••••••••"
                        value={data.password_confirmation} autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)} required />
                    <InputError message={errors.password_confirmation} />
                </div>

                <button type="submit" className="btn-primary" disabled={processing}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem' }}>
                    {processing ? 'Creating account…' : 'Create Account'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href={route('login')} style={{ color: 'var(--gold-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
