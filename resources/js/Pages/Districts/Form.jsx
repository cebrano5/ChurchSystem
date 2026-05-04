import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import MapPicker from '@/Components/MapPicker';

export default function DistrictForm({ district, admin, conferences }) {
    const isEditing = !!district;

    const { data, setData, post, put, processing, errors, isDirty } = useForm({
        annual_conference_id: district?.annual_conference_id || '',
        name: district?.name || '',
        description: district?.description || '',
        admin_name: admin?.name || '',
        admin_username: admin?.username || '',
        admin_password: '',
        latitude: district?.latitude || '',
        longitude: district?.longitude || '',
        location_name: district?.location_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEditing ? put(route('districts.update', district.id)) : post(route('districts.store'));
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit District' : 'Add District'}>
            <Head title={isEditing ? 'Edit District' : 'Add District'} />
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <div className="form-group">
                            <label htmlFor="annual_conference_id" className="form-label">Parent Annual Conference</label>
                            <select id="annual_conference_id" className="form-select"
                                value={data.annual_conference_id}
                                onChange={(e) => setData('annual_conference_id', e.target.value)} required>
                                <option value="">— Select a Conference —</option>
                                {conferences.map(conf => (
                                    <option key={conf.id} value={conf.id}>{conf.name}</option>
                                ))}
                            </select>
                            {conferences.length === 0 && (
                                <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                                    No conferences available in your scope.
                                </p>
                            )}
                            <InputError message={errors.annual_conference_id} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dist_name" className="form-label">District Name</label>
                            <input id="dist_name" type="text" className="form-input" placeholder="e.g. Northern District"
                                value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dist_desc" className="form-label">Description</label>
                            <textarea id="dist_desc" className="form-input" rows="3" style={{ resize: 'vertical' }}
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
                        {/* Admin section */}
                        <div style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                Administrator Credentials
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                Assign or update the primary administrator for this district.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label htmlFor="admin_name" className="form-label">Admin Display Name</label>
                                    <input id="admin_name" type="text" className="form-input" value={data.admin_name}
                                        onChange={e => setData('admin_name', e.target.value)} required />
                                    <InputError message={errors.admin_name} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="admin_username" className="form-label">Login Username</label>
                                    <input id="admin_username" type="text" className="form-input" value={data.admin_username}
                                        onChange={e => setData('admin_username', e.target.value)} required />
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

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => window.history.back()}>Cancel</button>
                            <button type="submit" className={`btn-primary ${isDirty ? 'btn-bright' : ''}`} disabled={processing}>
                                {processing ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create District')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
