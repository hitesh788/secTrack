import { ShieldAlert, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#dc2626'
                    }}>
                        <ShieldAlert size={32} />
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>{title}</h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>{message}</p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-outline"
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={onClose}
                        >
                            Abort
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.75rem', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            Confirm Purge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
