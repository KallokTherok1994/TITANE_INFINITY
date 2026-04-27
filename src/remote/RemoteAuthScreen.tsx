/**
 * TITANE∞ Remote — Auth Screen
 * data-testid: remote-auth-screen, remote-api-key-input, remote-gateway-url-input, remote-login-button
 */

import React, { useState, FormEvent } from 'react';

interface RemoteAuthScreenProps {
  onLogin: (gatewayUrl: string, secret: string) => void;
  loading: boolean;
  error: string | null;
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '24px',
    background: 'var(--bg)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logo: {
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6e5bff 0%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '2px',
    marginBottom: '4px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    marginTop: '-12px',
  },
  label: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0d0d1a',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    color: 'var(--error)',
    fontSize: '13px',
    textAlign: 'center',
  },
};

export default function RemoteAuthScreen({
  onLogin,
  loading,
  error,
}: RemoteAuthScreenProps) {
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [secret, setSecret] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (gatewayUrl.trim() && secret.trim()) {
      onLogin(gatewayUrl.trim(), secret.trim());
    }
  };

  return (
    <div style={styles.screen} data-testid="remote-auth-screen">
      <div style={styles.card}>
        <div style={styles.logo}>TITANE∞</div>
        <p style={styles.subtitle}>Intelligence distante • Connexion sécurisée</p>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <label style={styles.label} htmlFor="remote-gateway-url">
              URL de la Gateway
            </label>
            <input
              id="remote-gateway-url"
              data-testid="remote-gateway-url-input"
              style={styles.input}
              type="url"
              placeholder="https://abc.trycloudflare.com"
              value={gatewayUrl}
              onChange={e => setGatewayUrl(e.target.value)}
              required
              autoComplete="url"
            />
          </div>

          <div>
            <label style={styles.label} htmlFor="remote-api-key">
              Clé API / Secret
            </label>
            <input
              id="remote-api-key"
              data-testid="remote-api-key-input"
              style={styles.input}
              type="password"
              placeholder="tsec_••••••••••••••••"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            data-testid="remote-login-button"
            style={{
              ...styles.button,
              opacity: loading || !gatewayUrl.trim() || !secret.trim() ? 0.65 : 1,
              cursor:
                loading || !gatewayUrl.trim() || !secret.trim()
                  ? 'not-allowed'
                  : 'pointer',
            }}
            type="submit"
            disabled={loading || !gatewayUrl.trim() || !secret.trim()}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
