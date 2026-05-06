import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import {
    UserIcon, KeyIcon, ShieldCheckIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const ROLE_LABELS = {
    national_admin:   'National Administrator',
    conference_admin: 'Conference Administrator',
    district_admin:   'District Administrator',
    society_admin:    'Society Administrator',
};

function Section({ icon: Icon, title, color, children }) {
    return (
        <div style={{
            background: 'rgba(28, 50, 84, 0.45)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '1.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '1.2rem', color }} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Field({ id, label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
    return (
        <div className="form-group">
            <label htmlFor={id} className="form-label">{label}</label>
            <input
                id={id}
                type={type}
                className="form-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
            <InputError message={error} />
        </div>
    );
}

export default function Settings({ user }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const { data, setData, post, processing, errors, reset } = useForm({
        name:             user.name ?? '',
        username:         user.username ?? '',
        current_password: '',
        password:         '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    const roleLabel = ROLE_LABELS[user.role] ?? user.role;
    const initials  = (user.name ?? 'A').charAt(0).toUpperCase();

    return (
        <AuthenticatedLayout header="Settings">
            <Head title="Settings" />

            <div style={{ maxWidth: '680px', margin: '0 auto' }}>

                {/* Profile Card */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    background: 'linear-gradient(135deg, #0f1e35 0%, #1a3254 100%)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px',
                    padding: '1.75rem', marginBottom: '1.5rem',
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--gold) 0%, #b8860b 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', fontWeight: 900, color: '#000',
                        boxShadow: '0 8px 24px rgba(212,160,23,0.3)',
                    }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>@{user.username}</div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            marginTop: '0.5rem', fontSize: '0.68rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'var(--gold)', background: 'rgba(212,160,23,0.1)',
                            border: '1px solid rgba(212,160,23,0.2)', padding: '0.2rem 0.75rem', borderRadius: '8px',
                        }}>
                            <ShieldCheckIcon style={{ width: '0.75rem' }} />
                            {roleLabel}
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>

                    {/* Profile Info */}
                    <Section icon={UserIcon} title="Profile Information" color="#38bdf8">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Field
                                id="name" label="Full Name"
                                value={data.name} onChange={e => setData('name', e.target.value)}
                                placeholder="Your display name" error={errors.name}
                                autoComplete="name"
                            />
                            <Field
                                id="username" label="Username"
                                value={data.username} onChange={e => setData('username', e.target.value)}
                                placeholder="Your login username" error={errors.username}
                                autoComplete="username"
                            />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            ℹ️ Your <strong style={{ color: '#fff' }}>username</strong> is used to log in to the system. Make sure it is unique.
                        </div>
                    </Section>

                    {/* Change Password */}
                    <Section icon={KeyIcon} title="Change Password" color="#a78bfa">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Field
                                id="current_password" label="Current Password"
                                type="password"
                                value={data.current_password} onChange={e => setData('current_password', e.target.value)}
                                placeholder="Enter your current password" error={errors.current_password}
                                autoComplete="current-password"
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Field
                                    id="password" label="New Password"
                                    type="password"
                                    value={data.password} onChange={e => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters" error={errors.password}
                                    autoComplete="new-password"
                                />
                                <Field
                                    id="password_confirmation" label="Confirm New Password"
                                    type="password"
                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder="Re-enter new password" error={errors.password_confirmation}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                🔒 Leave password fields <strong style={{ color: '#fff' }}>blank</strong> if you do not wish to change your password.
                            </div>
                        </div>
                    </Section>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={processing}
                            style={{ minWidth: '160px', justifyContent: 'center' }}
                        >
                            <Cog6ToothIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                            {processing ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
