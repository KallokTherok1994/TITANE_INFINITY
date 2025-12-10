/**
 * TITANE_INFINITY v15.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - APP MINIMAL (TEST D'AFFICHAGE)
 * Version minimale pour valider que React s'affiche dans Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

export const AppMinimal: React.FC = () => {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    console.log('[AppMinimal] Component mounted successfully');
    return () => {
      console.log('[AppMinimal] Component unmounting');
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #727b81 0%, #93b399 50%, #8899aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
          }}
        >
          TITANE∞
        </h1>
        <p
          style={{
            fontSize: '1.5rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '0.5rem',
          }}
        >
          Frontend opérationnel
        </p>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          v15.3.0 - Interface de test minimale
        </p>
      </div>

      {/* Status Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#93b399',
          }}
        >
          ✅ React Mount Successful
        </h2>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '0.9375rem',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.8',
          }}
        >
          <li>✓ HTML structure: OK</li>
          <li>✓ React render: OK</li>
          <li>✓ Tauri window: OK</li>
          <li>✓ CSS styles: OK</li>
          <li>✓ State management: OK</li>
        </ul>
      </div>

      {/* Interactive Counter */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '1rem',
          }}
        >
          Test d'interactivité React
        </p>
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#6366f1',
            marginBottom: '1rem',
          }}
        >
          {counter}
        </div>
        <button
          onClick={() => setCounter(c => c + 1)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Incrémenter
        </button>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => console.log('Console test:', { timestamp: new Date(), counter })}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          🔍 Log to Console
        </button>
        <button
          onClick={() => {
            if (typeof window.__TAURI__ !== 'undefined') {
              window.__TAURI__.window.getCurrent().openDevtools();
            } else {
              console.warn('Tauri not available');
            }
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          🔧 Open DevTools (F12)
        </button>
      </div>

      {/* Info Footer */}
      <div
        style={{
          marginTop: '3rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.4)',
        }}
      >
        <p>Ouvrez la console DevTools (F12) pour voir les logs détaillés</p>
        <p style={{ marginTop: '0.5rem' }}>
          Environment: {import.meta.env.DEV ? 'Development' : 'Production'}
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Tauri:{' '}
          {typeof window.__TAURI__ !== 'undefined' ? '✅ Available' : '⚠️ Not detected'}
        </p>
      </div>
    </div>
  );
};

export default AppMinimal;
