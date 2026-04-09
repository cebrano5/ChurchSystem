import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function SocietyForm({ society, districts }) {
    const isEditing = !!society;

    const { data, setData, post, put, processing, errors } = useForm({
        district_id: society?.district_id || '',
        name: society?.name || '',
        address: society?.address || '',
        contact_person: society?.contact_person || '',
        contact_phone: society?.contact_phone || '',
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
