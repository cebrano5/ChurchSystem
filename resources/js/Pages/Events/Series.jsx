import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, ClockIcon, UserGroupIcon, ArrowLeftIcon, CheckCircleIcon, PlayCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Series({ events, seriesName, organizer, canManage }) {
    const today = new Date().toISOString().split('T')[0];

    const getStatus = (eventDate) => {
        const d = new Date(eventDate).toISOString().split('T')[0];
        if (d === today) return 'TODAY';
        if (d < today) return 'COMPLETED';
        return 'UPCOMING';
    };

    const STATUS_STYLES = {
        TODAY:     { bg: 'rgba(212,160,23,0.12)', color: 'var(--gold)', label: 'Today', icon: PlayCircleIcon },
        COMPLETED: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', label: 'Completed', icon: CheckCircleIcon },
        UPCOMING:  { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', label: 'Upcoming', icon: LockClosedIcon },
    };

    return (
        <AuthenticatedLayout header={`Series: ${seriesName}`}>
            <Head title={`Series: ${seriesName}`} />

            <div style={{ marginBottom: '2rem' }}>
                <Link href={route('events.index')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
                    <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} /> Back to All Events
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #1c3254 0%, #11223a 100%)', border: '1px solid rgba(212,160,23,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(212,160,23,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid rgba(212,160,23,0.2)' }}>
                        <CalendarIcon style={{ width: '1.75rem', height: '1.75rem', color: 'var(--gold)', margin: 'auto' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{seriesName}</h2>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>{organizer}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <UserGroupIcon style={{ width: '1rem', height: '1rem' }} /> {events.length} Scheduled Occurrences
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Attendance</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => {
                            const status = getStatus(event.event_date);
                            const style = STATUS_STYLES[status];
                            const Icon = style.icon;

                            return (
                                <tr key={event.id} className={status === 'TODAY' ? 'today-highlight' : ''} 
                                    style={status === 'TODAY' ? { background: 'rgba(212,160,23,0.03)' } : {}}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                                                {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div style={{ color: 'var(--gold-light)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <ClockIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                                {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.3rem 0.75rem', borderRadius: '8px',
                                            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                                            background: style.bg, color: style.color,
                                            border: `1px solid ${style.color}22`,
                                        }}>
                                            <Icon style={{ width: '0.9rem', height: '0.9rem' }} />
                                            {style.label}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%',
                                            background: event.attendance_count > 0 ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)', 
                                            color: event.attendance_count > 0 ? '#60a5fa' : 'var(--text-secondary)',
                                            fontSize: '0.8rem', 
                                            fontWeight: 700,
                                            border: event.attendance_count > 0 ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.05)',
                                        }}>
                                            {event.attendance_count}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {status === 'UPCOMING' ? (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500, fontStyle: 'italic' }}>
                                                Check back on {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        ) : (
                                            <Link href={route('events.show', event.id)}
                                                className={status === 'TODAY' ? 'btn-primary' : 'btn-secondary'}
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {status === 'TODAY' ? 'Take Attendance' : 'View Attendance'}
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .today-highlight {
                    border-left: 3px solid var(--gold) !important;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
