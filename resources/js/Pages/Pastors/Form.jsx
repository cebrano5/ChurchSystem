import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function PastorsForm({ pastor }) {
    const isEditing = !!pastor;

    const { data, setData, post, put, processing, errors } = useForm({
        full_name:        pastor?.full_name        || '',
        email:            pastor?.email            || '',
        phone:            pastor?.phone            || '',
        role_or_position: pastor?.role_or_position || '',
        status:           pastor?.status           || 'Active',
        assigned_at:      pastor?.assigned_at      ? new Date(pastor.assigned_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes:            pastor?.notes            || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('pastors.update', pastor.id));
        } else {
            post(route('pastors.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Pastor' : 'Add Pastor'}>
            <Head title={isEditing ? 'Edit Pastor' : 'Add Pastor'} />

            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit}>
                        
                        {/* Name and Role row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="full_name" className="form-label">Full Name</label>
                                <input
                                    id="full_name"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. John Doe"
                                    value={data.full_name}
                                    onChange={e => setData('full_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.full_name} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role_or_position" className="form-label">Role / Position</label>
                                <input
                                    id="role_or_position"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Senior Pastor"
                                    value={data.role_or_position}
                                    onChange={e => setData('role_or_position', e.target.value)}
                                    required
                                />
                                <InputError message={errors.role_or_position} />
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
                                    placeholder="pastor@example.com"
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

                        {/* Status and Assigned At row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="status" className="form-label">Status</label>
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
                            <div className="form-group">
                                <label htmlFor="assigned_at" className="form-label">Date Assigned</label>
                                <input
                                    id="assigned_at"
                                    type="date"
                                    className="form-input"
                                    value={data.assigned_at}
                                    onChange={e => setData('assigned_at', e.target.value)}
                                    required
                                />
                                <InputError message={errors.assigned_at} />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                            <label htmlFor="notes" className="form-label">Notes / Additional Information</label>
                            <textarea
                                id="notes"
                                className="form-input"
                                rows="3"
                                placeholder="Any additional details..."
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            />
                            <InputError message={errors.notes} />
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
                                {processing ? 'Saving…' : (isEditing ? 'Save Changes' : 'Add Pastor')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
