import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import MapPicker from '@/Components/MapPicker';

function SectionTitle({ children }) {
    return (
        <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '1rem',
        }}>{children}</div>
    );
}

function AdminSection({ isEditing, data, setData, errors }) {
    return (
        <div style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
            <SectionTitle>Administrator Credentials</SectionTitle>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Assign or update the primary administrator for this entity.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label htmlFor="admin_name" className="form-label">Admin Display Name</label>
                    <input id="admin_name" type="text" className="form-input" placeholder="Full name"
                        value={data.admin_name} onChange={e => setData('admin_name', e.target.value)} required />
                    <InputError message={errors.admin_name} />
                </div>
                <div className="form-group">
                    <label htmlFor="admin_username" className="form-label">Login Username</label>
                    <input id="admin_username" type="text" className="form-input" placeholder="username"
                        value={data.admin_username} onChange={e => setData('admin_username', e.target.value)} required />
                    <InputError message={errors.admin_username} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="admin_password" className="form-label">
                        {isEditing ? 'Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input id="admin_password" type="password" className="form-input" placeholder="••••••••"
                        value={data.admin_password} onChange={e => setData('admin_password', e.target.value)}
                        required={!isEditing} />
                    <InputError message={errors.admin_password} />
                </div>
            </div>
        </div>
    );
}

export default function ConferenceForm({ conference }) {
    const isEditing = !!conference;

    const defaultDate = conference?.established_at
        ? new Date(conference.established_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        name: conference?.name || '',
        region: conference?.region || '',
        description: conference?.description || '',
        established_at: defaultDate,
        admin_name: conference?.admins?.[0]?.name || '',
        admin_username: conference?.admins?.[0]?.username || '',
        admin_password: '',
        latitude: conference?.latitude || '',
        longitude: conference?.longitude || '',
        location_name: conference?.location_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEditing ? put(route('conferences.update', conference.id)) : post(route('conferences.store'));
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Annual Conference' : 'Add Annual Conference'}>
            <Head title={isEditing ? 'Edit Conference' : 'Add Conference'} />
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label htmlFor="conf_name" className="form-label">Conference Name</label>
                            <input id="conf_name" type="text" className="form-input" placeholder="e.g. Southern Annual Conference"
                                value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="region" className="form-label">Geographical Region</label>
                                <input id="region" type="text" className="form-input" placeholder="e.g. Luzon"
                                    value={data.region} onChange={e => setData('region', e.target.value)} required />
                                <InputError message={errors.region} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="established_at" className="form-label">Established Date</label>
                                <input id="established_at" type="date" className="form-input"
                                    value={data.established_at} onChange={e => setData('established_at', e.target.value)} required />
                                <InputError message={errors.established_at} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="conf_desc" className="form-label">Description</label>
                            <textarea id="conf_desc" className="form-input" rows="3" style={{ resize: 'vertical' }}
                                value={data.description} onChange={e => setData('description', e.target.value)} />
                            <InputError message={errors.description} />
                        </div>
                        <div className="form-group" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
                            <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gold)' }}>Geographical Location</label>
                            

                            <MapPicker 
                                latitude={data.latitude} 
                                longitude={data.longitude} 
                                locationName={data.location_name}
                                onChange={(lat, lng) => {
                                    setData(d => ({ ...d, latitude: lat, longitude: lng }));
                                }} 
                                onLocationNameChange={(name) => {
                                    setData('location_name', name);
                                }}
                            />
                        </div>
                        <AdminSection isEditing={isEditing} data={data} setData={setData} errors={errors} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => window.history.back()}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Conference')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
