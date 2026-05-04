import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout header="Profile Settings">
            <Head title="Profile" />

            <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>
                <div className="card" style={{ padding: '2rem' }}>
                    <UpdatePasswordForm />
                </div>
                <div className="card" style={{ padding: '2rem', borderColor: 'rgba(239,68,68,0.25)' }}>
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
