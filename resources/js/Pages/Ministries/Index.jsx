import GenericIndex from '@/Components/GenericIndex';
import { Link } from '@inertiajs/react';

export default function MinistriesIndex({ ministries }) {
    const data = ministries.data.map(m => ({
        ID: m.id, 
        Name: m.name, 
        Conference: m.local_society?.district?.annual_conference?.name || 'N/A',
        District: m.local_society?.district?.name || 'N/A',
        Society: m.local_society?.name || '-', 
        Leader: m.leader ? `${m.leader.first_name} ${m.leader.last_name}` : 'Unassigned'
    }));

    return (
        <div className="space-y-6">
            <GenericIndex title="Ministries" data={data} columns={["ID", "Name", "Conference", "District", "Society", "Leader"]} />

            
            {ministries.links && ministries.links.length > 3 && (
                <div className="flex justify-center space-x-1">
                    {ministries.links.map((link, i) => (
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

