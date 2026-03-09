import React from 'react';

const styles = {
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '48px 24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 14,
  },
};

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} MemoryVault. Built for the AI agent era.</p>
    </footer>
  );
}
