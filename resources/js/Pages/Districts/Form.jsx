import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function DistrictForm({ district, conferences }) {
    const isEditing = !!district;

    const { data, setData, post, put, processing, errors } = useForm({
        annual_conference_id: district?.annual_conference_id || '',
        name: district?.name || '',
        description: district?.description || '',
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
