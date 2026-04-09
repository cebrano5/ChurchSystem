import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function UsersIndex({ users, flash }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
            destroy(route('users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header="System Administrators">
            <Head title="System Administrators" />

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}

            <div className="flex justify-end mb-6">
                <Link
                    href={route('users.create')}
                    className="bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                >
                    + Add Administrator
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Assigned Scope ID</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 text-slate-800 font-medium">{u.name}</td>
                                <td className="p-4 text-slate-600">{u.username}</td>
                                <td className="p-4 text-slate-600">
                                    <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded text-xs font-semibold">
                                        {u.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600">{u.scope_id || 'Global'}</td>
                                <td className="p-4 text-right space-x-3">
                                    <Link
                                        href={route('users.edit', u.id)}
                                        className="text-[#c9a227] hover:text-yellow-600 font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!users?.length && <div className="p-8 text-center text-slate-500">No lower-tiered administrators found under your scope.</div>}
            </div>
        </AuthenticatedLayout>
    );
}
