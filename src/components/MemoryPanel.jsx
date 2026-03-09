import React from 'react';

const s = {
  header: {
    padding: '16px',
    borderBottom: '1px solid var(--border)',
    fontWeight: 700,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--red)',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 6,
    padding: '3px 10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: 'var(--font)',
  },
  count: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 },
  list: { flex: 1, overflowY: 'auto', padding: 12 },
  item: {
    padding: '10px 12px',
    borderRadius: 8,
    background: '#12121a',
    border: '1px solid var(--border)',
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 1.5,
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 14,
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: 'var(--font)',
    opacity: 0.5,
    transition: 'opacity 0.15s',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  tag: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 4,
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
    fontSize: 10,
    marginRight: 4,
  },
  importanceBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
};

function importanceLabel(v) {
  if (v >= 0.8) return { text: '🔴 High', color: 'var(--red)' };
  if (v >= 0.5) return { text: '🟡 Med', color: 'var(--orange)' };
  return { text: '🟢 Low', color: 'var(--green)' };
}

export default function MemoryPanel({ memories, onDeleteMemory, onClearAll }) {
  return (
    <>
      <div style={s.header}>
        <span>🧠</span> Memories
        <span style={s.count}>{memories.length} stored</span>
        {memories.length > 0 && onClearAll && (
          <button style={s.clearBtn} onClick={() => {
            if (confirm('Delete ALL memories? This cannot be undone.')) onClearAll();
          }}>
            Clear All
          </button>
        )}
      </div>
      <div style={s.list}>
        {memories.length === 0 ? (
          <div style={s.empty}>
            No memories yet. Start chatting and your AI will learn about you!
          </div>
        ) : (
          memories.map((mem, i) => {
            const imp = importanceLabel(mem.importance || 0.5);
            return (
              <div
                key={mem.id || i}
                style={s.item}
                onMouseEnter={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity = '1'; }}
                onMouseLeave={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity = '0.3'; }}
              >
                <div style={{ color: 'var(--text)', paddingRight: 24 }}>{mem.content}</div>
                {onDeleteMemory && (
                  <button
                    className="del-btn"
                    style={{ ...s.deleteBtn, opacity: 0.3 }}
                    onClick={() => onDeleteMemory(mem.id)}
                    title="Delete this memory"
                  >
                    ✕
                  </button>
                )}
                <div style={s.meta}>
                  <div>
                    {mem.tags?.map((t, j) => <span key={j} style={s.tag}>{t}</span>)}
                  </div>
                  <div style={s.importanceBar}>
                    <span style={{ color: imp.color }}>{imp.text}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
