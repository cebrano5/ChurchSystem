import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ stats, role, scopeName }) {
    return (
        <AuthenticatedLayout header={`Dashboard - ${scopeName || 'National Overview'}`}>
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
                        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">
                            {key.replace('_', ' ')}
                        </span>
                        <span className="text-3xl font-bold text-slate-800">
                            {key === 'donations' || key === 'total_donations' ? `$${Number(value).toLocaleString()}` : value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Welcome to the Church Admin System</h3>
                <p className="text-slate-600">
                    You are logged in as a <strong className="text-[#c9a227]">{role.replace('_', ' ')}</strong>.
                    Navigate using the sidebar to manage your organizational scope.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
