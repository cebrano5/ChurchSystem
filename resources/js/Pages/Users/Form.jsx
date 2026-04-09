import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function UsersForm({ allowedRoles, scopes, adminUser }) {
    const isEditing = !!adminUser;

    const { data, setData, post, put, processing, errors } = useForm({
        name: adminUser?.name || '',
        email: adminUser?.email || '',
        username: adminUser?.username || '',
        role: adminUser?.role || '',
        scope_id: adminUser?.scope_id || '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('users.update', adminUser.id));
        } else {
            post(route('users.store'));
        }
    };

    const handleRoleChange = (e) => {
        setData(data => ({
            ...data,
            role: e.target.value,
            scope_id: '' // Reset scope when role changes
        }));
    };

    const renderScopeDropdown = () => {
        if (!data.role) return null;

        const scopeList = scopes[data.role] || [];
        
        if (scopeList.length === 0) {
            return <div className="text-red-500 text-sm mt-2">No organizations available to assign under your purview.</div>
        }

        return (
            <div className="mt-4">
                <InputLabel htmlFor="scope_id" value="Assign Scope / Organization" />
                <select
                    id="scope_id"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1"
                    value={data.scope_id}
                    onChange={(e) => setData('scope_id', e.target.value)}
                >
                    <option value="">-- Select an Organization --</option>
                    {scopeList.map(scopeItem => (
                        <option key={scopeItem.id} value={scopeItem.id}>
                            {scopeItem.name} 
                            {/* provide context if it's a society */}
                            {scopeItem.district ? ` (District: ${scopeItem.district.name})` : ''}
                        </option>
                    ))}
                </select>
                <InputError message={errors.scope_id} className="mt-2" />
            </div>
        );
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Edit Administrator' : 'Add Administrator'}>
            <Head title={isEditing ? 'Edit Admin' : 'Add Admin'} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-3xl mx-auto p-8">
                <form onSubmit={submit}>
                    
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
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
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                className="w-full mt-1"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="username" value="Login Username" />
                        <TextInput
                            id="username"
                            type="text"
                            className="w-full mt-1"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            required
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <InputLabel htmlFor="role" value="Account Role" />
                        <p className="text-xs text-slate-500 mb-2">Select the administrative capability for this user. You can only assign roles lower than your own.</p>
                        <select
                            id="role"
                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full mt-1"
                            value={data.role}
                            onChange={handleRoleChange}
                            required
                        >
                            <option value="">-- Select a Role --</option>
                            {allowedRoles.map(role => (
                                <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                        <InputError message={errors.role} className="mt-2" />

                        {renderScopeDropdown()}
                    </div>

                    <div className="mb-8">
                        <InputLabel htmlFor="password" value={isEditing ? 'Overwrite Password (Leaves unchanged if blank)' : 'Password'} />
                        {isEditing && <p className="text-xs text-slate-500 mb-1">Due to security policies, passwords are encrypted and cannot be viewed. If the user forgot their password, type a new one here to override it.</p>}
                        <TextInput
                            id="password"
                            type="text" // Made text intentionally so the creator can see what they are typing for the other user
                            className="w-full mt-1"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            required={!isEditing}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <PrimaryButton disabled={processing} className="bg-[#1e3a5f]">
                            {isEditing ? 'Save Changes' : 'Create Administrator'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
