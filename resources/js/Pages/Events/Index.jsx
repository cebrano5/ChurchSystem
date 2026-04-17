import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

/**
 * EventsIndex component
 * Displays a list of events filtered by the user's scope.
 * Allows creating events if authorized.
 */
export default function EventsIndex({ events, canManage }) {
    // State to toggle the create event modal
    const [showCreate, setShowCreate] = useState(false);

    // Form helper to handle event creation
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        event_date: '',
        location: '',
        description: '',
    });

    // Submits the new event form payload securely
    const submit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };

    /**
     * Parse the organizer information intelligently depending on the polymorphic type.
     */
    const getOrganizerDetails = (e) => {
        const type = e.organizer_type;
        const org = e.organizer;
        if (!org) return { level: 'National', name: 'National Admin HQ' };

        if (type === 'App\\Models\\LocalSociety') return { level: 'Society', name: org.name };
        if (type === 'App\\Models\\District') return { level: 'District', name: org.name };
        if (type === 'App\\Models\\AnnualConference') return { level: 'Conference', name: org.name };
        
        return { level: 'Unknown', name: org?.name || 'Unknown' };
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-slate-800 leading-tight">Events & Attendance</h2>
            }
        >
            <Head title="Events & Attendance" />

            {/* Top Toolbar */}
            <div className="flex justify-end mb-6">
                {canManage && (
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium flex items-center space-x-2"
                    >
                        <span>{showCreate ? 'Cancel Creation' : '+ Create New Event'}</span>
                    </button>
                )}
            </div>

            {/* Create Event Form Section */}
            {showCreate && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Event</h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Event Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="event_date" value="Event Date" />
                                <TextInput
                                    id="event_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.event_date}
                                    onChange={(e) => setData('event_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.event_date} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="location" value="Location" />
                                <TextInput
                                    id="location"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                />
                                <InputError message={errors.location} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-4 space-x-3">
                            <SecondaryButton onClick={() => setShowCreate(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Save Event</PrimaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* Events List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4 hidden md:table-cell">Organizer Level</th>
                            <th className="p-4 hidden md:table-cell">Organizer Name</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 hidden lg:table-cell">Location</th>
                            <th className="p-4 text-center">Attendance</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {events.data.map((event) => {
                            const origin = getOrganizerDetails(event);
                            return (
                                <tr key={event.id} className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => window.location.href = route('events.show', event.id)}>
                                    <td className="p-4 font-medium text-slate-800">{event.name}</td>
                                    <td className="p-4 hidden md:table-cell text-slate-600">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            origin.level === 'National' ? 'bg-red-100 text-red-700' :
                                            origin.level === 'Conference' ? 'bg-purple-100 text-purple-700' :
                                            origin.level === 'District' ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {origin.level}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-slate-600">{origin.name}</td>
                                    <td className="p-4 text-slate-600">{new Date(event.event_date).toLocaleDateString()}</td>
                                    <td className="p-4 hidden lg:table-cell text-slate-600">{event.location || '-'}</td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 h-8 w-8 rounded-full font-bold">
                                            {event.attendance_count}
                                        </span>
                                    </td>
                                    {/* Link to show page for attendance and detailed view */}
                                    <td className="p-4 text-right">
                                        <Link href={route('events.show', event.id)} className="text-blue-600 hover:text-blue-800 font-medium">
                                            View Details &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!events.data?.length && <div className="p-8 text-center text-slate-500">No events found.</div>}
            </div>

            {/* Pagination Controls */}
            {events.links && events.links.length > 3 && (
                <div className="flex justify-center space-x-1 mt-6">
                    {events.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 rounded ${link.active ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-600 border border-slate-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
