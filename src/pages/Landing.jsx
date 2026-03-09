import React from 'react';
import { Link } from 'react-router-dom';

const s = {
  hero: {
    paddingTop: 140,
    paddingBottom: 100,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 800,
    height: 800,
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 99,
    border: '1px solid var(--border)',
    fontSize: 13,
    color: 'var(--primary)',
    fontWeight: 500,
    marginBottom: 24,
    background: 'var(--primary-glow)',
  },
  h1: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    maxWidth: 800,
    margin: '0 auto 24px',
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--primary), #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 20,
    color: 'var(--text-muted)',
    maxWidth: 600,
    margin: '0 auto 40px',
    lineHeight: 1.6,
  },
  buttons: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  codeSection: {
    padding: '80px 24px',
    maxWidth: 900,
    margin: '0 auto',
  },
  codePre: {
    background: '#0d0d14',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 24,
    fontSize: 14,
    lineHeight: 1.8,
    overflowX: 'auto',
    color: '#a5b4fc',
  },
  features: {
    padding: '80px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 32,
    transition: 'all 0.2s',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  featureDesc: {
    color: 'var(--text-muted)',
    fontSize: 15,
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSub: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    marginBottom: 48,
    fontSize: 18,
  },
  pricing: {
    padding: '80px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 24,
  },
  priceCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
  },
  priceCardPop: {
    background: 'var(--bg-card)',
    border: '2px solid var(--primary)',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
    position: 'relative',
  },
  priceTag: {
    position: 'absolute',
    top: -14,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--primary)',
    color: 'white',
    padding: '4px 16px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
  },
  priceName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: 800,
    marginBottom: 4,
  },
  pricePer: {
    color: 'var(--text-muted)',
    fontSize: 14,
    marginBottom: 24,
  },
  priceFeature: {
    color: 'var(--text-muted)',
    fontSize: 14,
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
  },
};

const features = [
  {
    icon: '🔍',
    title: 'Semantic Recall',
    desc: 'Natural language search across all memories. Ask "what does this user like?" and get ranked, relevant results — not keyword matches.',
  },
  {
    icon: '🤖',
    title: 'Auto-Extraction',
    desc: 'Send raw conversations and MemoryVault automatically extracts the facts, preferences, and events worth remembering.',
  },
  {
    icon: '🔌',
    title: 'MCP Server',
    desc: 'Plug into any MCP-compatible agent (Claude, Cursor, OpenClaw) with zero custom code. Just add the server config.',
  },
  {
    icon: '🧹',
    title: 'GDPR Wipe',
    desc: 'One API call to forget everything about a user. Full compliance, no loose ends.',
  },
  {
    icon: '📊',
    title: 'Importance Decay',
    desc: 'Memories naturally fade over time unless reinforced. Like a real brain — recent and frequent memories stay strong.',
  },
  {
    icon: '🔐',
    title: 'Namespace Isolation',
    desc: 'Each user gets their own memory space. User A\'s memories never leak into User B\'s recall. Ever.',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    per: 'forever',
    features: ['10K memories', '50K recall/mo', 'REST API', 'Community support'],
  },
  {
    name: 'Builder',
    price: '$19',
    per: '/month',
    popular: true,
    features: ['100K memories', '500K recall/mo', 'Auto-extraction', 'MCP server', 'Email support'],
  },
  {
    name: 'Scale',
    price: '$79',
    per: '/month',
    features: ['1M memories', '5M recall/mo', 'Memory consolidation', 'Priority support', 'Analytics dashboard'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: '',
    features: ['Unlimited', 'Dedicated infra', 'SLAs', 'SSO + audit logs', 'Custom integrations'],
  },
];

export default function Landing() {
  return (
    <main>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={s.badge}>🚀 Now in Public Beta</div>
          <h1 style={s.h1}>
            Persistent Memory<br />
            <span style={s.gradient}>for AI Agents</span>
          </h1>
          <p style={s.subtitle}>
            Your AI wakes up with amnesia every session. MemoryVault gives it a brain.
            Three API calls. Every model. Instant recall.
          </p>
          <div style={s.buttons}>
            <Link to="/demo" className="btn-primary" style={{ textDecoration: 'none' }}>
              Try Live Demo
            </Link>
            <Link to="/docs" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section style={s.codeSection}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Three lines to remember</h2>
          <p style={{ color: 'var(--text-muted)' }}>Works with GPT, Claude, Gemini, Llama — any model</p>
        </div>
        <pre style={s.codePre}>{`// Store a memory
await fetch('/v1/memories', {
  method: 'POST',
  headers: { 'x-api-key': 'mv_...', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    namespace: 'user_123',
    content: 'User prefers dark mode and speaks Spanish',
    importance: 0.8
  })
});

// Recall relevant memories
const { memories } = await fetch('/v1/memories/recall', {
  method: 'POST',
  headers: { 'x-api-key': 'mv_...', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    namespace: 'user_123',
    query: 'what are the user preferences?'
  })
}).then(r => r.json());

// Inject into your prompt
const context = memories.map(m => m.content).join('\\n');
const prompt = \`User context:\\n\${context}\\n\\nUser: ...\`;`}
        </pre>
      </section>

      {/* Features */}
      <section style={s.features}>
        <h2 style={s.sectionTitle}>Built for the agent era</h2>
        <p style={s.sectionSub}>Everything your AI needs to remember — nothing it doesn't</p>
        <div style={s.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={s.pricing}>
        <h2 style={s.sectionTitle}>Simple pricing</h2>
        <p style={s.sectionSub}>Start free. Scale when you're ready.</p>
        <div style={s.pricingGrid}>
          {tiers.map((t, i) => (
            <div key={i} style={t.popular ? s.priceCardPop : s.priceCard}>
              {t.popular && <div style={s.priceTag}>MOST POPULAR</div>}
              <div style={s.priceName}>{t.name}</div>
              <div style={s.priceAmount}>{t.price}</div>
              <div style={s.pricePer}>{t.per}</div>
              {t.features.map((f, j) => (
                <div key={j} style={s.priceFeature}>✓ {f}</div>
              ))}
              <button
                className={t.popular ? 'btn-primary' : 'btn-secondary'}
                style={{ marginTop: 24, width: '100%' }}
              >
                {t.name === 'Enterprise' ? 'Contact Us' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
