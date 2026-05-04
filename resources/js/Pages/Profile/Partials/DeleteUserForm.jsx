import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.1rem', fontWeight: 800, color: '#f87171'
                }}>
                    Danger Zone: Delete Account
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. This action cannot be undone.
                </p>
            </header>

            <button onClick={confirmUserDeletion} className="btn-danger">
                Permanently Delete Account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} style={{ padding: '2rem' }}>
                    <h2 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)'
                    }}>
                        Confirm Account Deletion
                    </h2>

                    <p style={{
                        fontSize: '0.875rem', color: 'var(--text-secondary)',
                        marginTop: '0.75rem', lineHeight: 1.6
                    }}>
                        Enter your password to confirm you want to permanently delete your account.
                    </p>

                    <div className="mt-6">
                        <label htmlFor="password" style={{ display: 'none' }}>Password</label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="form-input"
                            autoFocus
                            placeholder="Current Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>

                        <button type="submit" className="btn-danger" disabled={processing}>
                            {processing ? 'Deleting…' : 'Delete My Account'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
