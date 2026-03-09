import React from 'react';

const s = {
  badge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 8,
    background: '#12121a',
    border: '1px solid var(--border)',
  },
  label: { fontSize: 12, color: 'var(--text-muted)' },
  amount: (credits) => ({
    fontSize: 16,
    fontWeight: 700,
    color: credits > 0.50 ? 'var(--green)' : credits > 0.10 ? 'var(--orange)' : 'var(--red)',
  }),
  addBtn: {
    background: 'var(--green)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default function CreditsBadge({ credits }) {
  return (
    <div style={s.badge}>
      <div>
        <div style={s.label}>Credits</div>
        <div style={s.amount(credits)}>${credits?.toFixed(2) || '0.00'}</div>
      </div>
      <button style={s.addBtn} onClick={() => alert('Stripe integration coming soon!')}>
        + Add
      </button>
    </div>
  );
}
