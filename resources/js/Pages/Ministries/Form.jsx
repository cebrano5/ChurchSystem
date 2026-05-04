import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function MinistryForm({ ministry }) {
    const isEditing = !!ministry;

    const { data, setData, post, put, processing, errors } = useForm({
        name:             ministry?.name || '',
        description:      ministry?.description || '',
        leader_name:      ministry?.leader_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEditing ? put(route('ministries.update', ministry.id)) : post(route('ministries.store'));
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Global Ministry' : 'Define New Ministry'}>
            <Head title={isEditing ? 'Edit Ministry' : 'Add Ministry'} />
            
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Ministry Name</label>
                            <input 
                                id="name" 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. Music Ministry, Youth Group, Women's Guild"
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                required 
                            />
                            <p style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                                This will be the global name used across all conferences and societies.
                            </p>
                            <InputError message={errors.name} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Global Description</label>
                            <textarea 
                                id="description" 
                                className="form-input" 
                                rows="5" 
                                style={{ resize: 'vertical' }}
                                placeholder="Define the primary purpose and objectives of this ministry type..."
                                value={data.description} 
                                onChange={e => setData('description', e.target.value)} 
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="leader_name" className="form-label">Global Ministry Leader</label>
                            <input 
                                id="leader_name" 
                                type="text"
                                className="form-input"
                                placeholder="Enter full name (e.g. Rev. John Smith)"
                                value={data.leader_name}
                                onChange={(e) => setData('leader_name', e.target.value)}
                            />
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                Reference the national head for this ministry type.
                            </p>
                            <InputError message={errors.leader_name} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--navy-border)', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={processing}>
                                {processing ? 'Creating...' : (isEditing ? 'Save Changes' : 'Publish Ministry')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
