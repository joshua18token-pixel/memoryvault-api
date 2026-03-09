import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { MODELS, getModel } from '../lib/models';
import ModelSelector from '../components/ModelSelector';
import MemoryPanel from '../components/MemoryPanel';
import CreditsBadge from '../components/CreditsBadge';

const s = {
  layout: { display: 'flex', height: '100vh', paddingTop: 64 },
  sidebar: {
    width: 280,
    background: '#0d0d14',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '16px 16px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newChatBtn: {
    background: 'var(--primary)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  sessionsList: { flex: 1, overflowY: 'auto', padding: '8px' },
  sessionItem: (active) => ({
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    background: active ? 'var(--primary-glow)' : 'transparent',
    border: active ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
    marginBottom: 4,
    transition: 'all 0.15s',
  }),
  sessionTitle: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sessionMeta: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: {
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: 'rgba(10,10,15,0.5)',
    backdropFilter: 'blur(10px)',
  },
  messages: { flex: 1, overflowY: 'auto', padding: '20px 20px 0' },
  msgRow: (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: 16,
  }),
  msgBubble: (isUser) => ({
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: 16,
    background: isUser ? 'var(--primary)' : '#1e1e2e',
    color: 'white',
    fontSize: 15,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  }),
  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    background: '#1a1a26',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: 15,
    fontFamily: 'var(--font)',
    outline: 'none',
    resize: 'none',
    minHeight: 48,
    maxHeight: 120,
  },
  sendBtn: {
    background: 'var(--primary)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    gap: 16,
  },
  emptyIcon: { fontSize: 48 },
  rightPanel: {
    width: 300,
    borderLeft: '1px solid var(--border)',
    background: '#0d0d14',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
};

export default function AppDashboard() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [memories, setMemories] = useState([]);
  const [showMemories, setShowMemories] = useState(true);
  const messagesEnd = useRef(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession.id);
      loadMemories();
    }
  }, [activeSession]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (profile?.preferred_model) setSelectedModel(profile.preferred_model);
  }, [profile]);

  async function loadSessions() {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setSessions(data || []);
  }

  async function loadMessages(sessionId) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function deleteMemory(memoryId) {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      await fetch(`/api/v1/user/memories?id=${memoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authSession.access_token}` },
      });
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  }

  async function clearAllMemories() {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      await fetch('/api/v1/user/memories?all=true', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authSession.access_token}` },
      });
      setMemories([]);
    } catch (err) {
      console.error('Failed to clear memories:', err);
    }
  }

  async function deleteSession(sessionId) {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    }
  }

  async function loadMemories() {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch('/api/v1/user/memories', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setMemories(data.memories || []);
    } catch {
      setMemories([]);
    }
  }

  async function createSession() {
    const { data } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, model: selectedModel, title: 'New Chat' })
      .select()
      .single();
    if (data) {
      setSessions(prev => [data, ...prev]);
      setActiveSession(data);
      setMessages([]);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending || !activeSession) return;
    if (profile?.credits <= 0) {
      alert('You need credits to send messages. Add credits in your account settings.');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setSending(true);

    // Optimistic UI: add user message immediately
    const tempUserMsg = { id: 'temp-user', role: 'user', content: userMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        session_id: activeSession.id,
        user_id: user.id,
        role: 'user',
        content: userMsg,
      });

      // Call chat API
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_id: activeSession.id,
          message: userMsg,
          model: selectedModel,
          namespace: `user_${user.id}`,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: `Error: ${data.error}`, created_at: new Date().toISOString() }]);
      } else {
        // Add assistant response
        setMessages(prev => [...prev, {
          id: data.message_id || 'resp',
          role: 'assistant',
          content: data.response,
          model: selectedModel,
          created_at: new Date().toISOString(),
        }]);

        // Update session title from first message
        if (messages.length <= 1) {
          const title = userMsg.substring(0, 50) + (userMsg.length > 50 ? '...' : '');
          await supabase.from('chat_sessions').update({ title, updated_at: new Date().toISOString() }).eq('id', activeSession.id);
          loadSessions();
        }

        // Update memories from response (includes newly extracted ones)
        if (data.memories) setMemories(data.memories);

        refreshProfile(); // refresh credits
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: `Network error: ${err.message}`, created_at: new Date().toISOString() }]);
    }

    setSending(false);
  }

  if (loading) return <div style={s.emptyState}><div>Loading...</div></div>;

  return (
    <div style={s.layout}>
      {/* Sidebar: Chat Sessions */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <button style={s.newChatBtn} onClick={createSession}>+ New Chat</button>
        </div>
        <div style={s.sessionsList}>
          {sessions.map(sess => (
            <div
              key={sess.id}
              style={{ ...s.sessionItem(activeSession?.id === sess.id), position: 'relative' }}
              onClick={() => setActiveSession(sess)}
              onMouseEnter={e => { const btn = e.currentTarget.querySelector('.sess-del'); if (btn) btn.style.opacity = '1'; }}
              onMouseLeave={e => { const btn = e.currentTarget.querySelector('.sess-del'); if (btn) btn.style.opacity = '0'; }}
            >
              <div style={s.sessionTitle}>{sess.title}</div>
              <div style={s.sessionMeta}>{getModel(sess.model).name} · {new Date(sess.created_at).toLocaleDateString()}</div>
              <button
                className="sess-del"
                onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) deleteSession(sess.id); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'transparent', border: 'none', color: 'var(--red)',
                  cursor: 'pointer', fontSize: 13, padding: '2px 6px', borderRadius: 4,
                  opacity: 0, transition: 'opacity 0.15s', fontFamily: 'var(--font)',
                }}
              >
                🗑
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No chats yet. Start one!
            </div>
          )}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <CreditsBadge credits={profile?.credits || 0} />
          <button
            onClick={() => navigate('/developer')}
            style={{ width: '100%', marginTop: 8, padding: '8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
          >
            🔧 Developer Dashboard
          </button>
          <button
            onClick={signOut}
            style={{ width: '100%', marginTop: 4, padding: '8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={s.main}>
        {activeSession ? (
          <>
            <div style={s.topBar}>
              <ModelSelector selected={selectedModel} onChange={setSelectedModel} credits={profile?.credits || 0} />
              <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                {profile?.display_name || 'User'}
              </div>
              <button
                onClick={() => setShowMemories(!showMemories)}
                style={{ background: showMemories ? 'var(--primary-glow)' : 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}
              >
                🧠 Memories
              </button>
            </div>

            <div style={s.messages}>
              {messages.length === 0 && (
                <div style={{ ...s.emptyState, padding: 40 }}>
                  <div style={s.emptyIcon}>💬</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Start a conversation</div>
                  <div>Your AI will remember everything across sessions</div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={msg.id || i} style={s.msgRow(msg.role === 'user')}>
                  <div style={s.msgBubble(msg.role === 'user')}>
                    {msg.content}
                    {msg.model && (
                      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                        {getModel(msg.model).icon} {getModel(msg.model).name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div style={s.msgRow(false)}>
                  <div style={s.msgBubble(false)}>
                    <span style={{ opacity: 0.6 }}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <div style={s.inputArea}>
              <textarea
                style={s.chatInput}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                rows={1}
              />
              <button style={{ ...s.sendBtn, opacity: sending ? 0.7 : 1 }} onClick={sendMessage} disabled={sending}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🧠</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>MemoryVault Chat</div>
            <div>Select a chat or create a new one to get started</div>
            <button className="btn-primary" onClick={createSession} style={{ marginTop: 16 }}>
              + New Chat
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Memories */}
      {showMemories && activeSession && (
        <div style={s.rightPanel}>
          <MemoryPanel memories={memories} onDeleteMemory={deleteMemory} onClearAll={clearAllMemories} />
        </div>
      )}
    </div>
  );
}
