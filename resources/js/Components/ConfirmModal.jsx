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
                    borderRadius: '28px', // More bubbly rounded corners
                    padding: '2.25rem',
                    width: '100%',
                    maxWidth: '440px',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
                    animation: 'bubblePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative Bubble Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(212,160,23,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}></div>

                {/* Close X */}
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 10,
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                    }}
                >
                    <XMarkIcon style={{ width: '1rem', height: '1rem' }} />
                </button>

                {/* Warning icon */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '20px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    animation: 'iconPulse 2s infinite ease-in-out',
                }}>
                    <ExclamationTriangleIcon style={{ width: '1.75rem', height: '1.75rem', color: '#f87171' }} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.02em',
                }}>
                    {title}
                </h2>

                {/* Message */}
                <p style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                }}>
                    {message}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ padding: '0.7rem 1.5rem', borderRadius: '14px' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.7rem 1.5rem',
                            borderRadius: '14px',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 15px rgba(239,68,68,0.4)',
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,68,68,0.6)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.4)';
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
                @keyframes bubblePop {
                    0%   { opacity: 0; transform: scale(0.4) translateY(40px); filter: blur(10px); }
                    70%  { opacity: 1; transform: scale(1.1) translateY(-10px); filter: blur(0px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes iconPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50%      { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
