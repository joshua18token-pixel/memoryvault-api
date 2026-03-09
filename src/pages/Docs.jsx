import React from 'react';

const s = {
  page: { paddingTop: 100, paddingBottom: 80, maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' },
  title: { fontSize: 36, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: 'var(--text-muted)', marginBottom: 48, fontSize: 18 },
  section: { marginBottom: 48 },
  h2: { fontSize: 24, fontWeight: 700, marginBottom: 16, paddingTop: 16 },
  h3: { fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--primary)' },
  p: { color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 },
  code: {
    background: '#0d0d14',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    fontSize: 14,
    lineHeight: 1.8,
    overflowX: 'auto',
    display: 'block',
    marginBottom: 24,
    color: '#a5b4fc',
    fontFamily: 'var(--mono)',
    whiteSpace: 'pre',
  },
  inlineCode: {
    background: '#1e1e2e',
    padding: '2px 8px',
    borderRadius: 4,
    fontFamily: 'var(--mono)',
    fontSize: 13,
    color: '#a5b4fc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 24,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid var(--border)',
    fontWeight: 600,
    fontSize: 14,
  },
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  toc: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 48,
  },
  tocLink: {
    display: 'block',
    padding: '6px 0',
    color: 'var(--text-muted)',
    fontSize: 14,
    textDecoration: 'none',
  },
  method: (m) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'var(--mono)',
    marginRight: 8,
    background: m === 'POST' ? 'rgba(34,197,94,0.15)' : m === 'GET' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
    color: m === 'POST' ? 'var(--green)' : m === 'GET' ? 'var(--blue)' : 'var(--red)',
  }),
};

const endpoints = [
  {
    method: 'POST',
    path: '/v1/memories',
    desc: 'Store a new memory',
    body: `{
  "namespace": "user_123",
  "content": "User prefers dark mode and speaks Spanish",
  "type": "semantic",        // semantic | episodic | procedural
  "importance": 0.8,         // 0.0 - 1.0
  "tags": ["preferences"],
  "metadata": {}             // any extra JSON
}`,
    response: `{
  "memory": {
    "id": "uuid",
    "content": "User prefers dark mode and speaks Spanish",
    "type": "semantic",
    "importance": 0.8,
    "tags": ["preferences"],
    "created_at": "2026-03-09T..."
  }
}`,
  },
  {
    method: 'POST',
    path: '/v1/memories/recall',
    desc: 'Semantic search across memories',
    body: `{
  "namespace": "user_123",
  "query": "what are the user preferences?",
  "limit": 5,                // optional, default 5
  "min_importance": 0.3      // optional, default 0.0
}`,
    response: `{
  "memories": [
    {
      "id": "uuid",
      "content": "User prefers dark mode...",
      "similarity": 0.87,
      "importance": 0.8,
      ...
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/v1/memories/extract',
    desc: 'Auto-extract memories from a conversation',
    body: `{
  "namespace": "user_123",
  "conversation": "User: Hi, I'm Drew. I build apps...\\nBot: Nice to meet you!..."
}`,
    response: `{
  "memories": [...],  // auto-extracted & stored
  "count": 3
}`,
  },
  {
    method: 'GET',
    path: '/v1/memories',
    desc: 'List/filter memories',
    body: `Query params: ?namespace=user_123&type=semantic&limit=20`,
    response: `{ "memories": [...] }`,
  },
  {
    method: 'DELETE',
    path: '/v1/memories/:id',
    desc: 'Delete a specific memory',
    body: null,
    response: `{ "deleted": true }`,
  },
  {
    method: 'DELETE',
    path: '/v1/memories/namespace/:namespace',
    desc: 'GDPR wipe — delete all memories for a user',
    body: null,
    response: `{ "deleted": true, "count": 42 }`,
  },
];

export default function Docs() {
  return (
    <main style={s.page}>
      <h1 style={s.title}>API Documentation</h1>
      <p style={s.subtitle}>Everything you need to give your AI a brain</p>

      {/* TOC */}
      <div style={s.toc}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Navigation</div>
        <a href="#auth" style={s.tocLink}>→ Authentication</a>
        <a href="#endpoints" style={s.tocLink}>→ API Endpoints</a>
        <a href="#mcp" style={s.tocLink}>→ MCP Server</a>
        <a href="#quickstart" style={s.tocLink}>→ Quick Start</a>
      </div>

      {/* Auth */}
      <section id="auth" style={s.section}>
        <h2 style={s.h2}>🔐 Authentication</h2>
        <p style={s.p}>
          All API requests require an API key passed in the <span style={s.inlineCode}>x-api-key</span> header.
        </p>
        <pre style={s.code}>{`curl -X POST https://your-app.vercel.app/v1/memories \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mv_your_key_here" \\
  -d '{"namespace": "user_123", "content": "..."}'`}</pre>
      </section>

      {/* Endpoints */}
      <section id="endpoints" style={s.section}>
        <h2 style={s.h2}>📡 API Endpoints</h2>
        {endpoints.map((ep, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h3 style={s.h3}>
              <span style={s.method(ep.method)}>{ep.method}</span>
              <span style={s.inlineCode}>{ep.path}</span>
            </h3>
            <p style={s.p}>{ep.desc}</p>
            {ep.body && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                  {ep.method === 'GET' ? 'Parameters' : 'Request Body'}
                </div>
                <pre style={s.code}>{ep.body}</pre>
              </>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Response</div>
            <pre style={s.code}>{ep.response}</pre>
          </div>
        ))}
      </section>

      {/* MCP */}
      <section id="mcp" style={s.section}>
        <h2 style={s.h2}>🔌 MCP Server</h2>
        <p style={s.p}>
          MemoryVault ships as an MCP (Model Context Protocol) server. Any MCP-compatible agent
          can plug in persistent memory with zero custom code.
        </p>
        <h3 style={{ ...s.h3, marginTop: 24 }}>Configuration</h3>
        <pre style={s.code}>{`// Add to your MCP config (e.g. claude_desktop_config.json)
{
  "mcpServers": {
    "memoryvault": {
      "command": "npx",
      "args": ["memoryvault-mcp"],
      "env": {
        "MEMORYVAULT_API_URL": "https://your-app.vercel.app",
        "MEMORYVAULT_API_KEY": "mv_your_key_here",
        "MEMORYVAULT_NAMESPACE": "default"
      }
    }
  }
}`}</pre>
        <h3 style={s.h3}>Available Tools</h3>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Tool</th>
              <th style={s.th}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={s.td}><span style={s.inlineCode}>memoryvault_store</span></td><td style={s.td}>Store a new memory</td></tr>
            <tr><td style={s.td}><span style={s.inlineCode}>memoryvault_recall</span></td><td style={s.td}>Search memories by meaning</td></tr>
            <tr><td style={s.td}><span style={s.inlineCode}>memoryvault_forget</span></td><td style={s.td}>Delete a specific memory or wipe all</td></tr>
            <tr><td style={s.td}><span style={s.inlineCode}>memoryvault_extract</span></td><td style={s.td}>Auto-extract memories from conversation</td></tr>
          </tbody>
        </table>
      </section>

      {/* Quick Start */}
      <section id="quickstart" style={s.section}>
        <h2 style={s.h2}>⚡ Quick Start</h2>
        <p style={s.p}>Get running in under 2 minutes:</p>
        <pre style={s.code}>{`npm install memoryvault-sdk

import { MemoryVault } from 'memoryvault-sdk';

const vault = new MemoryVault({
  apiKey: 'mv_...',
  baseUrl: 'https://your-app.vercel.app'
});

// Store
await vault.store('user_123', 'Loves hiking and photography');

// Recall
const memories = await vault.recall('user_123', 'outdoor hobbies?');

// Extract from conversation
await vault.extract('user_123', conversationText);

// Forget (GDPR)
await vault.wipeUser('user_123');`}</pre>
      </section>
    </main>
  );
}
