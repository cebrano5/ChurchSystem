import GenericIndex from '@/Components/GenericIndex';

export default function EventsIndex({ events }) {
    const data = events.map(e => ({
        ID: e.id, Name: e.name, Date: new Date(e.event_date).toLocaleDateString(), Location: e.location || 'N/A', Attendance: e.attendance_count
    }));
    return <GenericIndex title="Events & Attendance" data={data} columns={["ID", "Name", "Date", "Location", "Attendance"]} />;
}
