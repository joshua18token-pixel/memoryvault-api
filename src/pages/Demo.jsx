import React, { useState, useRef, useEffect } from 'react';

const s = {
  page: { paddingTop: 100, paddingBottom: 80, maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px' },
  title: { fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 18 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: 600,
  },
  panelHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  panelDot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
  }),
  panelTitle: { fontWeight: 700, fontSize: 15 },
  panelTag: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 99,
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
  },
  panelTagOff: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 99,
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--red)',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  msg: (isUser) => ({
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    background: isUser ? 'var(--primary)' : '#1e1e2e',
    color: 'white',
    padding: '10px 16px',
    borderRadius: 12,
    maxWidth: '80%',
    fontSize: 14,
    lineHeight: 1.5,
  }),
  inputRow: {
    padding: 16,
    borderTop: '1px solid var(--border)',
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    background: '#1a1a26',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'var(--font)',
    outline: 'none',
  },
  sendBtn: {
    background: 'var(--primary)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
  },
  info: {
    textAlign: 'center',
    marginTop: 32,
    color: 'var(--text-muted)',
    fontSize: 14,
    maxWidth: 600,
    margin: '32px auto 0',
    lineHeight: 1.6,
  },
  session: {
    textAlign: 'center',
    marginBottom: 24,
  },
  sessionBtn: {
    background: 'var(--green)',
    color: 'white',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
  },
};

const DEMO_MEMORIES = [];

// Simulated AI responses based on whether memory is available
function getResponse(input, hasMemory, memories, sessionNum) {
  const lower = input.toLowerCase();

  if (sessionNum > 1 && hasMemory && memories.length > 0) {
    const context = memories.map(m => m.content).join('. ');

    if (lower.includes('remember') || lower.includes('know about me') || lower.includes('who am i')) {
      return `Based on what I remember about you: ${context}. What else would you like to know?`;
    }
    if (lower.includes('name')) {
      const nameMem = memories.find(m => m.content.toLowerCase().includes('name'));
      if (nameMem) return `Of course! ${nameMem.content}. How can I help you today?`;
    }
    return `I remember some things about you: ${context}. How can I help with "${input}"?`;
  }

  if (sessionNum > 1 && !hasMemory) {
    if (lower.includes('remember') || lower.includes('know about me') || lower.includes('who am i')) {
      return "I'm sorry, I don't have any context about you. Could you tell me more about yourself?";
    }
    if (lower.includes('name')) {
      return "I don't know your name — this is our first interaction as far as I can tell. What's your name?";
    }
    return `I'd be happy to help with "${input}", but I don't have any prior context about you. Could you fill me in?`;
  }

  // Session 1 - both bots work the same
  if (lower.includes('name') && (lower.includes('my') || lower.includes("i'm") || lower.includes('i am') || lower.includes('is'))) {
    const name = input.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)?.[1] || 'there';
    return `Nice to meet you, ${name}! I'll remember that. What else would you like to share?`;
  }
  if (lower.includes('like') || lower.includes('love') || lower.includes('enjoy') || lower.includes('hobby')) {
    return "That's great to know! I'll keep that in mind. Tell me more about yourself!";
  }
  return `Got it — "${input}". Anything else you'd like to share?`;
}

function ChatPanel({ title, hasMemory, sessionNum }) {
  const [messages, setMessages] = useState([
    { text: sessionNum > 1 ? 'Welcome back! New session started.' : 'Hi! Tell me about yourself.', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [memories, setMemories] = useState([]);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);

    // If has memory, store new memories from user input
    if (hasMemory) {
      const lower = userMsg.toLowerCase();
      if (lower.includes('name') || lower.includes("i'm") || lower.includes('i am')) {
        const name = userMsg.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i)?.[1];
        if (name) setMemories(prev => [...prev, { content: `User's name is ${name}` }]);
      }
      if (lower.includes('like') || lower.includes('love') || lower.includes('enjoy')) {
        setMemories(prev => [...prev, { content: `User said: ${userMsg}` }]);
      }
      if (lower.includes('work') || lower.includes('job') || lower.includes('build')) {
        setMemories(prev => [...prev, { content: `User mentioned: ${userMsg}` }]);
      }
    }

    // Simulate response delay
    setTimeout(() => {
      const response = getResponse(userMsg, hasMemory, memories, sessionNum);
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 600);
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <div style={s.panelDot(hasMemory ? 'var(--green)' : 'var(--red)')} />
        <div style={s.panelTitle}>{title}</div>
        <div style={hasMemory ? s.panelTag : s.panelTagOff}>
          {hasMemory ? '🧠 Memory ON' : '❌ No Memory'}
        </div>
      </div>
      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={s.msg(m.isUser)}>{m.text}</div>
        ))}
        <div ref={messagesEnd} />
      </div>
      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
        />
        <button style={s.sendBtn} onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default function Demo() {
  const [session, setSession] = useState(1);
  const [key, setKey] = useState(0);

  const newSession = () => {
    setSession(prev => prev + 1);
    setKey(prev => prev + 1);
  };

  return (
    <main style={s.page}>
      <h1 style={s.title}>See the Difference</h1>
      <p style={s.subtitle}>Same AI. One remembers you. One doesn't.</p>

      <div style={s.session}>
        <span style={{ color: 'var(--text-muted)', marginRight: 16 }}>
          Session {session}
        </span>
        <button style={s.sessionBtn} onClick={newSession}>
          🔄 Start New Session
        </button>
      </div>

      <div style={s.grid}>
        <ChatPanel key={`memory-${key}`} title="With MemoryVault" hasMemory={true} sessionNum={session} />
        <ChatPanel key={`no-memory-${key}`} title="Standard AI" hasMemory={false} sessionNum={session} />
      </div>

      <p style={s.info}>
        💡 <strong>Try this:</strong> Tell both bots your name and something you like.
        Then click "Start New Session" and ask "Do you remember my name?"
        — only the MemoryVault bot remembers.
      </p>
    </main>
  );
}
