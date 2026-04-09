import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function GenericIndex({ title, data, columns }) {
    return (
        <AuthenticatedLayout header={title}>
            <Head title={title} />
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            {columns.map(col => <th key={col} className="p-4">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {data.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition">
                                {Object.values(item).filter(v => typeof v !== 'object').map((val, j) => (
                                    <td key={j} className="p-4 text-slate-600">{val || '-'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!data?.length && <div className="p-8 text-center text-slate-500">No records found.</div>}
            </div>
        </AuthenticatedLayout>
    );
}
