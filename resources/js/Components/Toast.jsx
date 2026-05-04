import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Toast – a bubbly floating notification.
 */
export default function Toast({ message, type = 'success', onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Allow exit animation
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                paddingRight: '0.5rem',
                borderRadius: '16px',
                background: isSuccess ? 'linear-gradient(135deg, #0f1e35 0%, #1c3254 100%)' : '#2d1a1a',
                border: `1px solid ${isSuccess ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                color: '#fff',
                animation: visible ? 'toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'toastOut 0.3s ease forwards',
                maxWidth: '320px',
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: isSuccess ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                flexShrink: 0,
            }}>
                {isSuccess ? (
                    <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                ) : (
                    <ExclamationCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: '#f87171' }} />
                )}
            </div>

            <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                {message}
            </div>

            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                style={{
                    padding: '0.4rem',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
            >
                <XMarkIcon style={{ width: '1rem', height: '1rem' }} />
            </button>

            <style>{`
                @keyframes toastIn {
                    0% { transform: translateY(100%) scale(0.8); opacity: 0; }
                    70% { transform: translateY(-10%) scale(1.05); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes toastOut {
                    to { transform: translateX(100%) scale(0.8); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
