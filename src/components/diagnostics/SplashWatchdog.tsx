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
import { promises as fsPromises, join as joinPath } from '@/utils/tauriFsAdapter';

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
const DIAG_ENV_ENABLED =
  import.meta.env.VITE_TITANE_DIAG === '1' ||
  import.meta.env.TITANE_DIAG === '1' ||
  (typeof window !== 'undefined' && window.localStorage?.getItem('TITANE_DIAG') === '1');
const DIAG_DIR = 'runtime/diag';
const DIAG_FILE = 'frontend_boot.json';

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
  const [diagStatus, setDiagStatus] = useState<'idle' | 'pending' | 'saved' | 'error'>(
    'idle'
  );
  const [diagError, setDiagError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let checkInterval: NodeJS.Timeout | null = null;

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
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (checkInterval) {
          clearInterval(checkInterval);
        }
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (!timedOut || !DIAG_ENV_ENABLED) {
      return;
    }

    let cancelled = false;

    const writeDiagReport = async () => {
      setDiagStatus('pending');
      setDiagError(null);

      const w = window as typeof window & {
        __TITANE_BOOT__?: Record<string, unknown>;
      };

      const cspMeta = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
      ) as HTMLMetaElement | null;
      const moduleScript = document.querySelector('script[type="module"]') as
        | HTMLScriptElement
        | null;
      const moduleSrc = moduleScript?.src ?? null;

      let moduleProbe: {
        ok: boolean;
        status?: number;
        contentType?: string | null;
        error?: string;
      } | null = null;

      if (moduleSrc) {
        try {
          const response = await fetch(moduleSrc, { method: 'HEAD' });
          moduleProbe = {
            ok: response.ok,
            status: response.status,
            contentType: response.headers.get('content-type'),
          };
        } catch (error) {
          moduleProbe = {
            ok: false,
            error: String(error),
          };
        }
      }

      const report = {
        timestamp: new Date().toISOString(),
        url: typeof location !== 'undefined' ? String(location.href) : 'n/a',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a',
        protocol: typeof location !== 'undefined' ? location.protocol : 'n/a',
        cspMeta: cspMeta?.content ?? null,
        markers: w.__TITANE_BOOT__ ?? null,
        diagnostics,
        moduleSrc,
        moduleProbe,
      };

      try {
        await fsPromises.mkdir(DIAG_DIR, { recursive: true });
        const fullPath = joinPath(DIAG_DIR, DIAG_FILE);
        await fsPromises.writeFile(fullPath, JSON.stringify(report, null, 2), 'utf-8');
        if (!cancelled) {
          setDiagStatus('saved');
        }
      } catch (error) {
        if (!cancelled) {
          setDiagStatus('error');
          setDiagError(String(error));
        }
      }
    };

    void writeDiagReport();

    return () => {
      cancelled = true;
    };
  }, [timedOut, diagnostics]);

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

  return { diagnostics, timedOut, diagStatus, diagError, reload, copyDiagnostics };
};

/**
 * Composant de diagnostic affiché après timeout
 */
export const SplashWatchdog: React.FC = () => {
  const { diagnostics, timedOut, diagStatus, diagError, reload, copyDiagnostics } =
    useBootWatchdog();

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
            {DIAG_ENV_ENABLED && (
              <div>
                <span style={{ color: '#9ca3af' }}>DIAG PROD:</span>{' '}
                {diagStatus === 'pending' && <span style={{ color: '#f59e0b' }}>⏳ Écriture…</span>}
                {diagStatus === 'saved' && <span style={{ color: '#10b981' }}>✓ Rapport écrit</span>}
                {diagStatus === 'error' && (
                  <span style={{ color: '#ff4444' }}>✗ Échec ({diagError})</span>
                )}
              </div>
            )}
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
