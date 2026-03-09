import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 420,
  },
  logo: { textAlign: 'center', fontSize: 32, marginBottom: 8 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' },
  input: {
    width: '100%',
    background: '#1a1a26',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: 15,
    fontFamily: 'var(--font)',
    outline: 'none',
    marginBottom: 16,
  },
  btn: {
    width: '100%',
    background: 'var(--primary)',
    color: 'white',
    padding: '12px',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--red)',
    fontSize: 13,
    marginBottom: 16,
  },
  footer: { textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(err.message);
    else navigate('/app');
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🧠</div>
        <div style={s.title}>Welcome back</div>
        <div style={s.subtitle}>Sign in to your MemoryVault account</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={s.footer}>
          Don't have an account? <Link to="/signup">Sign up free</Link>
        </div>
      </div>
    </div>
  );
}
