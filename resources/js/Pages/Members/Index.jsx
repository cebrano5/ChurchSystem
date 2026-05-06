import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, PencilSquareIcon, TrashIcon, UserGroupIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

export default function MembersIndex({ members, canManage }) {
    const { delete: destroy } = useForm();
    const [confirm, setConfirm] = useState(null); // { id, name }

    const memberData = members?.data || [];
    const links = members?.links || [];

    const handleDelete = () => {
        destroy(route('members.destroy', confirm.id));
        setConfirm(null);
    };

    return (
        <AuthenticatedLayout header="Members Directory">
            <Head title="Members" />

            <ConfirmModal
                show={!!confirm}
                title="Archive Member?"
                message={`Are you sure you want to archive ${confirm?.name ?? 'this member'}? They will be hidden from all lists but their data will be preserved.`}
                confirmLabel="Archive Member"
                onConfirm={handleDelete}
                onCancel={() => setConfirm(null)}
            />

            <div className="section-header">
                <div>
                    <div className="section-title">All Members</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {members?.total ?? memberData.length} total records
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <a href={route('members.pdf')} target="_blank" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DocumentArrowDownIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Export PDF
                    </a>
                    {canManage && (
                        <Link href={route('members.create')} className="btn-primary">
                            <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                            Add Member
                        </Link>
                    )}
                </div>
            </div>

            <div className="card">
                {memberData.length === 0 ? (
                    <div className="empty-state">
                        <UserGroupIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No members found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Conference</th>
                                <th>District</th>
                                <th>Society</th>
                                <th>Status</th>
                                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {memberData.map((member) => (
                                <tr key={member.id}>
                                    <td className="primary-cell">
                                        {member.first_name} {member.last_name}
                                    </td>
                                    <td>{member.local_society?.district?.annual_conference?.name || '—'}</td>
                                    <td>{member.local_society?.district?.name || '—'}</td>
                                    <td>{member.local_society?.name || '—'}</td>
                                    <td>
                                        <span className={`badge ${member.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    {canManage && (
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                <Link
                                                    href={route('members.edit', member.id)}
                                                    className="btn-icon"
                                                    style={{ color: 'var(--gold-light)', background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                                                >
                                                    <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit
                                                </Link>
                                                <button
                                                    onClick={() => setConfirm({ id: member.id, name: `${member.first_name} ${member.last_name}` })}
                                                    className="btn-icon"
                                                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                                >
                                                    <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Archive
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

            {links.length > 3 && (
                <div className="pagination">
                    {links.map((link, i) => (
                        <Link key={i} href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`page-btn ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                            onClick={(e) => { if (!link.url) e.preventDefault(); }} />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
