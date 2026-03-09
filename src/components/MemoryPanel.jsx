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
  list: { flex: 1, overflowY: 'auto', padding: 12 },
  item: {
    padding: '10px 12px',
    borderRadius: 8,
    background: '#12121a',
    border: '1px solid var(--border)',
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 1.5,
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
  importance: (v) => ({
    display: 'inline-block',
    width: 40,
    height: 4,
    borderRadius: 2,
    background: 'var(--border)',
    position: 'relative',
    overflow: 'hidden',
  }),
  empty: {
    padding: 24,
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
};

export default function MemoryPanel({ memories }) {
  return (
    <>
      <div style={s.header}>
        <span>🧠</span> Memories
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
          {memories.length} stored
        </span>
      </div>
      <div style={s.list}>
        {memories.length === 0 ? (
          <div style={s.empty}>
            No memories yet. Start chatting and your AI will learn about you!
          </div>
        ) : (
          memories.map((mem, i) => (
            <div key={mem.id || i} style={s.item}>
              <div style={{ color: 'var(--text)' }}>{mem.content}</div>
              <div style={s.meta}>
                <div>
                  {mem.tags?.map((t, j) => <span key={j} style={s.tag}>{t}</span>)}
                </div>
                <div>{(mem.similarity * 100).toFixed(0)}% relevant</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
