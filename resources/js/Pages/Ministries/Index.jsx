import GenericIndex from '@/Components/GenericIndex';

export default function MinistriesIndex({ ministries }) {
    const data = ministries.map(m => ({
        ID: m.id, Name: m.name, Society: m.local_society?.name || '-', Leader: m.leader ? `${m.leader.first_name} ${m.leader.last_name}` : 'Unassigned'
    }));
    return <GenericIndex title="Ministries" data={data} columns={["ID", "Name", "Society", "Leader"]} />;
}
