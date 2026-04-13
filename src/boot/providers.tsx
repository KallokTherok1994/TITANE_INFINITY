/**
 * TITANE_INFINITY — Boot: Providers (React Root Mount)
 * Extracted from src/main.tsx (pure refactor, no behavior change).
 *
 * Exports: mountReactRoot
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from '../components/ErrorBoundary';
import App from '../App';
import { logger } from '../lib/logger';
import { escapeHtmlForError } from './errorRecovery';
import { isTauriRuntime } from './bootSequence';

export const mountReactRoot = (): void => {
  // ⚡ FIX: NON-MAIN WINDOW GUARD
  // Root cause: secondary window pre-created in tauri.conf.json (no dedicated URL)
  // loads full React bundle → duplicate App.tsx useEffects + Ollama probes + WebKit crash
  // Evidence: tauri.conf.json:47-63, App.tsx:456, main.rs:952+976, ollama.ts:156-165
  const _titaneCurrentWindowLabel: string = (() => {
    try {
      const internals = (window as any).__TAURI_INTERNALS__;
      const label = internals?.metadata?.currentWindow?.label;
      return typeof label === 'string' && label.length > 0 ? label : 'main';
    } catch {
      return 'main';
    }
  })();

  if (_titaneCurrentWindowLabel !== 'main') {
    // Non-main window (e.g. secondary-floating): mount minimal stub only.
    // Prevents: duplicate Ollama probes, duplicate boot useEffects, WebKit crash.
    const _nonMainRoot = document.getElementById('root');
    if (_nonMainRoot) {
      ReactDOM.createRoot(_nonMainRoot).render(
        <React.StrictMode>
          <div
            id="titane-secondary-window-stub"
            data-window-label={_titaneCurrentWindowLabel}
            data-boot-status="minimal-non-main"
            aria-hidden="true"
            style={{ display: 'none' }}
          />
        </React.StrictMode>
      );
    }
    // Signal a completed minimal boot for secondary windows to avoid watchdog reload loops.
    window.__TITANE_BOOT_READY__ = true;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.titaneBootReady = '1';
    }
    logger.info(
      `[TITANE] Non-main window "${_titaneCurrentWindowLabel}" — minimal mode active (boot dedup)`
    );
    return;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 REACT ROOT MOUNT - Point critique d'affichage
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    const errorMsg = '❌ CRITICAL: #root element not found in DOM!';
    logger.error(errorMsg, { component: 'RootElement' });

    // Fallback visuel si #root manque
    document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #0a0a0a;
      color: #ff4444;
      font-family: monospace;
      padding: 2rem;
      text-align: center;
    ">
      <div>
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ TITANE∞ Boot Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">${escapeHtmlForError(errorMsg)}</p>
        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 8px; text-align: left; overflow: auto;">${escapeHtmlForError(document.documentElement.outerHTML)}</pre>
      </div>
    </div>
  `;
    throw new Error(errorMsg);
  }

  logger.info('✅ Root element found');
  logger.info('🎨 Starting React 18 render...');

  try {
    logger.info('🚀 [v16.2.3] Rendering App complet (après validation AppMinimal)');

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary
          context="App"
          onError={(error, errorInfo) => {
            logger.error(
              'Production Error Boundary caught',
              {
                component: 'ErrorBoundary',
                componentStack: errorInfo.componentStack,
              },
              error
            );

            // Hook for Sentry/LogRocket integration
            if (window.Sentry) {
              window.Sentry.captureException(error, {
                contexts: { react: { componentStack: errorInfo.componentStack } },
              });
            }
          }}
        >
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    logger.info('\n╔════════════════════════════════════════════════════════════════╗');
    logger.info('║  ✅ TITANE∞ REACT ROOT MOUNTED (App Complet Actif)           ║');
    logger.info('╚════════════════════════════════════════════════════════════════╝\n');

    // ✨ P2-B: Register Service Worker for offline caching (-400ms repeat visit)
    // In Tauri, service workers can create persistent caching issues across builds.
    if (!isTauriRuntime() && 'serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          logger.info(`✅ Service Worker registered: ${registration.scope}`);

          // Update on page reload
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  logger.info('🔄 New Service Worker available. Refresh to update.');
                  // Optional: Show update notification to user
                }
              });
            }
          });
        })
        .catch(error => {
          logger.warn('⚠️ Service Worker registration failed:');
        });
    }
  } catch (error) {
    logger.error(
      'CRITICAL: React mount failed',
      { component: 'ReactMount' },
      error as Error
    );

    // Fallback visuel en cas d'erreur React
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a0a;
      color: #ff4444;
      font-family: monospace;
      padding: 2rem;
      text-align: center;
    ">
      <div style="max-width: 800px;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ TITANE∞ React Mount Error</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #ff8888;">${escapeHtmlForError(errorMsg)}</p>
        <details style="text-align: left; background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <summary style="cursor: pointer; color: #888; margin-bottom: 0.5rem;">Stack Trace</summary>
          <pre style="font-size: 0.75rem; color: #aaa; overflow: auto;">${escapeHtmlForError(errorStack || '')}</pre>
        </details>
        <p style="color: #888; font-size: 0.875rem;">Appuyez sur F12 pour ouvrir la console DevTools</p>
        <button
          onclick="window.location.reload()"
          style="
            margin-top: 1rem;
            background: #6366f1;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          "
        >
          🔄 Recharger
        </button>
      </div>
    </div>
  `;
    throw error;
  }
}; // end non-main window guard (FIX: UI_BOOT_DUPLICATION + OLLAMA_PROBE_STORM)
