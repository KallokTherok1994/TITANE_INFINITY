/**
 * TITANE_INFINITY v17.3 — Test minimal d'affichage
 * À utiliser pour debug uniquement
 */

import React from 'react';

export function AppTestMinimal() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, marginBottom: '1rem' }}>
        TITANE∞ v15
      </h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9, margin: 0, marginBottom: '2rem' }}>
        React monté avec succès !
      </p>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '1.5rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p style={{ margin: 0, fontSize: '1rem' }}>
          ⚡ Point d'entrée : <code>src/main.tsx</code>
        </p>
        <p style={{ margin: 0, fontSize: '1rem', marginTop: '0.5rem' }}>
          🎨 Composant : <code>App.tsx</code>
        </p>
        <p style={{ margin: 0, fontSize: '1rem', marginTop: '0.5rem' }}>
          🚀 État : <strong>Opérationnel</strong>
        </p>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.7 }}>
        Appuyez sur F12 pour ouvrir DevTools
      </p>
    </div>
  );
}
