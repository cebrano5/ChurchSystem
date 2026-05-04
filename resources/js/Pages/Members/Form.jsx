import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function MembersForm({ member, ministries, societies = [] }) {
    const isEditing = !!member;
    const initialMinistries = member?.ministries?.map(m => m.id) || [];

    const { data, setData, post, put, processing, errors } = useForm({
        local_society_id: member?.local_society_id || (societies.length === 1 ? societies[0].id : ''),
        first_name:   member?.first_name || '',
        last_name:    member?.last_name  || '',
        email:        member?.email      || '',
        phone:        member?.phone      || '',
        status:       member?.status     || 'Active',
        ministry_id:  member?.ministries?.[0]?.id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('members.update', member.id));
        } else {
            post(route('members.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Member' : 'Add Member'}>
            <Head title={isEditing ? 'Edit Member' : 'Add Member'} />

            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit}>
                        {/* Society Selection (for higher admins) */}
                        {societies.length > 1 && (
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label htmlFor="local_society_id" className="form-label">Local Society</label>
                                <select
                                    id="local_society_id"
                                    className="form-select"
                                    value={data.local_society_id}
                                    onChange={e => setData('local_society_id', e.target.value)}
                                    required
                                >
                                    <option value="">— Select Society —</option>
                                    {societies.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.local_society_id} />
                            </div>
                        )}

                        {/* Name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="first_name" className="form-label">First Name</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    className="form-input"
                                    placeholder="John"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.first_name} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name" className="form-label">Last Name</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    className="form-input"
                                    placeholder="Doe"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.last_name} />
                            </div>
                        </div>

                        {/* Contact row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="john@example.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Phone Number</label>
                                <input
                                    id="phone"
                                    type="text"
                                    className="form-input"
                                    placeholder="+63 900 000 0000"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                            <label htmlFor="status" className="form-label">Membership Status</label>
                            <select
                                id="status"
                                className="form-select"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        {/* Ministry Assignment (Single) */}
                        <div style={{
                            borderTop: '1px solid var(--navy-border)',
                            paddingTop: '1.5rem',
                            marginBottom: '1.75rem',
                        }}>
                            <div style={{
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                marginBottom: '1rem',
                            }}>
                                Ministry Assignment
                            </div>

                            <div className="form-group">
                                <select
                                    className="form-select"
                                    value={data.ministry_id}
                                    onChange={(e) => setData('ministry_id', e.target.value)}
                                >
                                    <option value="">— No Ministry —</option>
                                    {ministries.map(ministry => (
                                        <option key={ministry.id} value={ministry.id}>
                                            {ministry.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <InputError message={errors.ministry_id} />
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                            borderTop: '1px solid var(--navy-border)',
                            paddingTop: '1.5rem',
                        }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={processing}
                            >
                                {processing ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Member')}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
