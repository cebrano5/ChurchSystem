import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function MembersForm({ member, ministries }) {
    const isEditing = !!member;

    const initialMinistries = member?.ministries?.map(m => m.id) || [];

    const { data, setData, post, put, processing, errors } = useForm({
        first_name: member?.first_name || '',
        last_name: member?.last_name || '',
        email: member?.email || '',
        phone: member?.phone || '',
        status: member?.status || 'Active',
        ministry_ids: initialMinistries,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('members.update', member.id));
        } else {
            post(route('members.store'));
        }
    };

    const handleMinistryChange = (id, checked) => {
        if (checked) {
            setData('ministry_ids', [...data.ministry_ids, id]);
        } else {
            setData('ministry_ids', data.ministry_ids.filter(mId => mId !== id));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Member' : 'Add Member'}>
            <Head title={isEditing ? 'Edit Member' : 'Add Member'} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-8">
                <form onSubmit={submit}>
                    
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="first_name" value="First Name" />
                            <TextInput
                                id="first_name"
                                type="text"
                                className="w-full mt-1"
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="last_name" value="Last Name" />
                            <TextInput
                                id="last_name"
                                type="text"
                                className="w-full mt-1"
                                value={data.last_name}
                                onChange={e => setData('last_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                className="w-full mt-1"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="phone" value="Phone Number" />
                            <TextInput
                                id="phone"
                                type="text"
                                className="w-full mt-1"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="status" value="Membership Status" />
                        <select
                            id="status"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            required
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <InputError message={errors.status} className="mt-2" />
                    </div>

                    <div className="mb-8 pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Ministry Assignments</h3>
                        {ministries.length === 0 ? (
                            <p className="text-sm text-slate-500">No ministries have been created in this society yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ministries.map(ministry => (
                                    <label key={ministry.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                        <Checkbox
                                            value={ministry.id}
                                            checked={data.ministry_ids.includes(ministry.id)}
                                            onChange={(e) => handleMinistryChange(ministry.id, e.target.checked)}
                                        />
                                        <span className="text-slate-700 font-medium">{ministry.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <InputError message={errors.ministry_ids} className="mt-2" />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <PrimaryButton disabled={processing} className="bg-[#1e3a5f]">
                            {isEditing ? 'Save Changes' : 'Create Member'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
