import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';


export default function MembersIndex({ members, canManage, flash }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
            destroy(route('members.destroy', id));
        }
    };

    const memberData = members?.data || [];
    const links = members?.links || [];

    return (
        <AuthenticatedLayout header="Members Directory">
            <Head title="Members" />

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}

            {canManage && (
                <div className="flex justify-end mb-6">
                    <Link
                        href={route('members.create')}
                        className="bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                    >
                        + Add Member
                    </Link>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Conference</th>
                            <th className="p-4">District</th>
                            <th className="p-4">Society</th>
                            <th className="p-4">Status</th>

                            {canManage && <th className="p-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {memberData.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-medium text-slate-800">
                                    {member.first_name} {member.last_name}
                                </td>
                                <td className="p-4 text-slate-600">{member.local_society?.district?.annual_conference?.name || 'N/A'}</td>
                                <td className="p-4 text-slate-600">{member.local_society?.district?.name || 'N/A'}</td>
                                <td className="p-4 text-slate-600">{member.local_society?.name || 'N/A'}</td>
                                <td className="p-4">

                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                        {member.status}
                                    </span>
                                </td>
                                {canManage && (
                                    <td className="p-4 text-right space-x-3">
                                        <Link
                                            href={route('members.edit', member.id)}
                                            className="text-[#c9a227] hover:text-yellow-600 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {memberData.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No members found.</div>
                )}
            </div>
            
            {/* Simple Pagination */}
            {links.length > 3 && (
                <div className="mt-6 flex justify-center space-x-1">
                    {links.map((link, i) => {
                        const isPrevNext = link.label.includes('&laquo;') || link.label.includes('&raquo;');
                        return (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 rounded ${link.active ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-600 border border-slate-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                onClick={(e) => { if (!link.url) e.preventDefault(); }}
                            />
                        );
                    })}
                </div>
            )}
        </AuthenticatedLayout>
    );
}

