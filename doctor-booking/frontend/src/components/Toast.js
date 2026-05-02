import React from 'react';

const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
const colors = {
  success: '#0d9488',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export default function Toast({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors[t.type] || colors.success,
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 240,
            maxWidth: 360,
            fontSize: 14,
            fontWeight: 500,
            animation: 'slideIn 0.2s ease',
          }}
        >
          <span style={{ fontSize: 16 }}>{icons[t.type] || icons.success}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}
