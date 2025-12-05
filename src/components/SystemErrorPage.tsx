/**
 * TITANE_INFINITY v15.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - SYSTEM ERROR PAGE
 * Page d'erreur système pour problèmes backend/services
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

interface SystemErrorPageProps {
  errorType: 'backend-offline' | 'service-unavailable' | 'connection-failed' | 'timeout';
  serviceName?: string;
  message?: string;
  retryAction?: () => void;
  retryDelay?: number;
}

/**
 * SystemErrorPage - Affiche une erreur système avec options de récupération
 */
export const SystemErrorPage: React.FC<SystemErrorPageProps> = ({
  errorType,
  serviceName = 'Service',
  message,
  retryAction,
  retryDelay = 5,
}) => {
  const [countdown, setCountdown] = React.useState(retryDelay);
  const [isRetrying, setIsRetrying] = React.useState(false);

  React.useEffect(() => {
    if (!retryAction || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1 && retryAction) {
          setIsRetrying(true);
          retryAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, retryAction]);

  const errorConfig = React.useMemo(() => {
    switch (errorType) {
      case 'backend-offline':
        return {
          icon: '🔌',
          title: 'Backend TITANE∞ Hors Ligne',
          description: 'Le backend Rust n\'est pas accessible. Vérifiez que le serveur est démarré.',
          color: '#ef4444',
          suggestions: [
            'Vérifier que Tauri est lancé correctement',
            'Redémarrer l\'application',
            'Consulter les logs backend dans la console',
          ],
        };
      case 'service-unavailable':
        return {
          icon: '⚙️',
          title: `${serviceName} Indisponible`,
          description: 'Le service demandé n\'est pas disponible actuellement.',
          color: '#f59e0b',
          suggestions: [
            'Attendre quelques secondes',
            'Vérifier la connexion réseau',
            'Réessayer l\'opération',
          ],
        };
      case 'connection-failed':
        return {
          icon: '📡',
          title: 'Échec de Connexion',
          description: 'Impossible de se connecter au service.',
          color: '#ef4444',
          suggestions: [
            'Vérifier la configuration réseau',
            'Vérifier les permissions Tauri',
            'Redémarrer l\'application',
          ],
        };
      case 'timeout':
        return {
          icon: '⏱️',
          title: 'Délai d\'Attente Dépassé',
          description: 'L\'opération a pris trop de temps.',
          color: '#f59e0b',
          suggestions: [
            'Réessayer l\'opération',
            'Vérifier la charge système',
            'Augmenter le délai d\'attente',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'Erreur Système',
          description: 'Une erreur système est survenue.',
          color: '#ef4444',
          suggestions: ['Consulter les logs', 'Redémarrer l\'application'],
        };
    }
  }, [errorType, serviceName]);

  const handleManualRetry = () => {
    if (retryAction) {
      setIsRetrying(true);
      retryAction();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base, #0a0a0a)',
        color: 'var(--text-primary, #ffffff)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          background: 'var(--bg-elevated, #141414)',
          border: `2px solid ${errorConfig.color}`,
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: `0 0 30px ${errorConfig.color}33`,
        }}
      >
        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{errorConfig.icon}</div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.5rem',
              color: errorConfig.color,
            }}
          >
            {errorConfig.title}
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
              margin: 0,
            }}
          >
            {message || errorConfig.description}
          </p>
        </div>

        {/* Suggestions */}
        <div
          style={{
            background: 'var(--bg-panel, #1a1a1a)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0,
              marginBottom: '1rem',
              color: 'var(--text-primary, #ffffff)',
            }}
          >
            💡 Solutions suggérées :
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.5rem',
              color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
            }}
          >
            {errorConfig.suggestions.map((suggestion, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {retryAction && (
            <button
              onClick={handleManualRetry}
              disabled={isRetrying}
              style={{
                padding: '0.875rem 1.5rem',
                background: isRetrying ? '#4b5563' : errorConfig.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isRetrying ? 0.6 : 1,
              }}
            >
              {isRetrying ? '⏳ Nouvelle tentative...' : countdown > 0 ? `🔄 Réessayer (${countdown}s)` : '🔄 Réessayer'}
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              color: 'var(--text-primary, #ffffff)',
              border: '2px solid var(--border-default, rgba(255, 255, 255, 0.1))',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = errorConfig.color;
              e.currentTarget.style.color = errorConfig.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default, rgba(255, 255, 255, 0.1))';
              e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
            }}
          >
            🔄 Recharger l'Application
          </button>

          <button
            onClick={() => {
              const tauri = (window as { __TAURI__?: { window: { getCurrent: () => { openDevtools: () => void } } } }).__TAURI__;
              tauri?.window.getCurrent().openDevtools();
            }}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              color: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
              border: '2px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔧 Ouvrir DevTools (F12)
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary, rgba(255, 255, 255, 0.5))',
              margin: 0,
            }}
          >
            TITANE∞ v15 | Error Recovery System
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemErrorPage;
