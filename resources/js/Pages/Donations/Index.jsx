import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { PlusIcon, CurrencyDollarIcon, XMarkIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';
import ConfirmModal from '@/Components/ConfirmModal';

const TYPE_STYLES = {
    'inflow': { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
    'outflow': { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

export default function DonationsIndex({ donations, canManage, members, societies, summary }) {
    const [showCreate, setShowCreate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null); // stores donation ID
    
    // We expect societies to contain the scope. If SocietyAdmin, length=1
    const defaultSocietyId = societies?.length === 1 ? societies[0].id : '';

    const { data, setData, post, processing, errors, reset } = useForm({
        local_society_id: defaultSocietyId,
        member_id: '',
        type: 'inflow',
        category: 'Tithes',
        amount: '',
        notes: '',
        donation_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
    });

    const inflowCategories = ['Tithes', 'Offerings', 'Fundraisers', 'Special Donations', 'Other Income'];
    const outflowCategories = ['Utilities', 'Salaries', 'Maintenance', 'Event Expenses', 'Missions', 'Office Supplies', 'Other Expenses'];

    const submit = (e) => {
        e.preventDefault();
        post(route('donations.store'), {
            onSuccess: () => {
                setShowCreate(false);
                reset();
                setData('local_society_id', defaultSocietyId);
            },
        });
    };

    const handleDelete = () => {
        if (confirmDelete) {
            router.delete(route('donations.destroy', confirmDelete), {
                onSuccess: () => setConfirmDelete(null),
                onError: () => setConfirmDelete(null),
                onFinish: () => setConfirmDelete(null),
            });
        }
    };

    const handlePeriodChange = (e) => {
        router.get(route('donations.index'), { period: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Financial Statement">
            <Head title="Financial Statement" />

            {/* Create Form Container */}
            {showCreate && canManage && (
                <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', background: 'rgba(15, 30, 53, 0.4)' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Record Transaction</h3>
                    </div>
                    <form onSubmit={submit} style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            
                            {societies?.length > 1 && (
                                <div className="form-group">
                                    <label htmlFor="local_society_id" className="form-label">Society</label>
                                    <select id="local_society_id" className="form-select"
                                        value={data.local_society_id} onChange={(e) => setData('local_society_id', e.target.value)} required>
                                        <option value="">-- Select Society --</option>
                                        {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <InputError message={errors.local_society_id} />
                                </div>
                            )}

                            {data.type === 'inflow' && members && members.length > 0 && (
                                <div className="form-group">
                                    <label htmlFor="member_id" className="form-label">Member (Optional)</label>
                                    <select id="member_id" className="form-select"
                                        value={data.member_id} onChange={(e) => setData('member_id', e.target.value)}>
                                        <option value="">Anonymous / General Fund</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                    </select>
                                    <InputError message={errors.member_id} />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Transaction Type</label>
                                <select className="form-select" value={data.type} onChange={(e) => setData(d => ({ ...d, type: e.target.value, category: e.target.value === 'inflow' ? 'Tithes' : 'Utilities', member_id: '' }))}>
                                    <option value="inflow">Inflow (Income)</option>
                                    <option value="outflow">Outflow (Expense)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                    {(data.type === 'inflow' ? inflowCategories : outflowCategories).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount" className="form-label">Amount (₱)</label>
                                <input id="amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                                    value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                <InputError message={errors.amount} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="payment_method" className="form-label">Payment Method</label>
                                <select id="payment_method" className="form-select"
                                    value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                    <option>Cash</option>
                                    <option>Check</option>
                                    <option>Bank Transfer</option>
                                    <option>Online</option>
                                    <option>Other</option>
                                </select>
                                <InputError message={errors.payment_method} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="donation_date" className="form-label">Date</label>
                                <input id="donation_date" type="date" className="form-input" max={new Date().toISOString().split('T')[0]}
                                    value={data.donation_date} onChange={(e) => setData('donation_date', e.target.value)} required />
                                <InputError message={errors.donation_date} />
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                                <input id="notes" type="text" className="form-input" placeholder="Any additional notes…"
                                    value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                <InputError message={errors.notes} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Header */}
            <div className="section-header">
                <div>
                    <div className="section-title">Financial Records</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span>
                            Inflows: <span style={{ color: '#34d399', fontWeight: 600 }}>₱{Number(summary.inflow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </span>
                        <span style={{ color: 'var(--border-color)' }}>|</span>
                        <span>
                            Outflows: <span style={{ color: '#f87171', fontWeight: 600 }}>₱{Number(summary.outflow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </span>
                        <span style={{ color: 'var(--border-color)' }}>|</span>
                        <span>
                            Net: <span style={{ color: summary.net >= 0 ? '#38bdf8' : '#f43f5e', fontWeight: 700 }}>₱{Number(summary.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={summary.period}
                        onChange={handlePeriodChange}
                        className="form-select"
                        style={{ padding: '0.4rem 2rem 0.4rem 1rem' }}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    {canManage && (
                        <button onClick={() => setShowCreate(!showCreate)} className={showCreate ? 'btn-secondary' : 'btn-primary'}>
                            {showCreate
                                ? <><XMarkIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Cancel</>
                                : <><PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Record Transaction</>}
                        </button>
                    )}
                    <a href={route('donations.pdf')} target="_blank" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DocumentArrowDownIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Export PDF
                    </a>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {!donations?.length ? (
                    <div className="empty-state">
                        <CurrencyDollarIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No financial records found.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Society / Member</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th>Notes</th>
                                <th style={{ textAlign: 'right', width: '80px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.map((d) => {
                                const typeStyle = TYPE_STYLES[d.type] || TYPE_STYLES['inflow'];
                                return (
                                    <tr key={d.id}>
                                        <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                                {d.local_society?.district?.annual_conference?.name || '—'}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {d.local_society?.name || '—'}
                                            </div>
                                            {d.member && (
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                    Member: {d.member.first_name} {d.member.last_name}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center',
                                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                fontSize: '0.68rem', fontWeight: 700,
                                                background: typeStyle.bg, color: typeStyle.color,
                                                border: `1px solid ${typeStyle.border}`,
                                            }}>
                                                {d.category}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{ color: d.type === 'inflow' ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>
                                                {d.type === 'inflow' ? '+' : '-'}₱{Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{d.notes || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {canManage && (
                                                <button 
                                                    onClick={() => setConfirmDelete(d.id)}
                                                    className="btn-icon"
                                                    style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                                >
                                                    <TrashIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal
                show={!!confirmDelete}
                title="Archive Record?"
                message="Are you sure you want to archive this financial record? It will be hidden from active views but kept for historical purposes."
                confirmLabel="Archive Record"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </AuthenticatedLayout>
    );
}
