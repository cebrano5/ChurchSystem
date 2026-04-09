import GenericIndex from '@/Components/GenericIndex';
import { Link } from '@inertiajs/react';

export default function EventsIndex({ events }) {
    const data = events.data.map(e => ({
        ID: e.id, 
        Name: e.name, 
        Conference: e.local_society?.district?.annual_conference?.name || 'N/A',
        District: e.local_society?.district?.name || 'N/A',
        Society: e.local_society?.name || '-',
        Date: new Date(e.event_date).toLocaleDateString(), 
        Location: e.location || 'N/A', 
        Attendance: e.attendance_count
    }));

    return (
        <div className="space-y-6">
            <GenericIndex title="Events & Attendance" data={data} columns={["ID", "Name", "Conference", "District", "Society", "Date", "Location", "Attendance"]} />

            
            {events.links && events.links.length > 3 && (
                <div className="flex justify-center space-x-1">
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
        </div>
    );
}

