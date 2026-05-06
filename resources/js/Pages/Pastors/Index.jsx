import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function PastorsIndex({ pastors }) {
    const { delete: destroy } = useForm();
    const [confirm, setConfirm] = useState(null); // { id, name }

    const handleDelete = () => {
        destroy(route('pastors.destroy', confirm.id));
        setConfirm(null);
    };

    return (
        <AuthenticatedLayout header="Pastors Directory">
            <Head title="Pastors" />

            <ConfirmModal
                show={!!confirm}
                title="Archive Pastor?"
                message={`Are you sure you want to archive ${confirm?.name ?? 'this pastor'}? They will be hidden from lists but their data will be preserved.`}
                confirmLabel="Archive Pastor"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">My Pastors</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {pastors.length} total records
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Link href={route('pastors.create')} className="btn-primary">
                        <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                        Add Pastor
                    </Link>
                </div>
            </div>

            <div className="card">
                {pastors.length === 0 ? (
                    <div className="empty-state">
                        <UserIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No pastors found in your scope.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role / Position</th>
                                <th>Contact</th>
                                <th>Assigned Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastors.map((pastor) => (
                                <tr key={pastor.id}>
                                    <td className="primary-cell">
                                        {pastor.full_name}
                                    </td>
                                    <td>{pastor.role_or_position}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                                            {pastor.email && <div>{pastor.email}</div>}
                                            {pastor.phone && <div>{pastor.phone}</div>}
                                        </div>
                                    </td>
                                    <td>{new Date(pastor.assigned_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${pastor.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                            {pastor.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                            <Link
                                                href={route('pastors.show', pastor.id)}
                                                className="btn-icon"
                                                style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}
                                            >
                                                <EyeIcon style={{ width: '0.9rem', height: '0.9rem' }} /> View
                                            </Link>
                                            <Link
                                                href={route('pastors.edit', pastor.id)}
                                                className="btn-icon"
                                                style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                            >
                                                <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit
                                            </Link>
                                            <button
                                                onClick={() => setConfirm({ id: pastor.id, name: pastor.full_name })}
                                                className="btn-icon"
                                                style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                            >
                                                <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Archive
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
