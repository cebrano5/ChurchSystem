import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PlusIcon, XMarkIcon, CalendarIcon, PencilSquareIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';

const LEVEL_STYLES = {
    National:   { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.25)' },
    Conference: { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc', border: 'rgba(168,85,247,0.25)' },
    District:   { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    Society:    { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
};

const getOrganizerDetails = (e) => {
    const type = e.organizer_type;
    const org  = e.organizer;
    if (!org) return { level: 'National', name: 'National Admin HQ' };
    if (type === 'App\\Models\\LocalSociety')     return { level: 'Society',    name: org.name };
    if (type === 'App\\Models\\District')          return { level: 'District',   name: org.name };
    if (type === 'App\\Models\\AnnualConference')  return { level: 'Conference', name: org.name };
    return { level: 'Unknown', name: org?.name || 'Unknown' };
};

import CustomDatePicker from '@/Components/CustomDatePicker';
import CustomTimePicker from '@/Components/CustomTimePicker';

export default function EventsIndex({ events, canManage }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deletingEvent, setDeletingEvent] = useState(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, transform } = useForm({
        name: '',
        date: '',
        start_time: '08:00',
        end_time: '09:00',
        location: '',
        description: '',
        is_recurring: false,
        recurrence_frequency: 'weekly',
        recurrence_end_date: '',
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            event_date: `${data.date} ${data.start_time}`,
            end_date: data.end_time ? `${data.date} ${data.end_time}` : null,
        }));
    }, [data.date, data.start_time, data.end_time]);

    const submit = (e) => {
        e.preventDefault();
        if (editingEvent) {
            patch(route('events.update', editingEvent.id), {
                onSuccess: () => { setEditingEvent(null); reset(); },
            });
        } else {
            post(route('events.store'), {
                onSuccess: () => { setShowCreate(false); reset(); },
            });
        }
    };

    const handleEdit = (event) => {
        const d = new Date(event.event_date);
        const ed = event.end_date ? new Date(event.end_date) : null;
        
        setData({
            name: event.name,
            date: d.toISOString().split('T')[0],
            start_time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            end_time: ed ? ed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
            location: event.location || '',
            description: event.description || '',
            is_recurring: false,
            recurrence_frequency: 'weekly',
            recurrence_end_date: '',
        });
        setEditingEvent(event);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (event) => {
        setDeletingEvent(event);
    };

    const confirmDelete = () => {
        if (deletingEvent) {
            setIsDeleting(true);
            router.delete(route('events.destroy', deletingEvent.id), {
                onSuccess: () => {
                    setDeletingEvent(null);
                    setIsDeleting(false);
                },
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Events & Attendance">
            <Head title="Events & Attendance" />

            {/* Create/Edit Modal Overlay */}
            {(showCreate || editingEvent) && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 3000, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '1.5rem',
                    background: 'rgba(7, 14, 25, 0.8)',
                    backdropFilter: 'blur(8px)',
                    animation: 'backdropFade 0.3s ease'
                }}>
                    <div className="card bubble-pop" style={{ 
                        width: '100%', 
                        maxWidth: '650px',
                        padding: '2rem', 
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,160,23,0.1)',
                        position: 'relative',
                        background: 'linear-gradient(165deg, #1c3254 0%, #11223a 100%)',
                        overflow: 'visible'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                            <div>
                                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                    {editingEvent ? 'Edit Scheduled Event' : 'Schedule New Event'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                                    The Sanctuary • {editingEvent ? 'Updating Record' : 'Planning'}
                                </div>
                            </div>
                            <button onClick={() => { setShowCreate(false); setEditingEvent(null); reset(); }} className="btn-icon" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                <XMarkIcon style={{ width: '1.4rem', height: '1.4rem' }} />
                            </button>
                        </div>

                        <form onSubmit={submit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="event_name" className="form-label">Event Name</label>
                                    <input id="event_name" type="text" className="form-input" placeholder="e.g. Sunday Morning Mass"
                                        value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    <InputError message={errors.name} />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <CustomDatePicker 
                                        value={data.date} 
                                        onChange={(val) => setData('date', val)} 
                                        placeholder="Select date"
                                    />
                                    <InputError message={errors.date || errors.event_date} />
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Start</label>
                                            <CustomTimePicker value={data.start_time} onChange={(val) => setData('start_time', val)} />
                                            <InputError message={errors.start_time} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End</label>
                                            <CustomTimePicker value={data.end_time} onChange={(val) => setData('end_time', val)} />
                                            <InputError message={errors.end_time || errors.end_date} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label htmlFor="event_location" className="form-label">Location</label>
                                    <input id="event_location" type="text" className="form-input" placeholder="Church Main Sanctuary"
                                        value={data.location} onChange={(e) => setData('location', e.target.value)} />
                                    <InputError message={errors.location} />
                                </div>

                                {!editingEvent && (
                                    <div className="form-group" style={{ gridColumn: '1 / -1', background: 'rgba(212,160,23,0.05)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(212,160,23,0.15)', overflow: 'visible' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: data.is_recurring ? '1rem' : '0' }}>
                                            <input type="checkbox" checked={data.is_recurring} onChange={e => setData('is_recurring', e.target.checked)}
                                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--gold)' }} />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gold)' }}>Recurring Event / Series</span>
                                        </label>

                                        {data.is_recurring && (
                                            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Frequency</label>
                                                    <select className="form-select" value={data.recurrence_frequency} onChange={e => setData('recurrence_frequency', e.target.value)} required>
                                                        <option value="weekly">Weekly</option>
                                                        <option value="daily">Daily</option>
                                                        <option value="monthly">Monthly</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Until</label>
                                                    <CustomDatePicker 
                                                        value={data.recurrence_end_date} 
                                                        onChange={(val) => setData('recurrence_end_date', val)} 
                                                        placeholder="End date"
                                                        openUp={true}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => { setShowCreate(false); setEditingEvent(null); reset(); }} style={{ padding: '0.75rem 1.5rem' }}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={processing} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                                    {processing ? 'Saving…' : (editingEvent ? 'Update Record' : 'Schedule Event')}
                                </button>
                            </div>
                        </form>
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

            {/* Header */}
            <div className="section-header">
                <div>
                    <div className="section-title">All Events</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {events.data?.length ?? 0} records this page
                    </div>
                </div>
                {canManage && (
                    <button onClick={() => setShowCreate(!showCreate)} className={showCreate ? 'btn-secondary' : 'btn-primary'}>
                        {showCreate ? <><XMarkIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Cancel</> : <><PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Create Event</>}
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="card">
                {!events.data?.length ? (
                    <div className="empty-state">
                        <CalendarIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No events found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Level</th>
                                <th>Organizer</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th style={{ textAlign: 'center' }}>Attendance</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.data.map((event) => {
                                const origin = getOrganizerDetails(event);
                                const levelStyle = LEVEL_STYLES[origin.level] || LEVEL_STYLES.Society;
                                return (
                                    <tr key={event.id} style={{ cursor: 'pointer' }}
                                        onClick={() => window.location.href = route('events.show', event.id)}>
                                        <td className="primary-cell">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                {event.name}
                                                {event.series_instances > 1 && (
                                                    <span style={{ 
                                                        background: 'rgba(212,160,23,0.1)', 
                                                        color: 'var(--gold)', 
                                                        fontSize: '0.6rem', 
                                                        padding: '0.15rem 0.4rem', 
                                                        borderRadius: '4px', 
                                                        fontWeight: 800,
                                                        border: '1px solid rgba(212,160,23,0.2)',
                                                        letterSpacing: '0.02em'
                                                    }}>
                                                        SERIES ({event.series_instances})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center',
                                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                fontSize: '0.68rem', fontWeight: 700,
                                                background: levelStyle.bg, color: levelStyle.color,
                                                border: `1px solid ${levelStyle.border}`,
                                            }}>
                                                {origin.level}
                                            </span>
                                        </td>
                                        <td>{origin.name}</td>
                                        <td>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div style={{ color: 'var(--gold-light)', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                                {event.series_instances > 1 && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem', fontWeight: 500 }}>& More...</span>}
                                            </div>
                                        </td>
                                        <td>{event.location || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                                                fontSize: '0.8rem', fontWeight: 700,
                                                border: '1px solid rgba(59,130,246,0.25)',
                                            }}>
                                                {event.attendance_count}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <Link href={route('events.show', event.id)}
                                                    className="btn-icon"
                                                    style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    View Details
                                                </Link>
                                                {event.can_manage && (
                                                    <button
                                                        className="btn-icon"
                                                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(event); }}>
                                                        <TrashIcon style={{ width: '0.8rem', height: '0.8rem' }} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                         </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {events.links?.length > 3 && (
                <div className="pagination">
                    {events.links.map((link, i) => (
                        <Link key={i} href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`page-btn ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                            onClick={(e) => { if (!link.url) e.preventDefault(); }} />
                    ))}
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deletingEvent && (
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
                        maxWidth: '450px',
                        padding: '2.5rem', 
                        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.1)',
                        position: 'relative',
                        background: 'linear-gradient(165deg, #1c3254 0%, #11223a 100%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '20px', 
                            background: 'rgba(239,68,68,0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                            <ExclamationTriangleIcon style={{ width: '2rem', height: '2rem', color: '#f87171' }} />
                        </div>

                        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem' }}>
                            {deletingEvent.series_instances > 1 ? 'Delete Entire Series?' : 'Delete Event?'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Are you sure you want to delete <span style={{ color: '#fff', fontWeight: 700 }}>"{deletingEvent.name}"</span>? 
                            {deletingEvent.series_instances > 1 ? (
                                <> This will permanently remove <span style={{ color: 'var(--gold)', fontWeight: 800 }}>all {deletingEvent.series_instances} instances</span> in this recurring series.</>
                            ) : (
                                <> This action will permanently remove this record and cannot be undone.</>
                            )}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button 
                                onClick={() => setDeletingEvent(null)} 
                                className="btn-secondary" 
                                style={{ padding: '0.875rem', fontWeight: 700 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete} 
                                className="btn-primary" 
                                disabled={isDeleting}
                                style={{ 
                                    padding: '0.875rem', 
                                    background: '#ef4444', 
                                    borderColor: '#ef4444',
                                    fontWeight: 700 
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
