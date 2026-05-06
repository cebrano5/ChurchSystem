import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ConfirmModal from '@/Components/ConfirmModal';

const ALL_TABS = [
    { id: 'users', label: 'Users & Admins' },
    { id: 'conferences', label: 'Conferences' },
    { id: 'districts', label: 'Districts' },
    { id: 'societies', label: 'Societies' },
    { id: 'pastors', label: 'Pastors' },
    { id: 'members', label: 'Members' },
    { id: 'ministries', label: 'Ministries' },
    { id: 'events', label: 'Events' },
];

export default function Archive({ archives, activityLogs = [] }) {
    // Only show tabs for which the controller returned an array (even if empty)
    const availableTabs = ALL_TABS.filter(tab => archives[tab.id] !== undefined);
    
    // Add Activity Log to available tabs
    const finalTabs = [...availableTabs, { id: 'activity_log', label: 'Activity Log' }];
    
    // Set the first available tab as the active one by default
    const [activeTab, setActiveTab] = useState(finalTabs.length > 0 ? finalTabs[0].id : '');
    const [confirmRestore, setConfirmRestore] = useState(null); // { type, id, name }
    
    const { post, processing } = useForm();

    const handleRestore = () => {
        if (!confirmRestore) return;
        post(route('settings.archive.restore', { type: confirmRestore.type, id: confirmRestore.id }), {
            onSuccess: () => setConfirmRestore(null),
        });
    };

    const currentRecords = archives[activeTab] || [];

    const renderActivityLog = () => (
        <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Date & Time</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    {activityLogs.map(log => (
                        <tr key={log.id}>
                            <td className="primary-cell" style={{ fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 600 }}>{log.user?.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{log.user?.email}</div>
                            </td>
                            <td>
                                <span style={{
                                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                                    background: log.action === 'archive' ? 'rgba(239, 68, 68, 0.1)' : 
                                                log.action === 'restore' ? 'rgba(52, 211, 153, 0.1)' : 
                                                log.action === 'create' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: log.action === 'archive' ? '#f87171' : 
                                           log.action === 'restore' ? '#34d399' : 
                                           log.action === 'create' ? '#60a5fa' : 'var(--text-secondary)'
                                }}>
                                    {log.action}
                                </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.description}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                {new Date(log.created_at).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{log.ip_address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

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
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>System Audit & Archive</h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            This module tracks all administrative activity and manages soft-deleted records. 
                            Use the <strong>Activity Log</strong> to audit recent changes, and the tabs below to restore archived entities.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ 
                    display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem', 
                    background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)'
                }}>
                    {finalTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                                color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
                                transform: activeTab === tab.id ? 'translateY(-1px)' : 'none'
                            }}
                        >
                            {tab.id === 'activity_log' ? '📝 ' : ''}{tab.label}
                            {tab.id !== 'activity_log' && (
                                <span style={{ 
                                    padding: '0.1rem 0.5rem', 
                                    borderRadius: '6px', 
                                    fontSize: '0.7rem', 
                                    background: activeTab === tab.id ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
                                    color: activeTab === tab.id ? '#000' : '#fff',
                                    fontWeight: 700
                                }}>
                                    {archives[tab.id]?.length || 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Area */}
                <div className="card" style={{ 
                    padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
                }}>
                    {activeTab === 'activity_log' ? (
                        activityLogs.length === 0 ? (
                            <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                <div className="empty-state-icon" style={{ opacity: 0.5 }}>📝</div>
                                <div className="empty-state-text">No activity logs found.</div>
                            </div>
                        ) : renderActivityLog()
                    ) : (
                        currentRecords.length === 0 ? (
                            <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                <div className="empty-state-icon" style={{ opacity: 0.5 }}>📦</div>
                                <div className="empty-state-text">No archived {ALL_TABS.find(t => t.id === activeTab)?.label?.toLowerCase() || 'records'} found.</div>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Identifier / Name</th>
                                            <th>Archived By</th>
                                            <th>Archived On</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRecords.map(record => {
                                            const recordName = record.name || record.full_name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || record.username || `ID: ${record.id}`;
                                            
                                            return (
                                                <tr key={record.id}>
                                                    <td className="primary-cell" style={{ fontWeight: 600 }}>{recordName}</td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {record.deleted_by ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                                                                    {record.deleted_by_user?.name?.charAt(0) || '?'}
                                                                </div>
                                                                {record.deleted_by_user?.name || 'Unknown Admin'}
                                                            </div>
                                                        ) : '—'}
                                                    </td>
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
                        )
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
