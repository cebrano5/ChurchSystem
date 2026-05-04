import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PlusIcon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';

const TYPE_STYLES = {
    'Tithe':           { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    'Offering':        { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    'Special Donation':{ bg: 'rgba(168,85,247,0.12)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' },
    'Building Fund':   { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    'Mission Fund':    { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.25)' },
};

export default function DonationsIndex({ donations, canManage, members }) {
    const [showCreate, setShowCreate] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        amount: '',
        donation_type: 'Offering',
        donation_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('donations.store'), {
            onSuccess: () => { setShowCreate(false); reset(); },
        });
    };

    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

    return (
        <AuthenticatedLayout header="Financial Donations">
            <Head title="Financial Donations" />

            {/* Create Form */}
            {showCreate && canManage && (
                <div className="card animate-fade-up" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            Record New Donation
                        </div>
                        <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <XMarkIcon style={{ width: '1.2rem', height: '1.2rem' }} />
                        </button>
                    </div>
                    <form onSubmit={submit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="member_id" className="form-label">Member</label>
                                <select id="member_id" className="form-select"
                                    value={data.member_id} onChange={(e) => setData('member_id', e.target.value)} required>
                                    <option value="" disabled>Select a member…</option>
                                    {members?.map(m => (
                                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.member_id} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount" className="form-label">Amount (₱)</label>
                                <input id="amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                                    value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="donation_type" className="form-label">Donation Type</label>
                                <select id="donation_type" className="form-select"
                                    value={data.donation_type} onChange={(e) => setData('donation_type', e.target.value)}>
                                    <option>Tithe</option>
                                    <option>Offering</option>
                                    <option>Special Donation</option>
                                    <option>Building Fund</option>
                                    <option>Mission Fund</option>
                                </select>
                                <InputError message={errors.donation_type} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="payment_method" className="form-label">Payment Method</label>
                                <select id="payment_method" className="form-select"
                                    value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                    <option>Cash</option>
                                    <option>Check</option>
                                    <option>Bank Transfer</option>
                                    <option>Online</option>
                                </select>
                                <InputError message={errors.payment_method} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="donation_date" className="form-label">Date</label>
                                <input id="donation_date" type="date" className="form-input"
                                    value={data.donation_date} onChange={(e) => setData('donation_date', e.target.value)} required />
                                <InputError message={errors.donation_date} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                                <input id="notes" type="text" className="form-input" placeholder="Any additional notes…"
                                    value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                <InputError message={errors.notes} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Donation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Header */}
            <div className="section-header">
                <div>
                    <div className="section-title">All Donations</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Total:{' '}
                        <span style={{ color: '#34d399', fontWeight: 700 }}>
                            ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
                {canManage && (
                    <button onClick={() => setShowCreate(!showCreate)} className={showCreate ? 'btn-secondary' : 'btn-primary'}>
                        {showCreate
                            ? <><XMarkIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Cancel</>
                            : <><PlusIcon style={{ width: '0.9rem', height: '0.9rem' }} /> Record Donation</>}
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="card">
                {!donations?.length ? (
                    <div className="empty-state">
                        <CurrencyDollarIcon className="empty-state-icon" style={{ width: '3rem', height: '3rem' }} />
                        <div className="empty-state-text">No donations recorded yet.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Conf / Dist / Society</th>
                                <th>Member</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Method</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.map((d) => {
                                const typeStyle = TYPE_STYLES[d.donation_type] || TYPE_STYLES['Offering'];
                                return (
                                    <tr key={d.id}>
                                        <td>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                                {d.local_society?.district?.annual_conference?.name || '—'}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {d.local_society?.district?.name || '—'} → {d.local_society?.name || '—'}
                                            </div>
                                        </td>
                                        <td className="primary-cell">
                                            {d.member ? `${d.member.first_name} ${d.member.last_name}` : 'Unknown'}
                                        </td>
                                        <td>
                                            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>
                                                ₱{Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center',
                                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                fontSize: '0.68rem', fontWeight: 700,
                                                background: typeStyle.bg, color: typeStyle.color,
                                                border: `1px solid ${typeStyle.border}`,
                                            }}>
                                                {d.donation_type}
                                            </span>
                                        </td>
                                        <td>{d.payment_method}</td>
                                        <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
