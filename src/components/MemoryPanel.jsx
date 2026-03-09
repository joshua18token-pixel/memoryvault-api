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
  settingsBtn: {
    marginLeft: 'auto',
    fontSize: 14,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: 'var(--font)',
    opacity: 0.5,
    transition: 'opacity 0.15s',
  },
  settingsMenu: {
    position: 'absolute',
    top: '100%',
    right: 8,
    marginTop: 4,
    background: '#16161f',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: 4,
    zIndex: 100,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    minWidth: 180,
  },
  settingsItem: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font)',
    transition: 'background 0.15s',
  },
  dangerItem: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    color: 'var(--red)',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font)',
    transition: 'background 0.15s',
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
  'About Me': { icon: '👤', color: '#8b5cf6', match: ['personal', 'identity', 'name', 'age', 'location', 'birthday', 'bio'] },
  'Family': { icon: '👨‍👩‍👧', color: '#06b6d4', match: ['family', 'daughter', 'son', 'wife', 'husband', 'kids', 'children', 'parent', 'brother', 'sister', 'mom', 'dad', 'pet', 'dog', 'cat'] },
  'Sports': { icon: '⚽', color: '#22c55e', match: ['sports', 'soccer', 'football', 'college football', 'basketball', 'baseball', 'mls', 'nfl', 'nba', 'team', 'player', 'coach', 'game', 'match', 'league', 'championship'] },
  'Education': { icon: '🎓', color: '#eab308', match: ['education', 'school', 'university', 'college', 'class', 'course', 'study', 'studying', 'homework', 'exam', 'test', 'grade', 'degree', 'major', 'professor', 'teacher', 'student', 'learning', 'lecture', 'thesis', 'research', 'tutor', 'math', 'science', 'english', 'history'] },
  'Work & Projects': { icon: '💼', color: '#3b82f6', match: ['work', 'project', 'building', 'career', 'job', 'business', 'startup', 'company', 'coding', 'app'] },
  'Health & Wellness': { icon: '🏥', color: '#ef4444', match: ['health', 'medical', 'doctor', 'medicine', 'exercise', 'gym', 'diet', 'nutrition', 'sleep', 'mental health', 'therapy', 'allergy', 'condition'] },
  'Finance': { icon: '💰', color: '#10b981', match: ['finance', 'money', 'budget', 'invest', 'savings', 'salary', 'expense', 'crypto', 'stocks', 'bank'] },
  'Music': { icon: '🎵', color: '#ec4899', match: ['music', 'drums', 'guitar', 'instrument', 'band', 'song', 'album', 'concert', 'playlist'] },
  'Food & Cooking': { icon: '🍽️', color: '#f97316', match: ['food', 'cooking', 'recipe', 'restaurant', 'meal', 'diet', 'favorite food', 'cuisine', 'coffee', 'drink'] },
  'Travel': { icon: '✈️', color: '#0ea5e9', match: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'destination', 'country', 'city', 'visit'] },
  'Entertainment': { icon: '🎬', color: '#d97706', match: ['movies', 'tv', 'shows', 'documentaries', 'coaching', 'analysis', 'gaming', 'netflix', 'youtube', 'book', 'reading', 'podcast'] },
  'Interests': { icon: '💡', color: '#f97316', match: ['interest', 'hobbies', 'hobby', 'likes', 'preference'] },
  'Knowledge': { icon: '📚', color: '#6366f1', match: ['players', 'facts', 'history', 'stats', 'trivia', 'info'] },
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
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

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
      <div style={{ ...s.header, position: 'relative' }}>
        <span>🧠</span> Memories
        <span style={s.count}>{memories.length}</span>
        {memories.length > 0 && onClearAll && (
          <>
            <button
              style={s.settingsBtn}
              onClick={() => { setShowSettings(!showSettings); setConfirmClear(false); }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0.5'}
              title="Memory settings"
            >
              ⚙️
            </button>
            {showSettings && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setShowSettings(false); setConfirmClear(false); }} />
                <div style={s.settingsMenu}>
                  {!confirmClear ? (
                    <button
                      style={s.dangerItem}
                      onClick={() => setConfirmClear(true)}
                      onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      🗑 Reset all memories...
                    </button>
                  ) : (
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>
                        ⚠️ This will permanently erase everything the AI knows about you.
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { onClearAll(); setShowSettings(false); setConfirmClear(false); }}
                          style={{ flex: 1, padding: '6px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
                        >
                          Yes, erase all
                        </button>
                        <button
                          onClick={() => { setShowSettings(false); setConfirmClear(false); }}
                          style={{ flex: 1, padding: '6px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
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
