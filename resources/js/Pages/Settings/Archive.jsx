import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

const TABS = [
    { id: 'users', label: 'Users & Admins' },
    { id: 'conferences', label: 'Conferences' },
    { id: 'districts', label: 'Districts' },
    { id: 'societies', label: 'Societies' },
    { id: 'pastors', label: 'Pastors' },
    { id: 'members', label: 'Members' },
    { id: 'ministries', label: 'Ministries' },
    { id: 'events', label: 'Events' },
];

export default function Archive({ archives }) {
    const [activeTab, setActiveTab] = useState('users');
    const [confirmRestore, setConfirmRestore] = useState(null); // { type, id, name }
    
    const { post, processing } = useForm();

    const handleRestore = () => {
        if (!confirmRestore) return;
        post(route('settings.archive.restore', { type: confirmRestore.type, id: confirmRestore.id }), {
            onSuccess: () => setConfirmRestore(null),
        });
    };

    const currentRecords = archives[activeTab] || [];

    return (
        <AuthenticatedLayout header="System Archive">
            <Head title="System Archive" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href={route('settings')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none',
                        transition: 'color 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <ArrowLeftIcon style={{ width: '1rem' }} /> Back to Settings
                    </Link>
                </div>

                {/* Info Alert */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start'
                }}>
                    <ExclamationTriangleIcon style={{ width: '1.5rem', color: '#f87171', flexShrink: 0 }} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>System Archive Container</h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            This container holds all soft-deleted records. Restoring a hierarchical record (like a District) 
                            will make it active again, but you may also need to manually restore its subordinates if they were individually archived.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                                color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.label}
                            <span style={{ 
                                marginLeft: '0.5rem', 
                                padding: '0.1rem 0.4rem', 
                                borderRadius: '999px', 
                                fontSize: '0.7rem', 
                                background: activeTab === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                                color: activeTab === tab.id ? '#000' : '#fff'
                            }}>
                                {archives[tab.id]?.length || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table Area */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    {currentRecords.length === 0 ? (
                        <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                            <div className="empty-state-icon" style={{ opacity: 0.5 }}>📦</div>
                            <div className="empty-state-text">No archived {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} found.</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Identifier / Name</th>
                                        <th>Archived On</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map(record => {
                                        // Try to find a sensible name for the record
                                        const recordName = record.name || record.full_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || record.username || `ID: ${record.id}`;
                                        
                                        return (
                                            <tr key={record.id}>
                                                <td className="primary-cell" style={{ fontWeight: 600 }}>{recordName}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    {new Date(record.deleted_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button 
                                                        className="btn-icon"
                                                        onClick={() => setConfirmRestore({ type: activeTab, id: record.id, name: recordName })}
                                                        style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                                                    >
                                                        <ArrowPathIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                show={!!confirmRestore}
                title="Restore Record?"
                message={`Are you sure you want to restore "${confirmRestore?.name}"? It will become active and visible in the system again.`}
                confirmLabel="Yes, Restore"
                onConfirm={handleRestore}
                onCancel={() => setConfirmRestore(null)}
            />
        </AuthenticatedLayout>
    );
}
