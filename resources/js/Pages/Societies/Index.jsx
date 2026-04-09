import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function SocietiesIndex({ societies, flash }) {
    const { delete: destroy } = useForm();
    const user = usePage().props.auth.user;
    const canManage = ['national_admin', 'conference_admin', 'district_admin'].includes(user.role);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this Local Society? All subordinate members will be removed as well. This cannot be undone.')) {
            destroy(route('societies.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Local Societies">
            <Head title="Societies" />

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}

            {canManage && (
                <div className="flex justify-end mb-6">
                    <Link
                        href={route('societies.create')}
                        className="bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                    >
                        + Add Society
                    </Link>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">District</th>
                            <th className="p-4">Conference</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Members</th>
                            <th className="p-4">Primary Administrator</th>
                            {canManage && <th className="p-4 text-right">Actions</th>}

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {societies.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 text-slate-800 font-medium">{s.name}</td>
                                <td className="p-4 text-slate-600">{s.district?.name || 'N/A'}</td>
                                <td className="p-4 text-slate-600">{s.district?.annual_conference?.name || 'N/A'}</td>
                                <td className="p-4 text-slate-600">
                                    {s.contact_person}
                                    <div className="text-xs text-slate-400 mt-0.5">{s.contact_phone}</div>
                                </td>
                                <td className="p-4 text-slate-600">{s.members_count}</td>
                                <td className="p-4 text-slate-600">
                                    {s.admins?.[0] ? (
                                        <div>
                                            <div className="font-semibold text-slate-700">{s.admins[0].name}</div>
                                            <div className="text-xs text-slate-400">@{s.admins[0].username}</div>
                                        </div>
                                    ) : (
                                        <span className="italic text-slate-400">Not Assigned</span>
                                    )}
                                </td>

                                {canManage && (
                                    <td className="p-4 text-right space-x-3">
                                        <Link href={route('societies.edit', s.id)} className="text-[#c9a227] hover:text-yellow-600 font-medium">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-medium">
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!societies?.length && <div className="p-8 text-center text-slate-500">No organizational data found.</div>}
            </div>
        </AuthenticatedLayout>
    );
}
