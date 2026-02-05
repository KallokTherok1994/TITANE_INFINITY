/**
 * TITANE_INFINITY v27.0.1 — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * SPLASH WATCHDOG - Anti-Freeze Diagnostic (P0.Ω∞.PROD_SPLASH_PERMASEAL)
 * 
 * But: Empêcher le blocage infini sur l'écran "TITANE∞ — Chargement…"
 * Garantie: Always-Respond UI (même en cas d'échec boot)
 * Timeout: 10s (si [BOOT] after render non atteint)
 * Fallback: Écran diagnostic exploitable
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';

type BootStage = string;

interface BootDiagnostics {
  stage: BootStage;
  timestamp: number;
  errors: string[];
  backendStatus?: 'ok' | 'error' | 'unknown';
  lastLogs?: string[];
}

const WATCHDOG_TIMEOUT_MS = 10000; // 10s
const BOOT_COMPLETE_STAGE = '[BOOT] after render';

/**
 * Hook qui surveille le boot et expose les diagnostics
 */
const useBootWatchdog = () => {
  const [diagnostics, setDiagnostics] = useState<BootDiagnostics>({
    stage: 'unknown',
    timestamp: Date.now(),
    errors: [],
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeoutId: NodeJS.Timeout = setTimeout(() => setTimedOut(true), WATCHDOG_TIMEOUT_MS);
    const checkInterval: NodeJS.Timeout = setInterval(() => {
      // checkBootProgress logic
    }, 500);

    const checkBootProgress = () => {
      const w = window as typeof window & {
        __TITANE_BOOT__?: { stage: string; timestamp: number };
      };

      const currentStage = w.__TITANE_BOOT__?.stage ?? 'unknown';
      const currentTimestamp = w.__TITANE_BOOT__?.timestamp ?? Date.now();

      // Collecter erreurs JS capturées
      const errors: string[] = [];
      try {
        const errorLogs = window.localStorage.getItem('titane_boot_errors');
        if (errorLogs) {
          errors.push(...JSON.parse(errorLogs));
        }
      } catch {
        // Ignore
      }

      setDiagnostics(prev => ({
        ...prev,
        stage: currentStage,
        timestamp: currentTimestamp,
        errors,
      }));

      // Si boot complété, désactiver watchdog
      if (currentStage === BOOT_COMPLETE_STAGE) {
        clearTimeout(timeoutId);
        clearInterval(checkInterval);
        setTimedOut(false);
      }
    };

    // Vérifier boot state toutes les 500ms
    checkInterval = setInterval(checkBootProgress, 500);

    // Timeout après 10s si boot non complété
    timeoutId = setTimeout(() => {
      const w = window as typeof window & {
        __TITANE_BOOT__?: { stage: string };
      };

      const currentStage = w.__TITANE_BOOT__?.stage ?? 'unknown';

      if (currentStage !== BOOT_COMPLETE_STAGE) {
        console.error('⚠️ [WATCHDOG] Boot timeout - UI non montée après 10s');
        setTimedOut(true);

        // Tenter de récupérer status backend
        secureInvoke<{ healthy: boolean }>('get_system_health')
          .then(health => {
            setDiagnostics(prev => ({
              ...prev,
              backendStatus: health.healthy ? 'ok' : 'error',
            }));
          })
          .catch(() => {
            setDiagnostics(prev => ({
              ...prev,
              backendStatus: 'unknown',
            }));
          });
      }
    }, WATCHDOG_TIMEOUT_MS);

    // Initial check
    checkBootProgress();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(checkInterval);
    };
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  const copyDiagnostics = useCallback(() => {
    const text = JSON.stringify(diagnostics, null, 2);
    navigator.clipboard.writeText(text).then(
      () => console.log('✅ Diagnostics copiés'),
      () => console.error('❌ Échec copie clipboard')
    );
  }, [diagnostics]);

  return { diagnostics, timedOut, reload, copyDiagnostics };
};

/**
 * Composant de diagnostic affiché après timeout
 */
export const SplashWatchdog: React.FC = () => {
  const { diagnostics, timedOut, reload, copyDiagnostics } = useBootWatchdog();

  if (!timedOut) {
    // Boot normal, ne rien afficher
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        color: '#e5e7eb',
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          background: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid rgba(255, 68, 68, 0.5)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 12px 40px rgba(255, 68, 68, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ff4444',
              }}
            >
              TITANE∞ Boot Diagnostic
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
              L'application n'a pas terminé son chargement
            </p>
          </div>
        </div>

        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              color: '#00d4ff',
              fontWeight: 600,
            }}
          >
            État du démarrage
          </h2>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Dernière étape:</span>{' '}
              <code
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {diagnostics.stage}
              </code>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Backend:</span>{' '}
              {diagnostics.backendStatus === 'ok' && (
                <span style={{ color: '#10b981' }}>✓ Connecté</span>
              )}
              {diagnostics.backendStatus === 'error' && (
                <span style={{ color: '#ff4444' }}>✗ Erreur</span>
              )}
              {diagnostics.backendStatus === 'unknown' && (
                <span style={{ color: '#f59e0b' }}>? Inconnu</span>
              )}
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Timeout:</span>{' '}
              {(WATCHDOG_TIMEOUT_MS / 1000).toFixed(0)}s dépassé
            </div>
          </div>

          {diagnostics.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  color: '#ff8888',
                  fontWeight: 600,
                }}
              >
                Erreurs capturées ({diagnostics.errors.length})
              </h3>
              <div
                style={{
                  maxHeight: '120px',
                  overflow: 'auto',
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                }}
              >
                {diagnostics.errors.map((err, i) => (
                  <div key={i} style={{ marginBottom: '0.25rem' }}>
                    {err}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={reload}
            style={{
              flex: '1 1 auto',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Relancer
          </button>
          <button
            onClick={copyDiagnostics}
            style={{
              flex: '1 1 auto',
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e5e7eb',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📋 Copier diagnostic
          </button>
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#9ca3af',
          }}
        >
          <strong style={{ color: '#60a5fa' }}>Dépannage:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
            <li>Vérifiez la console DevTools (F12) pour plus de détails</li>
            <li>Si le problème persiste, essayez de vider le cache (Ctrl+Shift+R)</li>
            <li>
              Copiez le diagnostic et contactez l'équipe support si nécessaire
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
