import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

/**
 * EventsShow component
 * Displays full details of an event including description, metadata,
 * and a table of attendees (members).
 */
export default function EventsShow({ event }) {
    // Parse organizer directly
    const getOrganizerLabel = () => {
        const type = event.organizer_type;
        const org = event.organizer;
        if (!org) return 'National HQ';
        if (type === 'App\\Models\\LocalSociety') return `Society: ${org.name}`;
        if (type === 'App\\Models\\District') return `District: ${org.name}`;
        if (type === 'App\\Models\\AnnualConference') return `Conference: ${org.name}`;
        return org.name;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">Event Details</h2>
                    <Link href={route('events.index')} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        &larr; Back to Events
                    </Link>
                </div>
            }
        >
            <Head title={`Event - ${event.name}`} />

            <div className="space-y-6">
                {/* Event Metadata Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{event.name}</h3>
                            <p className="text-emerald-700 font-medium text-sm mt-1">{getOrganizerLabel()}</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 text-center">
                            <div className="text-2xl font-black text-blue-600">{event.members?.length || 0}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Attendance</div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">When & Where</h4>
                            <div className="space-y-2 text-slate-700">
                                <p><span className="font-medium">Date:</span> {new Date(event.event_date).toLocaleDateString()}</p>
                                <p><span className="font-medium">Location:</span> {event.location || 'Not specified'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                            <div className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                {event.description || <i>No description provided.</i>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendees List Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-medium text-slate-900">Attendance Roster</h3>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                                <th className="p-4">Member Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4 hidden md:table-cell">Gender</th>
                                <th className="p-4">Recorded At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {event.members && event.members.length > 0 ? (
                                event.members.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-medium text-slate-800">{member.first_name} {member.last_name}</td>
                                        <td className="p-4 text-slate-600">{member.phone_number || member.email || '-'}</td>
                                        <td className="p-4 hidden md:table-cell text-slate-600">{member.gender || '-'}</td>
                                        <td className="p-4 text-slate-500">
                                            {member.pivot?.recorded_at 
                                                ? new Date(member.pivot.recorded_at).toLocaleString() 
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        No attendance recorded for this event yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
