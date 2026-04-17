import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

/**
 * DonationsIndex component
 * Lists financial contributions logically scoped to the user.
 * Displays deep origin path (Conference -> District -> Society) for higher admins.
 */
export default function DonationsIndex({ donations, canManage, members }) {
    // Form toggle state
    const [showCreate, setShowCreate] = useState(false);

    // Inertia form to handle donation creation (restricted to Society Admins)
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
            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-slate-800 leading-tight">Financial Donations</h2>
            }
        >
            <Head title="Financial Donations" />

            {/* Top Toolbar */}
            <div className="flex justify-end mb-6">
                {canManage && (
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium flex items-center space-x-2"
                    >
                        <span>{showCreate ? 'Cancel Session' : '+ Record Donation'}</span>
                    </button>
                )}
            </div>

            {/* Creation Form for local societies */}
            {showCreate && canManage && (
                <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Record New Donation</h3>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="member_id" value="Member" />
                                <select
                                    id="member_id"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.member_id}
                                    onChange={(e) => setData('member_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a member...</option>
                                    {members?.map(m => (
                                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.member_id} className="mt-2" />
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="amount" value="Amount ($)" />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="mt-1 block w-full"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    required
                                />
                                <InputError message={errors.amount} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="donation_type" value="Donation Type" />
                                <select
                                    id="donation_type"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.donation_type}
                                    onChange={(e) => setData('donation_type', e.target.value)}
                                >
                                    <option>Tithe</option>
                                    <option>Offering</option>
                                    <option>Special Donation</option>
                                    <option>Building Fund</option>
                                    <option>Mission Fund</option>
                                </select>
                                <InputError message={errors.donation_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="payment_method" value="Payment Method" />
                                <select
                                    id="payment_method"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                >
                                    <option>Cash</option>
                                    <option>Check</option>
                                    <option>Bank Transfer</option>
                                    <option>Online</option>
                                </select>
                                <InputError message={errors.payment_method} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="donation_date" value="Date" />
                                <TextInput
                                    id="donation_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.donation_date}
                                    onChange={(e) => setData('donation_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.donation_date} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="notes" value="Notes (Optional)" />
                                <textarea
                                    id="notes"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows="2"
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-4 space-x-3">
                            <SecondaryButton onClick={() => setShowCreate(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Save Donation</PrimaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* List Table with Hierarchy Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                            <th className="p-4 hidden lg:table-cell">Conf / Dist / Society</th>
                            <th className="p-4">Member</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4 hidden md:table-cell">Type</th>
                            <th className="p-4 hidden md:table-cell">Method</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {donations.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 hidden lg:table-cell text-slate-600">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-xs text-slate-400">{d.local_society?.district?.annual_conference?.name || 'N/A'}</span>
                                        <span className="font-medium text-slate-700">{d.local_society?.district?.name || 'N/A'} &rarr; {d.local_society?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-slate-800">
                                    {d.member ? `${d.member.first_name} ${d.member.last_name}` : 'Unknown'}
                                </td>
                                <td className="p-4 font-semibold text-emerald-600">
                                    ${Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 hidden md:table-cell text-slate-600">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{d.donation_type}</span>
                                </td>
                                <td className="p-4 hidden md:table-cell text-slate-600">{d.payment_method}</td>
                                <td className="p-4 text-slate-600">{new Date(d.donation_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!donations?.length && <div className="p-8 text-center text-slate-500">No donations recorded yet.</div>}
            </div>
        </AuthenticatedLayout>
    );
}
