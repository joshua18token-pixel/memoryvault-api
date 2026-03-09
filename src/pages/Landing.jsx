import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const s = {
  hero: {
    paddingTop: 100,
    paddingBottom: 40,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 800, height: 800,
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block', padding: '6px 16px', borderRadius: 99,
    border: '1px solid var(--border)', fontSize: 13, color: 'var(--primary)',
    fontWeight: 500, marginBottom: 20, background: 'var(--primary-glow)',
  },
  h1: {
    fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1,
    letterSpacing: '-0.02em', maxWidth: 700, margin: '0 auto 16px',
  },
  gradient: {
    background: 'linear-gradient(135deg, var(--primary), #c084fc)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 18, color: 'var(--text-muted)', maxWidth: 500,
    margin: '0 auto 32px', lineHeight: 1.6,
  },

  // Chat embed
  chatSection: {
    maxWidth: 800, margin: '0 auto 60px', padding: '0 24px',
  },
  chatContainer: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
  },
  chatHeader: {
    padding: '12px 20px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.02)',
  },
  chatDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' },
  chatTitle: { fontWeight: 600, fontSize: 14 },
  chatMemCount: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
    padding: '3px 10px', borderRadius: 99,
    background: 'var(--primary-glow)', color: 'var(--primary)',
  },
  chatMessages: {
    height: 360, overflowY: 'auto', padding: 20,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  msg: (isUser) => ({
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    background: isUser ? 'var(--primary)' : '#1e1e2e',
    color: 'white', padding: '10px 16px', borderRadius: 14,
    maxWidth: '75%', fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap',
  }),
  chatInputRow: {
    padding: 16, borderTop: '1px solid var(--border)',
    display: 'flex', gap: 8,
  },
  chatInput: {
    flex: 1, background: '#1a1a26', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 16px', color: 'var(--text)',
    fontSize: 15, fontFamily: 'var(--font)', outline: 'none',
  },
  sendBtn: {
    background: 'var(--primary)', color: 'white', padding: '12px 24px',
    borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
  },

  // Save banner
  saveBanner: {
    padding: '16px 20px', borderTop: '1px solid var(--border)',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,197,94,0.1))',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 12,
  },
  saveBannerText: { fontSize: 14, fontWeight: 500 },
  saveBannerBtn: {
    background: 'var(--green)', color: 'white', border: 'none',
    borderRadius: 8, padding: '8px 20px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'var(--font)', textDecoration: 'none',
  },

  // How it works
  howSection: {
    padding: '60px 24px', maxWidth: 900, margin: '0 auto',
    textAlign: 'center',
  },
  steps: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32,
  },
  step: {
    padding: 24, borderRadius: 12,
  },
  stepNum: {
    width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 16, margin: '0 auto 12px',
  },
  stepTitle: { fontWeight: 700, fontSize: 16, marginBottom: 6 },
  stepDesc: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 },

  // Developer section
  devSection: {
    padding: '60px 24px', maxWidth: 1100, margin: '0 auto',
    borderTop: '1px solid var(--border)',
  },
  devGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', marginTop: 32 },
  devCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 32,
  },
  devFeature: {
    display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16,
  },
  devIcon: { fontSize: 24, marginTop: 2 },
  devTitle: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  devDesc: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 },
  codePre: {
    background: '#0d0d14', border: '1px solid var(--border)', borderRadius: 12,
    padding: 20, fontSize: 13, lineHeight: 1.7, overflowX: 'auto', color: '#a5b4fc',
    fontFamily: 'var(--mono)',
  },

  sectionTitle: { fontSize: 32, fontWeight: 800 },
  sectionSub: { color: 'var(--text-muted)', fontSize: 16, marginTop: 8 },

  // CTA
  ctaSection: {
    padding: '60px 24px', textAlign: 'center',
    borderTop: '1px solid var(--border)',
  },
};

function TryChat({ onMessageCount }) {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your personal AI assistant. Think of me like Alfred from Batman — loyal, sharp, and always here for you. Tell me about yourself and I'll remember everything. What's your name?", isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [memories, setMemories] = useState([]);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);

    try {
      const res = await fetch('/api/v1/try-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response || "I'd love to help! Sign up to continue our conversation.", isUser: false }]);
      if (data.memories) setMemories(data.memories);
      const newCount = msgCount + 1;
      setMsgCount(newCount);
      if (onMessageCount) onMessageCount(newCount);
    } catch {
      setMessages(prev => [...prev, { text: "Hmm, something went wrong. Try again?", isUser: false }]);
    }
    setSending(false);
  }

  return (
    <div style={s.chatContainer}>
      <div style={s.chatHeader}>
        <div style={s.chatDot} />
        <div style={s.chatTitle}>Your AI Assistant</div>
        {memories.length > 0 && (
          <div style={s.chatMemCount}>🧠 {memories.length} memories</div>
        )}
      </div>
      <div style={s.chatMessages}>
        {messages.map((m, i) => (
          <div key={i} style={s.msg(m.isUser)}>{m.text}</div>
        ))}
        {sending && (
          <div style={s.msg(false)}>
            <span style={{ opacity: 0.5 }}>Thinking...</span>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>
      <div style={s.chatInputRow}>
        <input
          style={s.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Tell me your name, what you like, what you do..."
        />
        <button style={{ ...s.sendBtn, opacity: sending ? 0.7 : 1 }} onClick={send} disabled={sending}>
          Send
        </button>
      </div>
      {msgCount >= 2 && (
        <div style={s.saveBanner}>
          <div style={s.saveBannerText}>
            💡 <strong>Want to save this conversation?</strong> Sign up free and your AI will remember you forever.
          </div>
          <Link to="/signup" style={s.saveBannerBtn}>
            Sign Up Free →
          </Link>
        </div>
      )}
    </div>
  );
}

const devFeatures = [
  { icon: '🔌', title: '3-Line Integration', desc: 'Store, recall, and forget. That\'s it. Works with any model — GPT, Claude, Gemini, Llama.' },
  { icon: '🧹', title: 'Auto-Deduplication', desc: 'Same fact mentioned 10 times? We store it once and boost its importance. Like a real brain.' },
  { icon: '🔍', title: 'Semantic Search', desc: 'Ask "what does the user like?" and get ranked results by meaning — not keyword matching.' },
  { icon: '🛡️', title: 'GDPR Wipe', desc: 'One API call to forget everything about a user. Full compliance, no loose ends.' },
  { icon: '📡', title: 'MCP Server', desc: 'Plug into Claude, Cursor, or any MCP-compatible agent with zero custom code.' },
  { icon: '🤖', title: 'Auto-Extraction', desc: 'Send raw conversations — we extract the facts, preferences, and events automatically.' },
];

export default function Landing() {
  const [msgCount, setMsgCount] = useState(0);

  return (
    <main>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={s.badge}>🧠 Meet your AI that actually remembers you</div>
          <h1 style={s.h1}>
            An AI assistant that<br />
            <span style={s.gradient}>never forgets</span>
          </h1>
          <p style={s.subtitle}>
            Start chatting right now. No sign-up needed. Your AI learns who you are and remembers across every conversation.
          </p>
        </div>
      </section>

      {/* Live Chat */}
      <section style={s.chatSection}>
        <TryChat onMessageCount={setMsgCount} />
      </section>

      {/* How It Works */}
      <section style={s.howSection}>
        <div style={s.sectionTitle}>How it works</div>
        <div style={s.sectionSub}>Three steps to an AI that knows you</div>
        <div style={s.steps}>
          <div style={s.step}>
            <div style={s.stepNum}>1</div>
            <div style={s.stepTitle}>Just start talking</div>
            <div style={s.stepDesc}>Tell your AI about yourself — your name, interests, family, goals. No setup required.</div>
          </div>
          <div style={s.step}>
            <div style={s.stepNum}>2</div>
            <div style={s.stepTitle}>It learns & remembers</div>
            <div style={s.stepDesc}>Every conversation builds your AI's memory. Facts, preferences, and context — all organized automatically.</div>
          </div>
          <div style={s.step}>
            <div style={s.stepNum}>3</div>
            <div style={s.stepTitle}>It becomes yours</div>
            <div style={s.stepDesc}>Come back tomorrow, next week, next year. Your AI remembers everything and gets smarter over time.</div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section style={s.devSection}>
        <div style={{ textAlign: 'center' }}>
          <div style={s.sectionTitle}>For Developers</div>
          <div style={s.sectionSub}>Give any AI app a brain with 3 lines of code</div>
        </div>
        <div style={s.devGrid}>
          <div>
            {devFeatures.map((f, i) => (
              <div key={i} style={s.devFeature}>
                <div style={s.devIcon}>{f.icon}</div>
                <div>
                  <div style={s.devTitle}>{f.title}</div>
                  <div style={s.devDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
            <Link to="/developer" className="btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
              Get API Key →
            </Link>
          </div>
          <div>
            <pre style={s.codePre}>{`// Give your AI a memory in 3 calls

// 1. Store what you learn
await fetch('/v1/memories', {
  method: 'POST',
  headers: { 'x-api-key': 'mv_...' },
  body: JSON.stringify({
    namespace: 'user_123',
    content: 'User loves college football'
  })
});

// 2. Recall before responding
const { memories } = await fetch(
  '/v1/memories/recall',
  {
    method: 'POST',
    headers: { 'x-api-key': 'mv_...' },
    body: JSON.stringify({
      namespace: 'user_123',
      query: 'what does user enjoy?'
    })
  }
).then(r => r.json());

// 3. Inject into your prompt
const context = memories
  .map(m => m.content).join('\\n');`}</pre>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={s.ctaSection}>
        <div style={s.sectionTitle}>Ready for an AI that knows you?</div>
        <div style={{ ...s.sectionSub, marginBottom: 24 }}>Free to start. $1.00 in credits on signup.</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Sign Up Free</Link>
          <Link to="/docs" className="btn-secondary" style={{ textDecoration: 'none' }}>Read the Docs</Link>
        </div>
      </section>
    </main>
  );
}
