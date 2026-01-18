/**
 * TITANE∞ v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🔥 BOOT ERROR FALLBACK
 * Interface utilisateur robuste pour les erreurs de démarrage
 */

import React from 'react';

interface BootErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  onClearCache?: () => void;
}

export function BootErrorFallback({
  error,
  onRetry,
  onClearCache: _onClearCache,
}: BootErrorFallbackProps) {
  const isModuleScriptError = error?.message?.includes(
    'Importing a module script failed'
  );

  const handleClearCacheReload = () => {
    // Clear localStorage flag for cache clearing
    localStorage.setItem('titane_clear_cache', '1');
    window.location.reload();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{ marginBottom: '2rem', fontSize: '4rem', animation: 'pulse 2s infinite' }}
      >
        ⚡
      </div>
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#ff6b6b',
          fontWeight: 'bold',
        }}
      >
        Erreur de Démarrage TITANE∞
      </h1>

      {isModuleScriptError ? (
        <div style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <p style={{ color: '#ffd93d', marginBottom: '1rem', fontSize: '1.1rem' }}>
            ⚠️ Erreur de chargement de module détectée
          </p>
          <p
            style={{
              color: '#aaa',
              fontSize: '0.95rem',
              marginBottom: '1rem',
              lineHeight: '1.5',
            }}
          >
            Un module JavaScript n&apos;a pas pu être chargé. Cela peut être dû à un cache
            corrompu, une dépendance incompatible, ou un problème de réseau.
          </p>
          <details
            style={{
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.3)',
            }}
          >
            <summary
              style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#ff6b6b' }}
            >
              📋 Détails de l&apos;erreur
            </summary>
            <pre
              style={{
                fontSize: '0.8rem',
                color: '#ccc',
                overflow: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {error?.stack || error?.message || 'Aucun détail disponible'}
            </pre>
          </details>
        </div>
      ) : (
        <div style={{ marginBottom: '2rem', maxWidth: '500px' }}>
          <p style={{ color: '#aaa', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Une erreur inattendue s&apos;est produite lors du démarrage de
            l&apos;application.
          </p>
          {error && (
            <details
              style={{
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Détails
              </summary>
              <pre style={{ fontSize: '0.8rem', color: '#ccc', overflow: 'auto' }}>
                {error.message}
              </pre>
            </details>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handleRetry}
          style={{
            background: 'linear-gradient(45deg, #007acc, #0099ff)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(0, 122, 204, 0.4)',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0px)')}
        >
          🔄 Réessayer
        </button>

        <button
          onClick={handleClearCacheReload}
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0px)')}
        >
          🧹 Nettoyer Cache & Recharger
        </button>

        <button
          onClick={() => {
            console.log('🔧 TITANE∞ Boot Diagnostic Info:', {
              error: error?.message,
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date().toISOString(),
              diagnostics: (
                window as unknown as { __TITANE_BOOT_DIAGNOSTICS__?: unknown }
              ).__TITANE_BOOT_DIAGNOSTICS__,
            });
            window.open(
              'https://github.com/KallokTherok1994/TITANE_INFINITY/issues',
              '_blank'
            );
          }}
          style={{
            background: 'linear-gradient(45deg, #6c757d, #868e96)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(108, 117, 125, 0.4)',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0px)')}
        >
          📝 Signaler le Bug
        </button>
      </div>

      <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '2rem' }}>
        TITANE∞ v26.3.0 | Appuyez sur F12 pour ouvrir DevTools
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
        `,
        }}
      />
    </div>
  );
}
