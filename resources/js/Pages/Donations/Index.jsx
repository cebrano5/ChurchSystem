import GenericIndex from '@/Components/GenericIndex';

export default function DonationsIndex({ donations }) {
    const data = donations.map(d => ({
        ID: d.id, Member: d.member ? `${d.member.first_name} ${d.member.last_name}` : '-', Amount: `$${Number(d.amount).toLocaleString()}`, Type: d.donation_type, Date: new Date(d.donation_date).toLocaleDateString(), Method: d.payment_method
    }));
    return <GenericIndex title="Financial Donations" data={data} columns={["ID", "Member", "Amount", "Type", "Date", "Method"]} />;
}
