import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ConferenceForm({ conference }) {
    const isEditing = !!conference;

    // Default to today for established_at if creating a new one
    const defaultDate = conference?.established_at 
        ? new Date(conference.established_at).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        name: conference?.name || '',
        region: conference?.region || '',
        description: conference?.description || '',
        established_at: defaultDate,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('conferences.update', conference.id));
        } else {
            post(route('conferences.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Annual Conference' : 'Add Annual Conference'}>
            <Head title={isEditing ? 'Edit Conference' : 'Add Conference'} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-8">
                <form onSubmit={submit}>
                    
                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Conference Name" />
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

                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="region" value="Geographical Region" />
                            <TextInput
                                id="region"
                                type="text"
                                className="w-full mt-1"
                                value={data.region}
                                onChange={e => setData('region', e.target.value)}
                                required
                            />
                            <InputError message={errors.region} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="established_at" value="Established Date" />
                            <TextInput
                                id="established_at"
                                type="date"
                                className="w-full mt-1"
                                value={data.established_at}
                                onChange={e => setData('established_at', e.target.value)}
                                required
                            />
                            <InputError message={errors.established_at} className="mt-2" />
                        </div>
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
                            {isEditing ? 'Save Changes' : 'Create Conference'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
