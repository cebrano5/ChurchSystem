import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function DistrictsIndex({ districts }) {
    const { delete: destroy } = useForm();
    const user = usePage().props.auth.user;
    const canManage = ['national_admin', 'conference_admin'].includes(user.role);
    const [confirm, setConfirm] = useState(null);

    const handleDelete = () => {
        destroy(route('districts.destroy', confirm.id));
        setConfirm(null);
    };

    return (
        <AuthenticatedLayout header="Districts">
            <Head title="Districts" />

            <ConfirmModal
                show={!!confirm}
                title="Delete District?"
                message={`Deleting "${confirm?.name}" will permanently remove all subordinate societies. This cannot be undone.`}
                confirmLabel="Delete District"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">All Districts</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {districts.length} total records
                    </div>
                </div>
                {canManage && (
                    <Link href={route('districts.create')} className="btn-primary">
                        <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                        Add District
                    </Link>
                )}
            </div>

            <div className="card">
                {!districts?.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <div className="empty-state-text">No districts found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Conference</th>
                                <th>Societies</th>
                                <th>Administrator</th>
                                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {districts.map((d) => (
                                <tr key={d.id} style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        if (e.target.closest('.row-actions')) return;
                                        window.location.href = route('districts.show', d.id);
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                >
                                    <td className="primary-cell" style={{ color: '#fff', fontWeight: 700 }}>{d.name}</td>
                                    <td>{d.annual_conference?.name || '—'}</td>
                                    <td>{d.local_societies_count}</td>
                                    <td>
                                        {d.admins?.[0] ? (
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem' }}>{d.admins[0].name}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>@{d.admins[0].username}</div>
                                            </div>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Not Assigned</span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td style={{ textAlign: 'right' }} className="row-actions">
                                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                <Link href={route('districts.edit', d.id)} className="btn-icon"
                                                    style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                                    onClick={e => e.stopPropagation()}>
                                                    <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit
                                                </Link>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirm({ id: d.id, name: d.name }); }} className="btn-icon"
                                                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
