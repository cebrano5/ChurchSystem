import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    PencilSquareIcon, ArrowLeftIcon, UserGroupIcon, 
    MapPinIcon, IdentificationIcon, PlusIcon, XMarkIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';

export default function MinistryShow({ ministry, scopedMembers, availableMembers, canManage }) {
    const members = scopedMembers || [];

    const [showAddMember, setShowAddMember] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(null); // { id, name }

    const addMemberForm = useForm({
        member_id: '',
    });

    const removeMemberForm = useForm();

    const handleAddMember = (e) => {
        e.preventDefault();
        addMemberForm.post(route('ministries.members.add', ministry.id), {
            onSuccess: () => {
                setShowAddMember(false);
                addMemberForm.reset();
            },
        });
    };

    const handleRemoveMember = () => {
        removeMemberForm.delete(route('ministries.members.remove', [ministry.id, confirmRemove.id]), {
            onSuccess: () => setConfirmRemove(null),
        });
    };

    return (
        <AuthenticatedLayout header={`Ministry: ${ministry.name}`}>
            <Head title={`Ministry - ${ministry.name}`} />

            {/* Confirm Removal Modal */}
            <ConfirmModal
                show={!!confirmRemove}
                title="Remove Member?"
                message={`Are you sure you want to remove ${confirmRemove?.name} from this ministry?`}
                confirmLabel="Remove Member"
                onConfirm={handleRemoveMember}
                onCancel={() => setConfirmRemove(null)}
            />

            {/* Add Member Modal */}
            <Modal show={showAddMember} onClose={() => setShowAddMember(false)}>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Add Member to Ministry
                        </h2>
                        <button onClick={() => setShowAddMember(false)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                        </button>
                    </div>

                    <form onSubmit={handleAddMember}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="member_select">Select Member</label>
                            <select 
                                id="member_select"
                                className="form-select"
                                value={addMemberForm.data.member_id}
                                onChange={e => addMemberForm.setData('member_id', e.target.value)}
                                required
                            >
                                <option value="">— Choose a Member —</option>
                                {availableMembers.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.first_name} {m.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={addMemberForm.processing}>
                                {addMemberForm.processing ? 'Adding...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Page Header */}
            <div className="section-header">
                <div>
                    <Link href={route('ministries.index')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeftIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Back to Ministries
                    </Link>
                    <div className="section-title" style={{ fontSize: '1.5rem' }}>{ministry.name}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {canManage && (
                        <Link href={route('ministries.edit', ministry.id)} className="btn-secondary">
                            <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit Info
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Information Card */}
                <div className="card" style={{ padding: '1.75rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--navy-border)', paddingBottom: '0.75rem' }}>
                        General Information
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Global Leader</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '32px', height: '32px', background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IdentificationIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                                </div>
                                <span style={{ fontWeight: 600, color: 'var(--gold-light)' }}>
                                    {ministry.leader_name || 'No National Leader Assigned'}
                                </span>
                            </div>
                        </div>

                        {ministry.local_society && (
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Organizational Scope</div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                    <MapPinIcon style={{ width: '1.1rem', height: '1.1rem', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{ministry.local_society?.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            {ministry.local_society?.district?.name} • {ministry.local_society?.district?.annual_conference?.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Description</div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {ministry.description || 'No description provided for this ministry.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Members List Card */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--navy-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Ministry Members</div>
                        <button 
                            onClick={() => setShowAddMember(true)}
                            className="btn-primary"
                            style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }}
                        >
                            <PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Add Member
                        </button>
                    </div>

                    {!members.length ? (
                        <div className="empty-state" style={{ padding: '4rem 0' }}>
                            <UserGroupIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                            <div className="empty-state-text">No members found within your jurisdictional scope.</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Member Name</th>
                                    <th>Origin / Location</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="primary-cell">
                                            <div style={{ fontWeight: 600 }}>{member.first_name} {member.last_name}</div>
                                            <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>{member.email || member.phone || 'No contact'}</div>
                                        </td>
                                        <td>
                                            <div style={{ color: 'var(--gold-light)', fontSize: '0.82rem', fontWeight: 600 }}>{member.location.society}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                {member.location.district} • {member.location.conference}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${member.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setConfirmRemove({ id: member.id, name: `${member.first_name} ${member.last_name}` })}
                                                style={{ padding: '0.4rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                className="btn-icon"
                                            >
                                                <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
