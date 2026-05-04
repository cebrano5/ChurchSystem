import { useEffect, useRef } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * ConfirmModal – a premium dark-themed confirmation dialog.
 *
 * Props:
 *   show       {boolean}  – controls visibility
 *   title      {string}   – headline text
 *   message    {string}   – body description
 *   confirmLabel {string} – label for the confirm button (default "Delete")
 *   onConfirm  {fn}       – called when user clicks confirm
 *   onCancel   {fn}       – called when user clicks cancel / backdrop
 */
export default function ConfirmModal({
    show = false,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);

    // Focus trap: focus cancel button when modal opens
    useEffect(() => {
        if (show) {
            setTimeout(() => cancelRef.current?.focus(), 50);
        }
    }, [show]);

    // Close on Escape
    useEffect(() => {
        if (!show) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [show, onCancel]);

    if (!show) return null;

    return (
        /* Backdrop */
        <div
            onClick={onCancel}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(5, 12, 24, 0.8)',
                backdropFilter: 'blur(6px)',
                animation: 'fadeIn 0.18s ease',
            }}
        >
            {/* Panel */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(160deg, #1c3254 0%, #162945 100%)',
                    border: '1px solid rgba(212,160,23,0.2)',
                    borderRadius: '20px',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    animation: 'springPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                }}
            >
                {/* Close X */}
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.15s',
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <XMarkIcon style={{ width: '0.9rem', height: '0.9rem' }} />
                </button>

                {/* Warning icon */}
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                }}>
                    <ExclamationTriangleIcon style={{ width: '1.5rem', height: '1.5rem', color: '#f87171' }} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                }}>
                    {title}
                </h2>

                {/* Message */}
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '1.75rem',
                }}>
                    {message}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            boxShadow: '0 2px 12px rgba(239,68,68,0.35)',
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.5)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(239,68,68,0.35)';
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes springPop {
                    0% { opacity: 0; transform: translateY(30px) scale(0.9); }
                    60% { opacity: 1; transform: translateY(-5px) scale(1.05); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
