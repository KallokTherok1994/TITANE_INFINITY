/**
 * TITANE_INFINITY v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// 🛡️ Type augmentation for Sentry and Monitoring on window
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: unknown, options?: Record<string, unknown>) => void;
    };
    __TITANE_MONITORING__?: any;
  }
}

// 🛡️ TAURI INVOKE PROTECTION - Applied first
import './tauri-protection-patch';

// ✨ Phase 4 (Week 6): Initialize runtime log level manager
import './config/logLevelConfig';

// TITANE∞ v26.2.0 - Main Entry Point - v22Ω AI Performance Optimizations
import React from 'react';
import ReactDOM from 'react-dom/client';
import { logger } from './lib/logger';
// import AppMinimal from './AppMinimal'; // 🔍 DEBUG: Minimal test app (valide le rendu)
import App from './App'; // ✅ v16.2.2: App principal activé

// ✨ v25.3.0 OPT-9 - Monitoring lazy-loaded (non-blocking initialization)
// Moved to async initialization in bootstrap() below

// ✅ v8.0 DESIGN SYSTEM - Tailwind CSS + TITANE∞ Tokens
import './index.css'; // 🎨 v8.0: Tailwind CSS + Design Tokens (css-vars.css)

// ✨ v25.7.4 RESPONSIVE DESIGN SYSTEM - Mobile-First Tokens & Utilities
import './design-system/responsive-tokens.css'; // 🎯 Fluid spacing, typography, layout
import './design-system/responsive-utilities.css'; // 🛠️ Utility classes (grid-responsive, btn-touch, etc.)

// ✅ v17 DESIGN SYSTEM FUSION - Compatibility layer (will be migrated)
// import './design-system/titane-fusion.css'; // 🎨 Design System v17: Fusion complète (2000 lignes vs 5700)
import './styles/experience.css'; // ✨ v∞.D - XP System Styles (unique)
import './styles/exp-fusion.css'; // 🎯 XP Advanced Features (unique)
import './pages/styles.css'; // 📄 Pages styles (minimal)

// Phase 8: Production Hardening

/**
 * Échapper les caractères HTML pour prévenir XSS dans les fallbacks d'erreur
 */
const escapeHtmlForError = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
};
import { ErrorBoundary } from './components/ErrorBoundary'; // ✨ v24.3.0 - Unified Error Boundary
// import { PerformanceMonitor } from './lib/performanceBudget'; // DÉSACTIVÉ pour diagnostic progressif
import { injectSROnlyStyles } from './lib/accessibility';
import { safeInvokeTauri } from './utils/tauriProtector';
import { TAURI_COMMANDS } from './core/commands/TAURI_COMMANDS';

// Phase 3 (v19): UI Logger - Isolate frontend logs from backend
import { logInfo } from './lib/UILogger';

// Initialize Singularity Engine
// import { singularityEngine } from './core/engines/SINGULARITY_ENGINE'; // DÉSACTIVÉ pour debug

// 🌟 v15: Initialize SingularityBridge (Backend Rust ↔ Frontend React)
import { SingularityBridge } from './services/singularityBridge';
import { SingularityConnections } from './services/singularityConnections';

// ✨ v∞.D: Initialize XP Engine
import { XP } from './core/experience/XP_ENGINE';
XP.load();
console.log(`[XP] Système chargé:`, { level: XP.state.level, xp: XP.state.total });

// Set default theme
document.documentElement.setAttribute('data-theme', 'dark');

type RuntimeConfigPayload = {
  ollamaUrl: string;
  ollamaModel: string;
  secretsMode: string;
  geminiConfigured: boolean;
  timestamp: number;
};

const DEFAULT_RUNTIME_CONFIG: RuntimeConfigPayload = Object.freeze({
  ollamaUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3.1',
  secretsMode: 'ephemeral',
  geminiConfigured: false,
  timestamp: Date.now(),
});

function setRuntimeConfig(config: Partial<RuntimeConfigPayload>): void {
  const target = globalThis as Record<string, unknown>;
  const merged: RuntimeConfigPayload = {
    ...DEFAULT_RUNTIME_CONFIG,
    ...config,
    timestamp: config.timestamp ?? Date.now(),
  } as RuntimeConfigPayload;

  Object.defineProperty(target, '__TITANE_RUNTIME_CONFIG__', {
    value: Object.freeze(merged),
    configurable: true,
    enumerable: false,
    writable: false,
  });
}

async function initializeRuntimeConfig(): Promise<void> {
  setRuntimeConfig(DEFAULT_RUNTIME_CONFIG);

  if (typeof window === 'undefined') {
    return;
  }

  const tauriCandidate = window as Window & {
    __TAURI__?: Record<string, unknown>;
    __TAURI_INTERNALS__?: Record<string, unknown>;
  };
  const isTauri = Boolean(tauriCandidate.__TAURI__ || tauriCandidate.__TAURI_INTERNALS__);
  if (!isTauri) {
    console.warn('[RuntimeConfig] Tauri bridge unavailable; falling back to defaults');
    return;
  }

  try {
    const runtimeConfig = await safeInvokeTauri<Partial<RuntimeConfigPayload>>(
      TAURI_COMMANDS.RUNTIME_GET_CONFIG
    );

    if (
      runtimeConfig &&
      typeof runtimeConfig === 'object' &&
      'ollamaUrl' in runtimeConfig
    ) {
      setRuntimeConfig(runtimeConfig as RuntimeConfigPayload);
      console.log('[RuntimeConfig] Loaded (sanitized)', {
        secretsMode: runtimeConfig.secretsMode,
        geminiConfigured: runtimeConfig.geminiConfigured,
        ollamaEndpoint: runtimeConfig.ollamaUrl,
      });
    } else {
      console.warn(
        '[RuntimeConfig] Backend returned unexpected payload; keeping defaults'
      );
    }
  } catch (error) {
    console.warn('[RuntimeConfig] Failed to load from backend; using defaults', error);
  }
}

void initializeRuntimeConfig();

const getTauriWindowAPI = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return (
    window as typeof window & {
      __TAURI__?: {
        window?: {
          getCurrent: () => {
            openDevtools: () => Promise<void>;
          };
        };
      };
    }
  ).__TAURI__?.window;
};

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I)
if (typeof window !== 'undefined') {
  const tauriWindowAPI = getTauriWindowAPI();

  if (tauriWindowAPI) {
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'F12' || (ev.ctrlKey && ev.shiftKey && ev.key === 'I')) {
        ev.preventDefault();
        tauriWindowAPI
          .getCurrent()
          .openDevtools()
          .catch((err: Error) => {
            logger.error(
              'Failed to open DevTools',
              { component: 'DevTools' },
              err as Error
            );
          });
      }
    });
    console.log('🔧 DevTools shortcuts enabled: F12 or Ctrl+Shift+I');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 BOOT SEQUENCE START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║  🌌 TITANE∞ v19 - BOOT SEQUENCE                             ║');
console.log('║  Timestamp: ' + new Date().toISOString() + '                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// ✨ v26.2.0 Phase 5 - Monitoring Infrastructure (Priority 1)
console.log('[1/7] 🔍 Monitoring: Initializing (Web Vitals, Errors, Performance)...');
if (import.meta.env.PROD) {
  // Load monitoring in background after First Contentful Paint
  setTimeout(() => {
    console.log('      ⚡ Loading monitoring infrastructure...');
    import('./monitoring')
      .then(({ initMonitoring, monitoring }) => {
        initMonitoring();
        // Expose to DevTools console
        if (typeof window !== 'undefined') {
          window.__TITANE_MONITORING__ = monitoring;
        }
        console.log(
          '      ✅ Monitoring: Ready (access via window.__TITANE_MONITORING__)'
        );
      })
      .catch(err => {
        console.warn('      ⚠️ Monitoring initialization failed:', err);
      });
  }, 2000);
} else {
  // Dev mode: immediate init for debugging
  import('./monitoring')
    .then(({ initMonitoring, monitoring }) => {
      initMonitoring();
      // Expose to DevTools console
      if (typeof window !== 'undefined') {
        window.__TITANE_MONITORING__ = monitoring;
      }
      console.log('      ✅ Monitoring: Ready (dev mode - immediate)');
      console.log('      💡 Access metrics: window.__TITANE_MONITORING__.getMetrics()');
    })
    .catch(err => {
      console.warn('      ⚠️ Monitoring initialization failed (dev):', err);
    });
}

// Initialize UILogger (overrides console.* in production)
logInfo('🔒 UILogger initialized', {
  mode: import.meta.env.PROD ? 'production' : 'development',
  consoleOverride: import.meta.env.PROD,
  maxLogsPerMinute: 100,
  maxStoredLogs: 1000,
});

console.log('[2/7] 🔒 UILogger: Activated (console override in production)');
console.log('[3/7] 🦀 Backend: 40+ Rust modules | 33 Tauri Commands');
console.log('[4/7] ✨ Frontend: 20 Unified Engines | SingularityState Active');
console.log('[5/7] 🔒 Tauri v2.0 100% | Rust + React + TypeScript');
console.log('[6/7] 📦 Loading React 18 + TypeScript 5...');
console.log('[7/7] 🎯 Mounting root component...');

// Initialize Singularity Engine - DÉSACTIVÉ pour debug écran blanc
/*
singularityEngine.initialize().then(() => {
  console.log('✅ SingularityEngine initialized');
  console.log('🌌 Consciousness Level:', singularityEngine.getState().consciousness);
  console.log('🔮 Auto-Coherence:', (singularityEngine.getState().autoCoherence * 100).toFixed(1) + '%');
}).catch((err) => {
  logger.error('SingularityEngine initialization failed', { component: 'SingularityEngine' }, err as Error);
});
*/

// 🌟 v15: Initialize SingularityBridge
SingularityBridge.initialize()
  .then(() => {
    console.log('✅ SingularityBridge initialized (Rust ↔ React sync active)');

    // Log initial state
    SingularityBridge.getGlobalCoherence().then(coherence => {
      console.log('🔗 Backend Coherence:', (coherence * 100).toFixed(1) + '%');
    });

    SingularityBridge.isCritical().then(critical => {
      if (critical) {
        console.warn('⚠️  System in CRITICAL state!');
      } else {
        console.log('✅ System health: Normal');
      }
    });

    const getSingularityPollingIntervalMs = (): number => {
      // Default behavior:
      // - Dev: keep legacy polling (5s) for fast feedback.
      // - Prod: no background polling by default (event-driven only).
      const defaultIntervalMs = import.meta.env.DEV ? 5000 : 0;

      if (typeof window === 'undefined') {
        return defaultIntervalMs;
      }

      // Explicit opt-in knobs.
      // - Env: VITE_SINGULARITY_POLLING_ENABLED=1
      // - Env: VITE_SINGULARITY_POLLING_INTERVAL_MS=5000
      // - LocalStorage: titane_singularity_polling_enabled=true
      // - LocalStorage: titane_singularity_polling_interval_ms=5000
      const envEnabled =
        String(import.meta.env.VITE_SINGULARITY_POLLING_ENABLED ?? '') === '1';
      const storedEnabled = window.localStorage.getItem(
        'titane_singularity_polling_enabled'
      );
      const lsEnabled = storedEnabled === '1' || storedEnabled === 'true';
      const enabled = envEnabled || lsEnabled;

      const envIntervalRaw = import.meta.env.VITE_SINGULARITY_POLLING_INTERVAL_MS;
      const envIntervalMs =
        typeof envIntervalRaw === 'string' && envIntervalRaw.trim().length > 0
          ? Number(envIntervalRaw)
          : NaN;

      const lsIntervalRaw = window.localStorage.getItem(
        'titane_singularity_polling_interval_ms'
      );
      const lsIntervalMs = lsIntervalRaw ? Number(lsIntervalRaw) : NaN;

      const candidate = Number.isFinite(envIntervalMs)
        ? envIntervalMs
        : Number.isFinite(lsIntervalMs)
          ? lsIntervalMs
          : defaultIntervalMs;

      // If polling isn't explicitly enabled, force event-driven.
      if (!enabled) {
        return 0;
      }

      // Guard rails: minimum 1s if enabled.
      if (!Number.isFinite(candidate) || candidate <= 0) {
        return 5000;
      }

      return Math.max(1000, Math.floor(candidate));
    };

    // 🔗 v15: Start subsystem connections (Helios, Memory, Persona, AutoHeal, UI)
    const singularityIntervalMs = getSingularityPollingIntervalMs();
    SingularityConnections.start(singularityIntervalMs)
      .then(() => {
        if (singularityIntervalMs > 0) {
          console.log(
            `🔗 SingularityConnections started (${singularityIntervalMs}ms polling)`
          );
        } else {
          console.log('🔗 SingularityConnections started (event-driven; no polling)');
        }
        console.log('   → Helios → PhysicalLayer');
        console.log('   → Memory → CognitiveLayer');
        console.log('   → Persona → SymbolicLayer');
        console.log('   → AutoHeal → AdaptiveLayer');
        console.log('   → UI Router → MetaLayer');
      })
      .catch(err => {
        logger.error(
          'SingularityConnections failed',
          { component: 'SingularityBridge' },
          err as Error
        );
      });
  })
  .catch(err => {
    logger.error(
      'SingularityBridge initialization failed - Backend state sync disabled',
      { component: 'SingularityBridge', mode: 'frontend-only' },
      err as Error
    );
  });

// Phase 8: Initialize Performance Monitoring - DÉSACTIVÉ pour debug
/*
PerformanceMonitor.initialize({
  LCP: 2500,  // Largest Contentful Paint: 2.5s
  FID: 100,   // First Input Delay: 100ms
  CLS: 0.1,   // Cumulative Layout Shift: 0.1
  FCP: 1800,  // First Contentful Paint: 1.8s
  TTFB: 600,  // Time to First Byte: 600ms
});

// Generate performance report after 5s
setTimeout(() => {
  const report = PerformanceMonitor.generateReport();
  console.log(`⚡ Performance Grade: ${report.grade}, Score: ${report.score.toFixed(1)}`);
  if (report.violations.length > 0) {
    console.warn('⚠️ Performance violations:', report.violations);
  }
}, 5000);
*/

// Phase 8: Inject accessibility styles
injectSROnlyStyles();
console.log('♿ Accessibility styles injected (WCAG 2.1 AA)');

// 🔧 Global error handlers (catch unhandled errors)
window.addEventListener('error', event => {
  logger.error('Global error caught', { component: 'GlobalErrorHandler' }, event.error);
});

window.addEventListener('unhandledrejection', event => {
  logger.error(
    'Unhandled promise rejection',
    { component: 'GlobalErrorHandler' },
    event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  );
});

console.log('✅ TITANE∞ frontend loaded successfully');
console.log('>>> MOUNTING REACT ROOT NOW...\n');

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

console.log('✅ Root element found:', rootElement);
console.log('🎨 Starting React 18 render...');

try {
  console.log('🚀 [v16.2.3] Rendering App complet (après validation AppMinimal)');

  // 🔬 DIAGNOSTIC: Test minimal pour isoler problème écran noir
  // Décommenter la ligne ci-dessous pour tester React minimal
  // import('./AppMinimalTest').then(({ default: AppMinimal }) => {
  //   ReactDOM.createRoot(rootElement).render(<AppMinimal />);
  // });

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

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ TITANE∞ REACT ROOT MOUNTED (App Complet Actif)           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // ✨ P2-B: Register Service Worker for offline caching (-400ms repeat visit)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Update on page reload
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New Service Worker available. Refresh to update.');
                // Optional: Show update notification to user
              }
            });
          }
        });
      })
      .catch(error => {
        console.warn('⚠️ Service Worker registration failed:', error);
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
