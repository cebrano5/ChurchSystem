import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function SocietyForm({ society, admin, districts }) {
    const isEditing = !!society;

    const { data, setData, post, put, processing, errors } = useForm({
        district_id: society?.district_id || '',
        name: society?.name || '',
        address: society?.address || '',
        contact_person: society?.contact_person || '',
        contact_phone: society?.contact_phone || '',
        // Admin credentials
        admin_name: admin?.name || '',
        admin_username: admin?.username || '',
        admin_password: '',
    });


    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('societies.update', society.id));
        } else {
            post(route('societies.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Local Society' : 'Add Local Society'}>
            <Head title={isEditing ? 'Edit Society' : 'Add Society'} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-8">
                <form onSubmit={submit}>
                    
                    <div className="mb-6">
                        <InputLabel htmlFor="district_id" value="Parent District" />
                        <select
                            id="district_id"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1"
                            value={data.district_id}
                            onChange={(e) => setData('district_id', e.target.value)}
                            required
                        >
                            <option value="">-- Select a District --</option>
                            {districts.map(dist => (
                                <option key={dist.id} value={dist.id}>
                                    {dist.name} (Conference: {dist.annual_conference ? dist.annual_conference.name : 'Unknown'})
                                </option>
                            ))}
                        </select>
                        {districts.length === 0 && (
                            <p className="text-red-500 text-sm mt-1">No districts are available in your scope to assign.</p>
                        )}
                        <InputError message={errors.district_id} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Society Name (Church Name)" />
                        <TextInput
                            id="name"
                            type="text"
                            className="w-full mt-1"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="address" value="Physical Address" />
                        <TextInput
                            id="address"
                            type="text"
                            className="w-full mt-1"
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            required
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>

                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="contact_person" value="Contact Person (e.g., Lead Pastor)" />
                            <TextInput
                                id="contact_person"
                                type="text"
                                className="w-full mt-1"
                                value={data.contact_person}
                                onChange={e => setData('contact_person', e.target.value)}
                                required
                            />
                            <InputError message={errors.contact_person} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="contact_phone" value="Contact Phone Number" />
                            <TextInput
                                id="contact_phone"
                                type="text"
                                className="w-full mt-1"
                                value={data.contact_phone}
                                onChange={e => setData('contact_phone', e.target.value)}
                                required
                            />
                            <InputError message={errors.contact_phone} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Administrator Credentials</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Assign or update the primary administrator for this local society.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <InputLabel htmlFor="admin_name" value="Admin Display Name" />
                                <TextInput
                                    id="admin_name"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.admin_name}
                                    onChange={e => setData('admin_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.admin_name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="admin_username" value="Admin Username (Login ID)" />
                                <TextInput
                                    id="admin_username"
                                    type="text"
                                    className="w-full mt-1"
                                    value={data.admin_username}
                                    onChange={e => setData('admin_username', e.target.value)}
                                    required
                                />
                                <InputError message={errors.admin_username} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="admin_password" value={isEditing ? "Admin Password (leave blank to keep current)" : "Admin Password"} />
                                <TextInput
                                    id="admin_password"
                                    type="password"
                                    className="w-full mt-1"
                                    value={data.admin_password}
                                    onChange={e => setData('admin_password', e.target.value)}
                                    required={!isEditing}
                                />
                                <InputError message={errors.admin_password} className="mt-2" />
                            </div>
                        </div>
                    </div>


                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <PrimaryButton disabled={processing} className="bg-[#1e3a5f]">
                            {isEditing ? 'Save Changes' : 'Create Local Society'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
