/**
 * TITANE∞ — Remote Login Page
 *
 * Displayed in browser mode (non-Tauri context) when the user is not authenticated.
 * Collects the shared secret, calls getRemoteTransport().authenticate(), then
 * redirects to the main app via onAuthenticated().
 */

import React, { useState } from 'react';
import { getRemoteTransport } from '../lib/remoteTransport';

interface RemoteLoginPageProps {
  onAuthenticated: () => void;
}

export const RemoteLoginPage: React.FC<RemoteLoginPageProps> = ({ onAuthenticated }) => {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await getRemoteTransport().authenticate(secret.trim());
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentification échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="remote-login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '40px 36px',
          minWidth: 340,
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}
          >
            TITANE∞
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
            Accès distant sécurisé
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="remote-secret"
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.65)',
                fontSize: 13,
                marginBottom: 6,
                letterSpacing: '0.02em',
              }}
            >
              Clé d'accès
            </label>
            <input
              id="remote-secret"
              data-testid="remote-login-secret-input"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Entrez votre clé partagée"
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99,102,241,0.6)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              data-testid="remote-login-error"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            data-testid="remote-login-submit"
            disabled={loading || !secret.trim()}
            style={{
              width: '100%',
              padding: '11px 0',
              background: loading
                ? 'rgba(99,102,241,0.4)'
                : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !secret.trim() ? 'not-allowed' : 'pointer',
              opacity: !secret.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s, transform 0.1s',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.25)',
            fontSize: 12,
            marginTop: 24,
            marginBottom: 0,
          }}
        >
          Connexion chiffrée via TITANE Remote Gateway
        </p>
      </div>
    </div>
  );
};

export default RemoteLoginPage;
