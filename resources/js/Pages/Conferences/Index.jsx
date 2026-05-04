import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function ConferencesIndex({ conferences }) {
    const { delete: destroy } = useForm();
    const [confirm, setConfirm] = useState(null);

    const handleDelete = () => {
        destroy(route('conferences.destroy', confirm.id));
        setConfirm(null);
    };

    return (
        <AuthenticatedLayout header="Annual Conferences">
            <Head title="Conferences" />

            <ConfirmModal
                show={!!confirm}
                title="Delete Annual Conference?"
                message={`Deleting "${confirm?.name}" will permanently remove all subordinate districts and societies. This cannot be undone.`}
                confirmLabel="Delete Conference"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">All Conferences</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {conferences.length} total records
                    </div>
                </div>
                <Link href={route('conferences.create')} className="btn-primary">
                    <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                    Add Conference
                </Link>
            </div>

            <div className="card">
                {!conferences?.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏛️</div>
                        <div className="empty-state-text">No conferences found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Region</th>
                                <th>Districts</th>
                                <th>Administrator</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conferences.map((c) => (
                                <tr key={c.id} style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        if (e.target.closest('.row-actions')) return;
                                        window.location.href = route('conferences.show', c.id);
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                >
                                    <td className="primary-cell" style={{ color: '#fff', fontWeight: 700 }}>{c.name}</td>
                                    <td>{c.region}</td>
                                    <td>{c.districts_count}</td>
                                    <td>
                                        {c.admins?.[0] ? (
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem' }}>{c.admins[0].name}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>@{c.admins[0].username}</div>
                                            </div>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Not Assigned</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }} className="row-actions">
                                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                            <Link href={route('conferences.edit', c.id)} className="btn-icon"
                                                style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                                onClick={e => e.stopPropagation()}>
                                                <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit
                                            </Link>
                                            <button onClick={(e) => { e.stopPropagation(); setConfirm({ id: c.id, name: c.name }); }} className="btn-icon"
                                                style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
