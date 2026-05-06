import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PencilSquareIcon, ArrowLeftIcon, UserIcon, CalendarIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function PastorsShow({ pastor }) {
    return (
        <AuthenticatedLayout header="Pastor Details">
            <Head title={`Pastor - ${pastor.full_name}`} />

            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href={route('pastors.index')} className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                        <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
                    </Link>
                    <div>
                        <div className="section-title">{pastor.full_name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            {pastor.role_or_position}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Link href={route('pastors.edit', pastor.id)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PencilSquareIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Edit Pastor
                    </Link>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Left Column: Avatar & Basic Info */}
                    <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--navy-border)', paddingRight: '2rem' }}>
                        <div style={{ 
                            width: '120px', height: '120px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, rgba(212,160,23,0.1) 0%, rgba(212,160,23,0.05) 100%)',
                            border: '1px solid rgba(212,160,23,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--gold)'
                        }}>
                            <UserIcon style={{ width: '4rem', height: '4rem' }} />
                        </div>
                        
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                {pastor.full_name}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{pastor.role_or_position}</p>
                            <div style={{ marginTop: '0.75rem' }}>
                                <span className={`badge ${pastor.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                                    {pastor.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contact Information</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {pastor.email ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                            <EnvelopeIcon style={{ width: '1rem', height: '1rem', color: 'var(--text-secondary)' }} />
                                            <a href={`mailto:${pastor.email}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{pastor.email}</a>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)' }}>No email provided</div>
                                    )}
                                    {pastor.phone ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                            <PhoneIcon style={{ width: '1rem', height: '1rem', color: 'var(--text-secondary)' }} />
                                            {pastor.phone}
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)' }}>No phone provided</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Assignment Details</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                        <CalendarIcon style={{ width: '1rem', height: '1rem', color: 'var(--text-secondary)' }} />
                                        Assigned on {new Date(pastor.assigned_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {pastor.notes && (
                            <div>
                                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Notes & Additional Information</h3>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--navy-border)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {pastor.notes}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
