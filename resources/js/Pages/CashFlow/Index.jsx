import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon,
    PlusIcon, TrashIcon, XMarkIcon, BanknotesIcon
} from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);
};

function StatCard({ icon: Icon, label, value, color, glow }) {
    return (
        <div style={{
            background: 'rgba(28, 50, 84, 0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', top: '-50%', right: '-20%', width: '150px', height: '150px',
                background: glow, filter: 'blur(60px)', borderRadius: '50%', zIndex: 0
            }}></div>
            
            <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '16px',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, zIndex: 1
            }}>
                <Icon style={{ width: '1.75rem', height: '1.75rem' }} />
            </div>
            
            <div style={{ zIndex: 1 }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

export default function CashFlowIndex({ transactions, summary, societies }) {
    const { auth } = usePage().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Summary values
    const netFlow = summary.net;
    const isNetPositive = netFlow >= 0;

    const { data, setData, post, processing, errors, reset } = useForm({
        local_society_id: societies.length === 1 ? societies[0].id : '',
        type: 'inflow',
        category: 'Tithes',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
    });

    const inflowCategories = ['Tithes', 'Offerings', 'Fundraisers', 'Special Donations', 'Other Income'];
    const outflowCategories = ['Utilities', 'Salaries', 'Maintenance', 'Event Expenses', 'Missions', 'Office Supplies', 'Other Expenses'];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cash-flow.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                if (societies.length === 1) setData('local_society_id', societies[0].id);
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this transaction? This will update the cash flow totals.')) {
            router.delete(route('cash-flow.destroy', id));
        }
    };

    const handlePeriodChange = (e) => {
        router.get(route('cash-flow.index'), { period: e.target.value }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header="Cash Flow">
            <Head title="Cash Flow" />

            <div style={{ padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                            Cash Flow
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Track and manage organizational income and expenses.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select 
                            value={summary.period}
                            onChange={handlePeriodChange}
                            style={{
                                background: 'rgba(15, 30, 53, 0.6)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                outline: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="primary-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', background: '#34d399', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                        >
                            <PlusIcon style={{ width: '1.2rem' }} />
                            Record Transaction
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <StatCard 
                        icon={ArrowTrendingUpIcon} 
                        label="Total Inflows" 
                        value={formatCurrency(summary.inflow)} 
                        color="#34d399" 
                        glow="rgba(52,211,153,0.15)" 
                    />
                    <StatCard 
                        icon={ArrowTrendingDownIcon} 
                        label="Total Outflows" 
                        value={formatCurrency(summary.outflow)} 
                        color="#f87171" 
                        glow="rgba(248,113,113,0.15)" 
                    />
                    <StatCard 
                        icon={BanknotesIcon} 
                        label="Net Cash Flow" 
                        value={formatCurrency(netFlow)} 
                        color={isNetPositive ? "#38bdf8" : "#f43f5e"} 
                        glow={isNetPositive ? "rgba(56,189,248,0.15)" : "rgba(244,63,94,0.15)"} 
                    />
                </div>

                {/* Transactions Table */}
                <div style={{ background: 'rgba(28, 50, 84, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Recent Transactions</h2>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Society</th>
                                    <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                    <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                    <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '1rem 2rem', width: '80px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No transactions found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '1.25rem 2rem', color: '#fff', fontSize: '0.9rem' }}>
                                                {new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {t.local_society?.name || '-'}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '999px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600,
                                                    background: t.type === 'inflow' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                                                    color: t.type === 'inflow' ? '#34d399' : '#f87171',
                                                    border: `1px solid ${t.type === 'inflow' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`
                                                }}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {t.description || '-'}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: t.type === 'inflow' ? '#34d399' : '#f87171' }}>
                                                {t.type === 'inflow' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDelete(t.id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                                                    title="Delete Transaction"
                                                >
                                                    <TrashIcon style={{ width: '1.1rem' }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Transaction Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#0f1e35', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '500px',
                        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => { setIsAddModalOpen(false); reset(); }}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <XMarkIcon style={{ width: '1.5rem' }} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '2rem' }}>Record Transaction</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            {/* Society Selection (if managing multiple) */}
                            {societies.length > 1 && (
                                <div>
                                    <label className="form-label">Local Society</label>
                                    <select 
                                        value={data.local_society_id} 
                                        onChange={e => setData('local_society_id', e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%' }}
                                    >
                                        <option value="">Select a Society</option>
                                        {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <InputError message={errors.local_society_id} className="mt-2" />
                                </div>
                            )}

                            {/* Type Toggle */}
                            <div>
                                <label className="form-label">Transaction Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setData(d => ({ ...d, type: 'inflow', category: inflowCategories[0] }))}
                                        style={{ 
                                            flex: 1, padding: '0.75rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                            border: `1px solid ${data.type === 'inflow' ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                                            background: data.type === 'inflow' ? 'rgba(52,211,153,0.1)' : 'transparent',
                                            color: data.type === 'inflow' ? '#34d399' : 'var(--text-secondary)'
                                        }}
                                    >
                                        Inflow (Income)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData(d => ({ ...d, type: 'outflow', category: outflowCategories[0] }))}
                                        style={{ 
                                            flex: 1, padding: '0.75rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                            border: `1px solid ${data.type === 'outflow' ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                                            background: data.type === 'outflow' ? 'rgba(248,113,113,0.1)' : 'transparent',
                                            color: data.type === 'outflow' ? '#f87171' : 'var(--text-secondary)'
                                        }}
                                    >
                                        Outflow (Expense)
                                    </button>
                                </div>
                            </div>

                            {/* Category & Amount Row */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Category</label>
                                    <select 
                                        value={data.category} 
                                        onChange={e => setData('category', e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%' }}
                                    >
                                        {(data.type === 'inflow' ? inflowCategories : outflowCategories).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Amount</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₱</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            min="0.01"
                                            value={data.amount} 
                                            onChange={e => setData('amount', e.target.value)}
                                            className="form-input"
                                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <InputError message={errors.amount} className="mt-2" />
                                </div>
                            </div>

                            {/* Date & Payment Method */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Date</label>
                                    <input 
                                        type="date" 
                                        value={data.transaction_date} 
                                        onChange={e => setData('transaction_date', e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%' }}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <InputError message={errors.transaction_date} className="mt-2" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Payment Method</label>
                                    <select 
                                        value={data.payment_method} 
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%' }}
                                    >
                                        <option>Cash</option>
                                        <option>Check</option>
                                        <option>Bank Transfer</option>
                                        <option>Online</option>
                                        <option>Other</option>
                                    </select>
                                    <InputError message={errors.payment_method} className="mt-2" />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="form-label">Description (Optional)</label>
                                <textarea 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Enter details about this transaction..."
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={processing}
                                style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    background: '#34d399',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    opacity: processing ? 0.7 : 1,
                                    width: '100%',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {processing ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
