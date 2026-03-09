import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MODELS, getModel } from '../lib/models';

function costTier(model) {
  const total = model.costPer1k + model.costPer1kOutput;
  if (total < 0.002) return { label: '$ Low cost', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' };
  if (total < 0.02) return { label: '$$ Medium', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' };
  return { label: '$$$ Premium', bg: 'rgba(249,115,22,0.15)', color: '#f97316' };
}

export default function ModelSelector({ selected, onChange, credits }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const current = getModel(selected);

  // Calculate position when opening
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    // Delay to avoid closing immediately on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handler);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 8,
          cursor: 'pointer', color: 'var(--text)', fontSize: 14,
          fontWeight: 500, fontFamily: 'var(--font)',
        }}
      >
        <span>{current.icon}</span>
        <span>{current.name}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>▼</span>
      </button>

      {open && createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.5)', zIndex: 99999,
            }}
          />
          {/* Dropdown */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              background: '#18181f',
              border: '1px solid #2a2a3a',
              borderRadius: 12,
              padding: 8,
              minWidth: 340,
              zIndex: 100000,
              boxShadow: '0 16px 64px rgba(0,0,0,0.95)',
            }}
          >
            {MODELS.map(model => {
              const cost = costTier(model);
              const isActive = selected === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => { onChange(model.id); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? 'rgba(139,92,246,0.15)' : '#18181f',
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#222230'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(139,92,246,0.15)' : '#18181f'; }}
                >
                  <div style={{ fontSize: 20, marginTop: 2 }}>{model.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e4e4e7' }}>
                      {model.name}
                      <span style={{ fontWeight: 400, fontSize: 12, color: '#71717a', marginLeft: 8 }}>
                        {model.provider}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{model.description}</div>
                    <span style={{
                      display: 'inline-block', fontSize: 11, marginTop: 4,
                      padding: '2px 8px', borderRadius: 4,
                      background: cost.bg, color: cost.color,
                    }}>
                      {cost.label}
                    </span>
                  </div>
                </div>
              );
            })}
            <div style={{
              padding: '8px 12px', fontSize: 12, color: '#71717a',
              borderTop: '1px solid #2a2a3a', marginTop: 4,
            }}>
              Credits remaining: <strong style={{ color: '#22c55e' }}>${credits?.toFixed(2) || '0.00'}</strong>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
