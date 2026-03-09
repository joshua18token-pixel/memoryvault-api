import React, { useState } from 'react';
import { MODELS, getModel } from '../lib/models';

const s = {
  wrapper: { position: 'relative' },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--text)',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--font)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 8,
    minWidth: 320,
    zIndex: 50,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  option: (active) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    background: active ? 'var(--primary-glow)' : 'transparent',
    transition: 'background 0.15s',
  }),
  optionIcon: { fontSize: 20, marginTop: 2 },
  optionName: { fontWeight: 600, fontSize: 14 },
  optionDesc: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  optionCost: {
    fontSize: 11,
    marginTop: 4,
    padding: '2px 8px',
    borderRadius: 4,
    display: 'inline-block',
  },
  lowCost: { background: 'rgba(34,197,94,0.15)', color: 'var(--green)' },
  medCost: { background: 'rgba(59,130,246,0.15)', color: 'var(--blue)' },
  highCost: { background: 'rgba(249,115,22,0.15)', color: 'var(--orange)' },
};

function costTier(model) {
  const total = model.costPer1k + model.costPer1kOutput;
  if (total < 0.002) return { label: '$ Low cost', style: s.lowCost };
  if (total < 0.02) return { label: '$$ Medium', style: s.medCost };
  return { label: '$$$ Premium', style: s.highCost };
}

export default function ModelSelector({ selected, onChange, credits }) {
  const [open, setOpen] = useState(false);
  const current = getModel(selected);

  return (
    <div style={s.wrapper}>
      <button style={s.trigger} onClick={() => setOpen(!open)}>
        <span>{current.icon}</span>
        <span>{current.name}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={s.dropdown}>
            {MODELS.map(model => {
              const cost = costTier(model);
              return (
                <div
                  key={model.id}
                  style={s.option(selected === model.id)}
                  onClick={() => { onChange(model.id); setOpen(false); }}
                >
                  <div style={s.optionIcon}>{model.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.optionName}>
                      {model.name}
                      <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                        {model.provider}
                      </span>
                    </div>
                    <div style={s.optionDesc}>{model.description}</div>
                    <span style={{ ...s.optionCost, ...cost.style }}>{cost.label}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginTop: 4 }}>
              Credits remaining: <strong style={{ color: 'var(--green)' }}>${credits?.toFixed(2) || '0.00'}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
