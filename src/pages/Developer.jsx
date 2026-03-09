import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

const s = {
  page: { paddingTop: 80, minHeight: '100vh', maxWidth: 1100, margin: '0 auto', padding: '80px 24px 80px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800 },
  backLink: { color: 'var(--primary)', fontSize: 14, textDecoration: 'none', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20,
  },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: 28, fontWeight: 800, marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  keyRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid var(--border)',
  },
  keyName: { fontWeight: 600, fontSize: 14 },
  keyMeta: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  keyId: { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', background: '#1a1a26', padding: '2px 8px', borderRadius: 4 },
  badge: (active) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
    background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color: active ? 'var(--green)' : 'var(--red)',
  }),
  revokeBtn: {
    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6,
    color: 'var(--red)', padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)',
  },
  createBtn: {
    background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
  },
  input: {
    background: '#1a1a26', border: '1px solid var(--border)', borderRadius: 8,
    padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)',
    outline: 'none', width: 250, marginRight: 8,
  },
  newKeyBanner: {
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8,
    padding: 16, marginBottom: 16,
  },
  newKeyValue: {
    fontFamily: 'var(--mono)', fontSize: 14, background: '#0d0d14', padding: '8px 12px',
    borderRadius: 6, marginTop: 8, wordBreak: 'break-all', color: 'var(--green)',
  },
  codeBlock: {
    background: '#0d0d14', border: '1px solid var(--border)', borderRadius: 8,
    padding: 16, fontSize: 13, fontFamily: 'var(--mono)', lineHeight: 1.7,
    overflowX: 'auto', color: '#a5b4fc', marginTop: 12,
  },
  nsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14,
  },
  nsCount: { fontWeight: 700, color: 'var(--primary)' },
  tierBadge: (tier) => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
    background: tier === 'free' ? 'rgba(34,197,94,0.15)' : tier === 'builder' ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
    color: tier === 'free' ? 'var(--green)' : tier === 'builder' ? 'var(--blue)' : 'var(--primary)',
    textTransform: 'uppercase',
  }),
};

export default function Developer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [usage, setUsage] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) { loadKeys(); loadUsage(); }
  }, [user]);

  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' };
  }

  async function loadKeys() {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/developer/keys', { headers });
    const data = await res.json();
    setKeys(data.keys || []);
  }

  async function loadUsage() {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/developer/usage', { headers });
    const data = await res.json();
    setUsage(data);
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/developer/keys', {
      method: 'POST', headers,
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    setNewKey(data.api_key);
    setNewKeyName('');
    setCreating(false);
    loadKeys();
  }

  async function revokeKey(id) {
    if (!confirm('Revoke this API key? Any apps using it will stop working.')) return;
    const headers = await getAuthHeaders();
    await fetch(`/api/v1/developer/keys?id=${id}`, { method: 'DELETE', headers });
    loadKeys();
  }

  if (loading) return <div style={s.page}>Loading...</div>;

  return (
    <main style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🔧 Developer Dashboard</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Manage API keys, monitor usage, and integrate MemoryVault
          </div>
        </div>
        <span style={s.backLink} onClick={() => navigate('/app')}>← Back to Chat</span>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>Total Memories</div>
          <div style={s.statValue}>{usage?.total_memories?.toLocaleString() || 0}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>API Keys</div>
          <div style={s.statValue}>{keys.filter(k => k.is_active !== false).length}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Credits</div>
          <div style={{ ...s.statValue, color: 'var(--green)' }}>${usage?.credits_remaining?.toFixed(2) || '0.00'}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Plan</div>
          <div style={{ marginTop: 8 }}>
            <span style={s.tierBadge(usage?.tier || 'free')}>{usage?.tier || 'free'}</span>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div style={s.section}>
        <div style={s.sectionTitle}>🔑 API Keys</div>
        <div style={s.card}>
          {newKey && (
            <div style={s.newKeyBanner}>
              <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>
                ✅ New API key created! Copy it now — you won't see it again.
              </div>
              <div style={s.newKeyValue}>{newKey}</div>
              <button
                onClick={() => { navigator.clipboard.writeText(newKey); }}
                style={{ marginTop: 8, background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <input
              style={s.input}
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Production, Dev)"
              onKeyDown={e => e.key === 'Enter' && createKey()}
            />
            <button style={s.createBtn} onClick={createKey} disabled={creating}>
              {creating ? 'Creating...' : '+ Create Key'}
            </button>
          </div>

          {keys.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No API keys yet. Create one to start integrating.
            </div>
          ) : (
            keys.map(key => (
              <div key={key.id} style={s.keyRow}>
                <div>
                  <div style={s.keyName}>{key.name}</div>
                  <div style={s.keyMeta}>
                    <span style={s.keyId}>{key.project_id.substring(0, 8)}...</span>
                    {' · '}Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={s.badge(key.is_active !== false)}>
                    {key.is_active !== false ? 'Active' : 'Revoked'}
                  </span>
                  {key.is_active !== false && (
                    <button style={s.revokeBtn} onClick={() => revokeKey(key.id)}>Revoke</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Namespaces */}
      {usage?.memories_by_namespace?.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>📊 Memory Namespaces</div>
          <div style={s.card}>
            {usage.memories_by_namespace.map((ns, i) => (
              <div key={i} style={s.nsRow}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{ns.namespace}</span>
                <span style={s.nsCount}>{ns.count} memories</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start */}
      <div style={s.section}>
        <div style={s.sectionTitle}>⚡ Quick Start</div>
        <div style={s.card}>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
            Store a memory:
          </div>
          <pre style={s.codeBlock}>{`curl -X POST https://memoryvault-api.vercel.app/api/v1/memories \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "namespace": "user_123",
    "content": "User prefers dark mode",
    "importance": 0.8
  }'`}</pre>

          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, marginTop: 24 }}>
            Recall memories:
          </div>
          <pre style={s.codeBlock}>{`curl -X POST https://memoryvault-api.vercel.app/api/v1/memories/recall \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "namespace": "user_123",
    "query": "what are user preferences?"
  }'`}</pre>

          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, marginTop: 24 }}>
            Auto-extract from conversation:
          </div>
          <pre style={s.codeBlock}>{`curl -X POST https://memoryvault-api.vercel.app/api/v1/memories/extract \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "namespace": "user_123",
    "conversation": "User: My name is Drew..."
  }'`}</pre>

          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, marginTop: 24 }}>
            MCP Server (Claude, Cursor, OpenClaw):
          </div>
          <pre style={s.codeBlock}>{`// Add to your MCP config
{
  "mcpServers": {
    "memoryvault": {
      "command": "npx",
      "args": ["memoryvault-mcp"],
      "env": {
        "MEMORYVAULT_API_URL": "https://memoryvault-api.vercel.app",
        "MEMORYVAULT_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`}</pre>
        </div>
      </div>
    </main>
  );
}
