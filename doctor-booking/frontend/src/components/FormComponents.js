import React from 'react';

export const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, color: '#1e293b', background: '#fff',
  transition: 'border-color 0.15s',
};

export const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: '#475569', marginBottom: 6,
};

export function Field({ label, error, children, half }) {
  return (
    <div style={{ marginBottom: 16, gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export function FormGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, loading, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '10px 24px', border: 'none', borderRadius: 8,
        background: 'var(--teal)', color: '#fff', fontWeight: 600,
        fontSize: 14, opacity: (disabled || loading) ? 0.7 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading ? 'Saving...' : children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px', border: '1.5px solid #e2e8f0',
        borderRadius: 8, background: '#fff', color: '#475569',
        fontWeight: 500, fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}
