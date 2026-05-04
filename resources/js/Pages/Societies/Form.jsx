import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import MapPicker from '@/Components/MapPicker';

export default function SocietyForm({ society, admin, districts }) {
    const isEditing = !!society;

    const { data, setData, post, put, processing, errors } = useForm({
        district_id: society?.district_id || '',
        name: society?.name || '',
        contact_person: society?.contact_person || '',
        contact_phone: society?.contact_phone || '',
        admin_name: admin?.name || '',
        admin_username: admin?.username || '',
        admin_password: '',
        latitude: society?.latitude || '',
        longitude: society?.longitude || '',
        location_name: society?.location_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEditing ? put(route('societies.update', society.id)) : post(route('societies.store'));
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Local Society' : 'Add Local Society'}>
            <Head title={isEditing ? 'Edit Society' : 'Add Society'} />
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        <div className="form-group">
                            <label htmlFor="district_id" className="form-label">Parent District</label>
                            <select id="district_id" className="form-select"
                                value={data.district_id}
                                onChange={(e) => setData('district_id', e.target.value)} required>
                                <option value="">— Select a District —</option>
                                {districts.map(dist => (
                                    <option key={dist.id} value={dist.id}>
                                        {dist.name}{dist.annual_conference ? ` (${dist.annual_conference.name})` : ''}
                                    </option>
                                ))}
                            </select>
                            {districts.length === 0 && (
                                <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                                    No districts available in your scope.
                                </p>
                            )}
                            <InputError message={errors.district_id} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="soc_name" className="form-label">Society Name (Church Name)</label>
                            <input id="soc_name" type="text" className="form-input" placeholder="e.g. Grace Community Church"
                                value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>


                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="contact_person" className="form-label">Contact Person</label>
                                <input id="contact_person" type="text" className="form-input" placeholder="Lead Pastor Name"
                                    value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} required />
                                <InputError message={errors.contact_person} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_phone" className="form-label">Contact Phone</label>
                                <input id="contact_phone" type="text" className="form-input" placeholder="+63 900 000 0000"
                                    value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} required />
                                <InputError message={errors.contact_phone} />
                            </div>
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
                                Assign or update the primary administrator for this local society.
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
                            <button type="submit" className="btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Society')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
