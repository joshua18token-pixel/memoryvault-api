import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420 },
  logo: { textAlign: 'center', fontSize: 32, marginBottom: 8 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' },
  input: { width: '100%', background: '#1a1a26', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font)', outline: 'none', marginBottom: 16 },
  btn: { width: '100%', background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 16 },
  success: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--green)', fontSize: 13, marginBottom: 16 },
  footer: { textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 },
  bonus: { textAlign: 'center', marginTop: 16, padding: '12px', background: 'var(--green-glow)', borderRadius: 8, fontSize: 13, color: 'var(--green)' },
};

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signUp(email, password, name);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>✉️</div>
          <div style={s.title}>Check your email</div>
          <div style={{ ...s.subtitle, marginBottom: 16 }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </div>
          <div style={s.bonus}>🎁 You'll get $1.00 in free credits when you confirm!</div>
          <div style={s.footer}>
            Already confirmed? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🧠</div>
        <div style={s.title}>Create your account</div>
        <div style={s.subtitle}>Start chatting with AI that remembers you</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Display Name</label>
          <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Drew" required />
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up Free'}
          </button>
        </form>
        <div style={s.bonus}>🎁 Every new account gets $1.00 in free credits</div>
        <div style={s.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
