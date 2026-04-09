import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DistrictForm({ district, admin, conferences }) {
    const isEditing = !!district;

    const { data, setData, post, put, processing, errors } = useForm({
        annual_conference_id: district?.annual_conference_id || '',
        name: district?.name || '',
        description: district?.description || '',
        // Admin credentials
        admin_name: admin?.name || '',
        admin_username: admin?.username || '',
        admin_password: '',
    });


    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('districts.update', district.id));
        } else {
            post(route('districts.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit District' : 'Add District'}>
            <Head title={isEditing ? 'Edit District' : 'Add District'} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-8">
                <form onSubmit={submit}>
                    
                    <div className="mb-6">
                        <InputLabel htmlFor="annual_conference_id" value="Parent Annual Conference" />
                        <select
                            id="annual_conference_id"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1"
                            value={data.annual_conference_id}
                            onChange={(e) => setData('annual_conference_id', e.target.value)}
                            required
                        >
                            <option value="">-- Select a Conference --</option>
                            {conferences.map(conf => (
                                <option key={conf.id} value={conf.id}>
                                    {conf.name}
                                </option>
                            ))}
                        </select>
                        {conferences.length === 0 && (
                            <p className="text-red-500 text-sm mt-1">No conferences are available in your scope to assign.</p>
                        )}
                        <InputError message={errors.annual_conference_id} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="District Name" />
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

                    <div className="mb-8">
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1 h-32"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        ></textarea>
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Administrator Credentials</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Assign or update the primary administrator for this district.
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
                            {isEditing ? 'Save Changes' : 'Create District'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
