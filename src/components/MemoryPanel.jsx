import React, { useState, useMemo } from 'react';

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
  list: { flex: 1, overflowY: 'auto', padding: 8 },
  category: {
    marginBottom: 4,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    transition: 'background 0.15s',
    userSelect: 'none',
  },
  categoryCount: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 400,
  },
  arrow: (open) => ({
    fontSize: 10,
    transition: 'transform 0.2s',
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    color: 'var(--text-muted)',
  }),
  categoryItems: {
    paddingLeft: 8,
    paddingBottom: 4,
  },
  item: {
    padding: '8px 10px',
    borderRadius: 8,
    background: '#12121a',
    border: '1px solid var(--border)',
    marginBottom: 4,
    fontSize: 12,
    lineHeight: 1.5,
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 12,
    padding: '2px 5px',
    borderRadius: 4,
    fontFamily: 'var(--font)',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
  },
  tag: {
    display: 'inline-block',
    padding: '1px 5px',
    borderRadius: 3,
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
    fontSize: 9,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
};

// Category definitions with icons and color
const CATEGORIES = {
  'About Me': { icon: '👤', color: '#8b5cf6', match: ['personal', 'identity', 'name', 'age', 'location'] },
  'Sports': { icon: '⚽', color: '#22c55e', match: ['sports', 'soccer', 'football', 'college football', 'basketball', 'baseball', 'mls', 'nfl', 'nba'] },
  'Interests': { icon: '💡', color: '#f97316', match: ['interest', 'hobbies', 'hobby', 'likes', 'preference'] },
  'Work & Projects': { icon: '💼', color: '#3b82f6', match: ['work', 'project', 'building', 'career', 'job', 'business'] },
  'Music': { icon: '🎵', color: '#ec4899', match: ['music', 'drums', 'guitar', 'instrument', 'band'] },
  'Family': { icon: '👨‍👩‍👧', color: '#06b6d4', match: ['family', 'daughter', 'son', 'wife', 'husband', 'kids', 'children'] },
  'Entertainment': { icon: '🎬', color: '#d97706', match: ['movies', 'tv', 'shows', 'documentaries', 'coaching', 'analysis', 'gaming'] },
  'Knowledge': { icon: '📚', color: '#6366f1', match: ['players', 'facts', 'history', 'stats'] },
};

function categorizeMemory(mem) {
  const text = (mem.content || '').toLowerCase();
  const tags = (mem.tags || []).map(t => t.toLowerCase());
  const all = [...tags, ...text.split(/\s+/)];

  let bestCat = null;
  let bestScore = 0;

  for (const [catName, cat] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const keyword of cat.match) {
      if (tags.includes(keyword)) score += 3;
      else if (text.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCat = catName;
    }
  }

  return bestCat || 'Other';
}

function CategoryGroup({ name, icon, color, memories, onDeleteMemory, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={s.category}>
      <div
        style={{ ...s.categoryHeader, background: open ? 'rgba(255,255,255,0.03)' : 'transparent' }}
        onClick={() => setOpen(!open)}
      >
        <span style={s.arrow(open)}>▶</span>
        <span>{icon}</span>
        <span>{name}</span>
        <span style={s.categoryCount}>{memories.length}</span>
      </div>
      {open && (
        <div style={s.categoryItems}>
          {memories.map((mem, i) => (
            <div
              key={mem.id || i}
              style={s.item}
              onMouseEnter={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity = '1'; }}
              onMouseLeave={e => { const btn = e.currentTarget.querySelector('.del-btn'); if (btn) btn.style.opacity = '0'; }}
            >
              <div style={{ color: 'var(--text)', paddingRight: 20 }}>{mem.content}</div>
              {onDeleteMemory && (
                <button
                  className="del-btn"
                  style={s.deleteBtn}
                  onClick={() => onDeleteMemory(mem.id)}
                  title="Delete"
                >
                  ✕
                </button>
              )}
              {mem.tags?.length > 0 && (
                <div style={s.tags}>
                  {mem.tags.map((t, j) => <span key={j} style={s.tag}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MemoryPanel({ memories, onDeleteMemory, onClearAll }) {
  const grouped = useMemo(() => {
    const groups = {};
    for (const mem of memories) {
      const cat = categorizeMemory(mem);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(mem);
    }
    // Sort categories: About Me first, then by count
    const sorted = Object.entries(groups).sort((a, b) => {
      if (a[0] === 'About Me') return -1;
      if (b[0] === 'About Me') return 1;
      return b[1].length - a[1].length;
    });
    return sorted;
  }, [memories]);

  return (
    <>
      <div style={s.header}>
        <span>🧠</span> Memories
        <span style={s.count}>{memories.length}</span>
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
          grouped.map(([catName, mems]) => {
            const catDef = CATEGORIES[catName] || { icon: '📁', color: '#71717a' };
            return (
              <CategoryGroup
                key={catName}
                name={catName}
                icon={catDef.icon}
                color={catDef.color}
                memories={mems}
                onDeleteMemory={onDeleteMemory}
                defaultOpen={true}
              />
            );
          })
        )}
      </div>
    </>
  );
}
