import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeftIcon, 
    CalendarIcon, 
    MapPinIcon, 
    UserGroupIcon, 
    PencilSquareIcon, 
    XMarkIcon,
    ClockIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

const getOrganizerLabel = (event) => {
    const type = event.organizer_type;
    const org  = event.organizer;
    if (!org) return 'National Admin HQ';
    if (type === 'App\\Models\\LocalSociety')    return org.name;
    if (type === 'App\\Models\\District')         return org.name;
    if (type === 'App\\Models\\AnnualConference') return org.name;
    return org.name;
};

const getEventStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 3600000); // Default 1hr if no end

    if (now < startDate) return { label: 'Upcoming', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' };
    if (now > endDate) return { label: 'Past Event', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
    return { label: 'Live Now', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
};

export default function EventsShow({ event, canManage, eligibleMembers = [], seriesEvents = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [removingMember, setRemovingMember] = useState(null);
    const attendeeCount = event.members?.length || 0;
    const status = getEventStatus(event.event_date, event.end_date);

    const { data, setData, put, processing, errors } = useForm({
        name: event.name || '',
        event_date: event.event_date ? new Date(new Date(event.event_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
        location: event.location || '',
        description: event.description || '',
    });

    const { data: attendanceData, post: postAttendance, processing: processingAttendance } = useForm({
        event_id: event.id,
        member_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('events.update', event.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const recordMember = (memberId) => {
        postAttendance(route('attendance.store'), {
            preserveScroll: true,
            onBefore: () => {
                attendanceData.member_id = memberId;
            },
        });
    };

    const unmarkMember = (memberId) => {
        postAttendance(route('attendance.remove'), {
            preserveScroll: true,
            onBefore: () => {
                attendanceData.member_id = memberId;
            },
        });
    };

    const filteredMembers = eligibleMembers.filter(m => 
        (m.first_name + ' ' + m.last_name).toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.members.some(em => em.id === m.id)
    );

    return (
        <AuthenticatedLayout header="Event Details">
            <Head title={`${event.name} - Details`} />

            {/* Premium Header / Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <Link href={route('events.index')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--navy-border)'
                }}
                    onMouseOver={e => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                >
                    <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
                    Back to Schedule
                </Link>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {canManage && (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary" 
                            style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                            <PencilSquareIcon style={{ width: '1.1rem', height: '1.1rem' }} /> Edit Details
                        </button>
                    )}
                </div>
            </div>

            {/* Hero Card */}
            <div className="card" style={{ 
                padding: '0', 
                marginBottom: '2.5rem', 
                overflow: 'hidden', 
                background: 'linear-gradient(135deg, #1c3254 0%, #0a1424 100%)',
                border: '1px solid rgba(212,160,23,0.15)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                <div style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <span style={{
                                    padding: '0.35rem 0.8rem',
                                    borderRadius: '8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    background: status.bg,
                                    color: status.color,
                                    border: `1px solid ${status.color}33`
                                }}>
                                    {status.label}
                                </span>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>•</span>
                                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                                    {getOrganizerLabel(event)}
                                </span>
                            </div>

                            <h1 style={{ 
                                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                fontSize: '2.25rem', 
                                fontWeight: 800, 
                                color: '#fff', 
                                marginBottom: '1rem',
                                letterSpacing: '-0.02em'
                            }}>
                                {event.name}
                            </h1>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,160,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CalendarIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--gold)' }} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                                            {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                                            {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPinIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-secondary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                                            {event.location || 'Church Main Sanctuary'}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                                            Assigned Location
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '2rem', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            minWidth: '200px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>{attendeeCount}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                                Total Attendees
                            </div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700 }}>
                                    Live Roster
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Bar */}
                <div style={{ 
                    padding: '1.25rem 2.5rem', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <InformationCircleIcon style={{ width: '1.1rem', height: '1.1rem', color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, fontStyle: event.description ? 'normal' : 'italic' }}>
                        {event.description || 'No additional description provided for this mass/event.'}
                    </p>
                </div>
            </div>

            {/* Series Schedule (Timeline) */}
            {seriesEvents && seriesEvents.length > 1 && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <ClockIcon style={{ width: '1.25rem', height: '1.25rem', color: 'var(--gold)' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Series Schedule</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {seriesEvents.length} Total Occurrences
                        </span>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        overflowX: 'auto', 
                        paddingBottom: '1rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--gold) transparent'
                    }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const seDate = new Date(se.event_date);
                            const today = new Date().toISOString().split('T')[0];
                            const seDateStr = seDate.toISOString().split('T')[0];
                            
                            let statusColor = 'var(--text-secondary)';
                            let statusBg = 'rgba(255,255,255,0.03)';
                            if (seDateStr === today) {
                                statusColor = 'var(--gold)';
                                statusBg = 'rgba(212,160,23,0.1)';
                            } else if (seDateStr < today) {
                                statusColor = '#34d399';
                                statusBg = 'rgba(16,185,129,0.08)';
                            }

                            return (
                                <Link 
                                    key={se.id} 
                                    href={route('events.show', se.id)}
                                    style={{
                                        flex: '0 0 auto',
                                        width: '140px',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        background: isCurrent ? 'var(--gold)' : statusBg,
                                        border: isCurrent ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        boxShadow: isCurrent ? '0 10px 20px rgba(212,160,23,0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '0.65rem', 
                                        fontWeight: 800, 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.05em',
                                        color: isCurrent ? 'rgba(0,0,0,0.6)' : statusColor 
                                    }}>
                                        {seDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.85rem', 
                                        fontWeight: 800, 
                                        color: isCurrent ? '#000' : '#fff' 
                                    }}>
                                        {seDate.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        color: isCurrent ? 'rgba(0,0,0,0.5)' : 'var(--text-secondary)',
                                        marginTop: '0.2rem'
                                    }}>
                                        {se.attendance_count} Attended
                                    </div>
                                    {isCurrent && (
                                        <div style={{ 
                                            marginTop: '0.25rem',
                                            padding: '0.15rem 0.4rem',
                                            background: '#000',
                                            color: 'var(--gold)',
                                            fontSize: '0.6rem',
                                            fontWeight: 900,
                                            borderRadius: '4px'
                                        }}>
                                            ACTIVE
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Attendance Section */}
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h3 className="section-title">Attendance Roster</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Verification and recording of church members present
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', opacity: 0.7 }} disabled>
                        Export PDF
                    </button>
                    <button onClick={() => setShowAttendance(true)} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>
                        Record Attendance
                    </button>
                </div>
            </div>

            <div className="card">
                {!event.members?.length ? (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <UserGroupIcon style={{ width: '2.5rem', height: '2.5rem', color: 'rgba(255,255,255,0.1)' }} />
                        </div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>No attendance recorded</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                            Start recording presence to see church members listed here.
                        </p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>Category / Role</th>
                                <th>Contact Information</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Time Recorded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {event.members.map(member => (
                                <tr key={member.id}>
                                    <td className="primary-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--navy-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            {member.first_name} {member.last_name}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {member.role || 'Member'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{member.phone_number || '—'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.email || 'No email'}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                            <CheckCircleIcon style={{ width: '0.8rem', height: '0.8rem' }} /> Present
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                {member.pivot?.recorded_at
                                                    ? new Date(member.pivot.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </div>
                                            {canManage && (
                                                <button 
                                                    onClick={() => setRemovingMember(member)}
                                                    style={{ 
                                                        background: 'rgba(239,68,68,0.08)', 
                                                        border: '1px solid rgba(239,68,68,0.15)', 
                                                        color: '#f87171', 
                                                        cursor: 'pointer', 
                                                        padding: '0.4rem',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                                    title="Remove"
                                                >
                                                    <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reusing Create Modal for Editing */}
            <Modal show={isEditing} onClose={() => setIsEditing(false)} maxWidth="2xl">
                <div className="card" style={{ padding: '2rem', border: 'none', background: 'linear-gradient(165deg, #1c3254 0%, #11223a 100%)', overflow: 'visible' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                        <div>
                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                Edit Event Details
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                                The Sanctuary • Updating Record
                            </div>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="btn-icon" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <XMarkIcon style={{ width: '1.4rem', height: '1.4rem' }} />
                        </button>
                    </div>

                    <form onSubmit={submit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="edit_name" className="form-label">Event Name</label>
                                <input id="edit_name" type="text" className="form-input" 
                                    value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="edit_location" className="form-label">Location</label>
                                <input id="edit_location" type="text" className="form-input" 
                                    value={data.location} onChange={e => setData('location', e.target.value)} />
                                <InputError message={errors.location} />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="edit_desc" className="form-label">Description</label>
                                <textarea id="edit_desc" className="form-input" rows="3" style={{ resize: 'vertical' }}
                                    value={data.description} onChange={e => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '0.75rem 1.5rem' }}>Discard</button>
                            <button type="submit" className="btn-primary" disabled={processing} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                                {processing ? 'Saving…' : 'Update Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Attendance Selection Modal */}
            <Modal show={showAttendance} onClose={() => setShowAttendance(false)} maxWidth="lg">
                <div className="card" style={{ padding: '2rem', border: 'none', background: 'linear-gradient(165deg, #1c3254 0%, #11223a 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>Record Attendance</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select members present at {event.name}</p>
                        </div>
                        <button onClick={() => setShowAttendance(false)} className="btn-icon" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                            <XMarkIcon style={{ width: '1.4rem', height: '1.4rem' }} />
                        </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Search members..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {filteredMembers.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {searchTerm ? 'No matching members found.' : 'All eligible members are already recorded.'}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filteredMembers.map(member => (
                                    <button 
                                        key={member.id}
                                        onClick={() => recordMember(member.id)}
                                        disabled={processingAttendance}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = 'rgba(212,160,23,0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(212,160,23,0.2)';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--navy-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{member.first_name} {member.last_name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                        <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255,255,255,0.1)' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                         <button onClick={() => setShowAttendance(false)} className="btn-secondary" style={{ width: '100%' }}>Done</button>
                    </div>
                </div>
            </Modal>

            {/* Attendance Removal Confirmation (Bubble Pop) */}
            {removingMember && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 4000, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '1.5rem',
                    background: 'rgba(7, 14, 25, 0.85)',
                    backdropFilter: 'blur(10px)',
                    animation: 'backdropFade 0.3s ease'
                }}>
                    <div className="card bubble-pop" style={{ 
                        width: '100%', 
                        maxWidth: '400px',
                        padding: '2.25rem', 
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.1)',
                        position: 'relative',
                        background: 'linear-gradient(165deg, #1c3254 0%, #11223a 100%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '16px', 
                            background: 'rgba(239,68,68,0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                            <XMarkIcon style={{ width: '1.75rem', height: '1.75rem', color: '#f87171' }} />
                        </div>

                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#fff', marginBottom: '0.6rem' }}>
                            Remove Attendance?
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Are you sure you want to remove the attendance record for <span style={{ color: '#fff', fontWeight: 700 }}>"{removingMember.first_name} {removingMember.last_name}"</span>?
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button 
                                onClick={() => setRemovingMember(null)} 
                                className="btn-secondary" 
                                style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    unmarkMember(removingMember.id);
                                    setRemovingMember(null);
                                }} 
                                className="btn-primary" 
                                style={{ 
                                    padding: '0.75rem', 
                                    fontSize: '0.85rem',
                                    background: '#ef4444', 
                                    borderColor: '#ef4444',
                                    fontWeight: 700 
                                }}
                            >
                                Confirm Removal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes backdropFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .bubble-pop {
                    animation: bubblePopEffect 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes bubblePopEffect {
                    0% { transform: scale(0.85); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
