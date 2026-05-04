import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function SocietiesIndex({ societies }) {
    const { delete: destroy } = useForm();
    const user = usePage().props.auth.user;
    const canManage = ['national_admin', 'conference_admin', 'district_admin'].includes(user.role);
    const [confirm, setConfirm] = useState(null);

    const handleDelete = () => {
        destroy(route('societies.destroy', confirm.id));
        setConfirm(null);
    };

    return (
        <AuthenticatedLayout header="Local Societies">
            <Head title="Societies" />

            <ConfirmModal
                show={!!confirm}
                title="Delete Local Society?"
                message={`Deleting "${confirm?.name}" will permanently remove all subordinate members. This cannot be undone.`}
                confirmLabel="Delete Society"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">All Societies</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {societies.length} total records
                    </div>
                </div>
                {canManage && (
                    <Link href={route('societies.create')} className="btn-primary">
                        <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                        Add Society
                    </Link>
                )}
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                {!societies?.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏠</div>
                        <div className="empty-state-text">No societies found.</div>
                    </div>
                ) : (
                    <table className="data-table" style={{ minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>District</th>
                                <th>Conference</th>
                                <th>Contact</th>
                                <th>Members</th>
                                <th>Administrator</th>
                                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {societies.map((s) => (
                                <tr key={s.id} style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={(e) => {
                                        // Don't trigger if clicking action buttons
                                        if (e.target.closest('.row-actions')) return;
                                        window.location.href = route('societies.show', s.id);
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                >
                                    <td className="primary-cell" style={{ color: '#fff', fontWeight: 700 }}>{s.name}</td>
                                    <td>{s.district?.name || '—'}</td>
                                    <td>{s.district?.annual_conference?.name || '—'}</td>
                                    <td>
                                        <div style={{ fontSize: '0.82rem' }}>{s.contact_person}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{s.contact_phone}</div>
                                    </td>
                                    <td>{s.members_count}</td>
                                    <td>
                                        {s.admins?.[0] ? (
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem' }}>{s.admins[0].name}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>@{s.admins[0].username}</div>
                                            </div>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Not Assigned</span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td style={{ textAlign: 'right' }} className="row-actions">
                                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                <Link href={route('societies.edit', s.id)} className="btn-icon"
                                                    style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                                    onClick={e => e.stopPropagation()}>
                                                    <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit
                                                </Link>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirm({ id: s.id, name: s.name }); }} className="btn-icon"
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
