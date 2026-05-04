import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function GenericIndex({ title, data, columns }) {
    return (
        <AuthenticatedLayout header={title}>
            <Head title={title} />

            <div className="section-header">
                <div className="section-title">{title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {data?.length ?? 0} records
                </div>
            </div>

            <div className="card">
                {!data?.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-text">No records found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={i}>
                                    {Object.values(item)
                                        .filter(v => typeof v !== 'object')
                                        .map((val, j) => (
                                            <td key={j} className={j === 0 ? 'primary-cell' : ''}>
                                                {val || '—'}
                                            </td>
                                        ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
