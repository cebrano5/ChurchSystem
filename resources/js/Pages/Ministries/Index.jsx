import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function MinistriesIndex({ ministries, canManage }) {
    const { delete: destroy } = useForm();
    const [confirm, setConfirm] = useState(null); // { id, name }

    const handleDelete = () => {
        destroy(route('ministries.destroy', confirm.id));
        setConfirm(null);
    };

    const data = ministries.map(m => ({
        id:           m.id,
        name:         m.name,
        description:  m.description,
        memberCount:  m.members_count,
    }));

    return (
        <AuthenticatedLayout header="Ministries Catalog">
            <Head title="Ministries" />

            <ConfirmModal
                show={!!confirm}
                title="Delete Global Ministry?"
                message={`Are you sure you want to delete "${confirm?.name}"? This action will dissolve the ministry across all societies but will not delete the members themselves.`}
                confirmLabel="Delete Ministry"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">Established Ministries</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {data.length} global ministry types
                    </div>
                </div>
                {canManage && (
                    <Link href={route('ministries.create')} className="btn-primary">
                        <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                        Define New Ministry
                    </Link>
                )}
            </div>

            <div className="card" style={{ padding: '0' }}>
                {!data.length ? (
                    <div className="empty-state" style={{ padding: '4rem 0' }}>
                        <UserGroupIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No global ministries defined yet.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ministry Name</th>
                                <th>Description</th>
                                <th>Global Membership</th>
                                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((m) => (
                                <tr key={m.id} 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={() => window.location.href = route('ministries.show', m.id)}
                                >
                                    <td className="primary-cell" style={{ fontWeight: 700 }}>{m.name}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '300px' }}>
                                        {m.description || '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,160,23,0.1)', color: 'var(--gold-light)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <UserGroupIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                            {m.memberCount} Members
                                        </div>
                                    </td>
                                    {canManage && (
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                <Link href={route('ministries.edit', m.id)} className="btn-icon"
                                                    style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                                    onClick={e => e.stopPropagation()}>
                                                    <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                                </Link>
                                                <button onClick={e => { e.stopPropagation(); setConfirm({ id: m.id, name: m.name }); }} className="btn-icon"
                                                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} />
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
