import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ConferencesIndex({ conferences, flash }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this Annual Conference? All subordinate districts and societies will be removed as well. This cannot be undone.')) {
            destroy(route('conferences.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="Annual Conferences">
            <Head title="Conferences" />

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="flex justify-end mb-6">
                <Link
                    href={route('conferences.create')}
                    className="bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                >
                    + Add Conference
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Region</th>
                            <th className="p-4">Districts Count</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {conferences.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 text-slate-800 font-medium">{c.name}</td>
                                <td className="p-4 text-slate-600">{c.region}</td>
                                <td className="p-4 text-slate-600">{c.districts_count}</td>
                                <td className="p-4 text-right space-x-3">
                                    <Link href={route('conferences.edit', c.id)} className="text-[#c9a227] hover:text-yellow-600 font-medium">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-medium">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!conferences?.length && <div className="p-8 text-center text-slate-500">No organizational data found.</div>}
            </div>
        </AuthenticatedLayout>
    );
}
