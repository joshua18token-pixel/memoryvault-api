import React, { useState, useRef, useEffect, useCallback } from 'react';

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
  memoryLog: {
    margin: '24px auto 0',
    maxWidth: 600,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 16,
  },
  memoryTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  memoryItem: { fontSize: 13, color: 'var(--text-muted)', padding: '4px 0', borderBottom: '1px solid var(--border)' },
};

// Extract facts from user input
function extractFacts(input) {
  const facts = [];
  const lower = input.toLowerCase();

  // Name patterns
  const nameMatch = input.match(/(?:my name is|i'm|i am|call me|name's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) facts.push({ key: 'name', value: nameMatch[1], text: `User's name is ${nameMatch[1]}` });

  // Age
  const ageMatch = input.match(/(?:i'm|i am|i'm)\s+(\d{1,3})\s*(?:years? old)?/i);
  if (ageMatch) facts.push({ key: 'age', value: ageMatch[1], text: `User is ${ageMatch[1]} years old` });

  // Likes/loves
  const likeMatch = input.match(/(?:i (?:like|love|enjoy|prefer))\s+(.+?)(?:\.|$)/i);
  if (likeMatch) facts.push({ key: `likes_${Date.now()}`, value: likeMatch[1], text: `User likes ${likeMatch[1]}` });

  // Work/job
  const workMatch = input.match(/(?:i (?:work|am working) (?:at|for|in|on))\s+(.+?)(?:\.|$)/i);
  if (workMatch) facts.push({ key: `work_${Date.now()}`, value: workMatch[1], text: `User works ${workMatch[1]}` });

  // Location
  const liveMatch = input.match(/(?:i (?:live|am) (?:in|from|at))\s+(.+?)(?:\.|$)/i);
  if (liveMatch) facts.push({ key: 'location', value: liveMatch[1], text: `User lives in ${liveMatch[1]}` });

  // Building/making
  const buildMatch = input.match(/(?:i(?:'m| am) (?:building|making|creating|working on))\s+(.+?)(?:\.|$)/i);
  if (buildMatch) facts.push({ key: `project_${Date.now()}`, value: buildMatch[1], text: `User is building ${buildMatch[1]}` });

  // Catch-all: if nothing matched but it seems personal, store the whole thing
  if (facts.length === 0 && (lower.includes('my ') || lower.includes('i ') || lower.includes("i'"))) {
    const cleaned = input.replace(/[.!?]+$/, '').trim();
    if (cleaned.length > 10 && cleaned.length < 200) {
      facts.push({ key: `fact_${Date.now()}`, value: cleaned, text: `User said: "${cleaned}"` });
    }
  }

  return facts;
}

function ChatPanel({ title, hasMemory, sessionNum, memories, onNewMemory }) {
  const [messages, setMessages] = useState([
    { text: sessionNum > 1 ? 'Welcome back! New session started.' : 'Hi there! Tell me about yourself — your name, what you like, what you do. I\'ll remember it all!', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = useCallback((userMsg) => {
    const lower = userMsg.toLowerCase();

    // Session 2+: memory bot recalls, standard bot doesn't
    if (sessionNum > 1 && !hasMemory) {
      if (lower.includes('remember') || lower.includes('know about me') || lower.includes('my name') || lower.includes('who am i')) {
        return "I'm sorry, I don't have any context about you. This seems like a new conversation to me. Could you tell me about yourself?";
      }
      return `I'd be happy to help with that, but I don't have any prior context about you. Every session starts fresh for me. What would you like to talk about?`;
    }

    if (hasMemory && memories.length > 0) {
      // Check if asking about memories
      if (lower.includes('remember') || lower.includes('know about me') || lower.includes('who am i')) {
        const memText = memories.map(m => m.text).join('. ');
        return `Of course! Here's what I remember about you: ${memText}. What else would you like to know?`;
      }
      if (lower.includes('my name') || lower.includes('what is my name') || lower.includes("what's my name")) {
        const nameMem = memories.find(m => m.key === 'name');
        if (nameMem) return `Your name is ${nameMem.value}! 😊 How can I help you today?`;
        return "I don't think you've told me your name yet. What is it?";
      }
    }

    // Store new memories if this panel has memory enabled
    if (hasMemory) {
      const facts = extractFacts(userMsg);
      facts.forEach(f => onNewMemory(f));

      if (facts.length > 0) {
        const nameF = facts.find(f => f.key === 'name');
        if (nameF) return `Nice to meet you, ${nameF.value}! I'll definitely remember that. What else would you like to share?`;
        return `Got it — I'll remember that! ${facts.map(f => `✅ ${f.text}`).join('. ')}. Tell me more!`;
      }
    }

    // Default responses
    if (lower.includes('my name') || lower.includes("what's my name")) {
      if (!hasMemory) return "I don't know your name yet! What is it?";
      const nameMem = memories.find(m => m.key === 'name');
      if (nameMem) return `Your name is ${nameMem.value}! 😊`;
      return "I don't think you've told me yet — what's your name?";
    }

    return "That's interesting! Tell me more about yourself — the more I know, the better I can help in future sessions.";
  }, [hasMemory, memories, sessionNum, onNewMemory]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);

    setTimeout(() => {
      const response = getResponse(userMsg);
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 400);
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <div style={s.panelDot(hasMemory ? 'var(--green)' : 'var(--red)')} />
        <div style={s.panelTitle}>{title}</div>
        <div style={hasMemory ? s.panelTag : s.panelTagOff}>
          {hasMemory ? `🧠 Memory ON (${memories.length})` : '❌ No Memory'}
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
  // Memories persist across sessions — lifted to parent
  const [memories, setMemories] = useState([]);

  const newSession = () => {
    setSession(prev => prev + 1);
    setKey(prev => prev + 1);
  };

  const addMemory = (fact) => {
    setMemories(prev => {
      // Dedupe by key (update existing or add new)
      const existing = prev.findIndex(m => m.key === fact.key);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = fact;
        return updated;
      }
      return [...prev, fact];
    });
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
        <ChatPanel
          key={`memory-${key}`}
          title="With MemoryVault"
          hasMemory={true}
          sessionNum={session}
          memories={memories}
          onNewMemory={addMemory}
        />
        <ChatPanel
          key={`no-memory-${key}`}
          title="Standard AI"
          hasMemory={false}
          sessionNum={session}
          memories={[]}
          onNewMemory={() => {}}
        />
      </div>

      {/* Show stored memories */}
      {memories.length > 0 && (
        <div style={s.memoryLog}>
          <div style={s.memoryTitle}>
            <span>🧠</span> Stored Memories ({memories.length})
          </div>
          {memories.map((m, i) => (
            <div key={i} style={s.memoryItem}>✅ {m.text}</div>
          ))}
        </div>
      )}

      <p style={s.info}>
        💡 <strong>Try this:</strong> Tell both bots your name and something you like
        (e.g. "My name is Drew" or "I love playing drums").
        Then click "Start New Session" and ask "What is my name?"
        — only the MemoryVault bot remembers.
      </p>
    </main>
  );
}
