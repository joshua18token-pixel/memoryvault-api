import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'rgba(10, 10, 15, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 800,
    fontSize: 20,
    color: 'var(--text)',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 24,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  link: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  activeLink: {
    color: 'var(--primary)',
  },
  cta: {
    background: 'var(--primary)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
  },
};

export default function Navbar() {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        ...styles.link,
        ...(location.pathname === to ? styles.activeLink : {}),
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🧠</span>
          MemoryVault
        </Link>
        <div style={styles.links}>
          {navLink('/', 'Home')}
          {navLink('/demo', 'Live Demo')}
          {navLink('/docs', 'Docs')}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            GitHub
          </a>
          <Link to="/login" style={styles.link}>Sign In</Link>
          <Link to="/signup" style={{ ...styles.cta, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
