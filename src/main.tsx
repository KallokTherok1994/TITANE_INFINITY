/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// 🛡️ TAURI INITIALIZATION FIX - Assure que Tauri est bien disponible
import './tauri-init-fix';

// 🛡️ TAURI INVOKE PROTECTION - Applied after init fix
import './tauri-protection-patch';

// 🌐 BROWSER MODE ADAPTER - Configure pour mode navigateur si nécessaire
import './utils/browserModeAdapter';

// ✨ Phase 4 (Week 6): Initialize runtime log level manager
import './config/logLevelConfig';

// TITANE∞ v30.0.0 - Main Entry Point - Certification P10.4→P11 PASS
import { setErrorToastDispatcher } from './lib/errorHandler';
import { useUIStore } from './stores/uiStore';
import { logger } from './lib/logger';
import { SingularityBridge } from './services/singularityBridge';
import { SingularityConnections } from './services/singularityConnections';
import { injectSROnlyStyles } from './lib/accessibility';
import { logInfo } from './lib/UILogger';
import { XP } from './core/experience/XP_ENGINE';

// ✅ v8.0 DESIGN SYSTEM - Tailwind CSS + TITANE∞ Tokens
import './index.css'; // 🎨 v8.0: Tailwind CSS + Design Tokens (css-vars.css)

// ✨ v30.0.0 RESPONSIVE DESIGN SYSTEM - Mobile-First Tokens & Utilities
import './design-system/responsive-tokens.css'; // 🎯 Fluid spacing, typography, layout
import './design-system/responsive-utilities.css'; // 🛠️ Utility classes (grid-responsive, btn-touch, etc.)

import './styles/experience.css'; // ✨ v∞.D - XP System Styles (unique)
import './styles/exp-fusion.css'; // 🎯 XP Advanced Features (unique)
import './pages/styles.css'; // 📄 Pages styles (minimal)

// ── Boot modules (extracted from monolithic main.tsx) ──────────────────────
import { registerFatalErrorHandlers } from './boot/errorRecovery';
import { startBootBeacon, showDebugOverlay, getUILogsSnapshot } from './boot/beaconUI';
import {
  emitBootMarker,
  setBootStage,
  isTauriRuntime,
  openDevtoolsSafe,
  cleanupServiceWorkersForTauri,
  scheduleBootWatchdog,
  initializeRuntimeConfig,
  getSingularityPollingIntervalMs,
  createDevtoolsShortcutHandler,
} from './boot/bootSequence';
import { mountReactRoot } from './boot/providers';

// 🛡️ Type augmentation for Sentry and Monitoring on window
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: unknown, options?: Record<string, unknown>) => void;
    };
    __TITANE_MONITORING__?: unknown;
    __TITANE_BOOT_READY__?: boolean;
    __TITANE_BOOT_FALLBACK__?: boolean;
    __TITANE_EMIT_BOOT_MARKER__?: (marker: string) => void;
  }
}

// ⭐ PHASE 2: BOOT DIAGNOSTIC MARKER
logger.info('[BOOT] main.tsx start');
(window as any).__TITANE_BOOT__ = (window as any).__TITANE_BOOT__ || {};
(window as any).__TITANE_BOOT__.main_tsx = true;
(window as any).__TITANE_BOOT__.main_tsx_timestamp = Date.now();
if (typeof document !== 'undefined') {
  document.documentElement.dataset.titane = 'main_tsx';
}

setErrorToastDispatcher(payload => {
  useUIStore.getState().addToast(payload);
});

if (typeof window !== 'undefined') {
  window.__TITANE_EMIT_BOOT_MARKER__ = emitBootMarker;
  emitBootMarker('BOOT:START');
  emitBootMarker('BOOT:AFTER_STORE');
}

if (typeof window !== 'undefined') {
  setBootStage('main.tsx: boot handlers registered');
  startBootBeacon();

  registerFatalErrorHandlers();

  window.addEventListener('keydown', ev => {
    // Diagnostic overlay: Ctrl+Alt+D
    if (ev.ctrlKey && ev.altKey && (ev.key === 'd' || ev.key === 'D')) {
      ev.preventDefault();

      const w = window as typeof window & {
        __TAURI__?: unknown;
        __TAURI_INTERNALS__?: unknown;
        __TITANE_BOOT__?: { stage: string; timestamp: number };
      };

      const diagnostics = {
        now: new Date().toISOString(),
        boot: w.__TITANE_BOOT__ ?? null,
        location: typeof location !== 'undefined' ? String(location.href) : 'n/a',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a',
        isTauri: Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__),
        root: {
          exists: Boolean(document.getElementById('root')),
          childCount: document.getElementById('root')?.childElementCount ?? null,
        },
        uiLogs: getUILogsSnapshot(),
      };

      showDebugOverlay('UI Debug Snapshot', diagnostics);
    }
  });
}

// ✨ v∞.D: Initialize XP Engine
XP.load();
logger.info(`[XP] Système chargé:`, { level: XP.state.level, xp: XP.state.total });

// Set default theme
document.documentElement.setAttribute('data-theme', 'dark');

void initializeRuntimeConfig();

cleanupServiceWorkersForTauri();

scheduleBootWatchdog();

const handleDevtoolsShortcut = createDevtoolsShortcutHandler({
  isTauriRuntime,
  openDevtools: openDevtoolsSafe,
  fallbackAction: () => {
    if (typeof window === 'undefined') {
      return;
    }

    logger.warn('Native DevTools unavailable - routing to internal DevTools page', {
      component: 'DevTools',
      route: '/devtools?source=f12',
    });

    window.history.pushState({}, '', '/devtools?source=f12');
    window.dispatchEvent(new PopStateEvent('popstate'));
  },
  onError: (err: unknown) => {
    logger.error(
      'Failed to open DevTools',
      { component: 'DevTools' },
      err instanceof Error ? err : new Error(String(err))
    );
  },
});

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I / Cmd+Alt+I)
if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    ev => {
      void handleDevtoolsShortcut(ev);
    },
    { capture: true }
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 BOOT SEQUENCE START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
logger.info('\n╔════════════════════════════════════════════════════════════════╗');
logger.info('║  🌌 TITANE∞ v30.0.0 - BOOT SEQUENCE                             ║');
logger.info('║  Timestamp: ' + new Date().toISOString() + '                  ║');
logger.info('╚════════════════════════════════════════════════════════════════╝\n');

// ✨ v30.0.0 Phase 5 - Monitoring Infrastructure (Priority 1)
logger.info('[1/7] 🔍 Monitoring: Initializing (Web Vitals, Errors, Performance)...');
if (import.meta.env.PROD) {
  // Load monitoring in background after First Contentful Paint
  setTimeout(() => {
    logger.info('      ⚡ Loading monitoring infrastructure...');
    import('./monitoring')
      .then(({ initMonitoring, monitoring }) => {
        initMonitoring();
        // Expose to DevTools console
        if (typeof window !== 'undefined') {
          window.__TITANE_MONITORING__ = monitoring;
        }
        logger.info(
          '      ✅ Monitoring: Ready (access via window.__TITANE_MONITORING__)'
        );
      })
      .catch(err => {
        logger.warn('      ⚠️ Monitoring initialization failed:');
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
      logger.info('      ✅ Monitoring: Ready (dev mode - immediate)');
      logger.info('      💡 Access metrics: window.__TITANE_MONITORING__.getMetrics()');
    })
    .catch(err => {
      logger.warn('      ⚠️ Monitoring initialization failed (dev):', err);
    });
}

// Initialize UILogger (overrides console.* in production)
logInfo('🔒 UILogger initialized', {
  mode: import.meta.env.PROD ? 'production' : 'development',
  consoleOverride: import.meta.env.PROD,
  maxLogsPerMinute: 100,
  maxStoredLogs: 1000,
});

logger.info('[2/7] 🔒 UILogger: Activated (console override in production)');
logger.info('[3/7] 🦀 Backend: 40+ Rust modules | 33 Tauri Commands');
logger.info('[4/7] ✨ Frontend: 20 Unified Engines | SingularityState Active');
logger.info('[5/7] 🔒 Tauri v2.0 100% | Rust + React + TypeScript');
logger.info('[6/7] 📦 Loading React 18 + TypeScript 5...');
logger.info('[7/7] 🎯 Mounting root component...');

// 🌟 v15: Initialize SingularityBridge
SingularityBridge.initialize()
  .then(() => {
    logger.info('✅ SingularityBridge initialized (Rust ↔ React sync active)');

    void SingularityBridge.getGlobalCoherence().then(coherence => {
      logger.info(`🔗 Backend Coherence: ${(coherence * 100).toFixed(1)}%`);
    });

    void SingularityBridge.isCritical().then(critical => {
      if (critical) {
        logger.warn('⚠️  System in CRITICAL state!');
      } else {
        logger.info('✅ System health: Normal');
      }
    });

    const singularityIntervalMs = getSingularityPollingIntervalMs();
    SingularityConnections.start(singularityIntervalMs)
      .then(() => {
        if (singularityIntervalMs > 0) {
          logger.info(
            `🔗 SingularityConnections started (${singularityIntervalMs}ms polling)`
          );
        } else {
          logger.info('🔗 SingularityConnections started (event-driven; no polling)');
        }
        logger.info('   → Helios → PhysicalLayer');
        logger.info('   → Memory → CognitiveLayer');
        logger.info('   → Persona → SymbolicLayer');
        logger.info('   → AutoHeal → AdaptiveLayer');
        logger.info('   → UI Router → MetaLayer');
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

// Phase 8: Inject accessibility styles
injectSROnlyStyles();
logger.info('♿ Accessibility styles injected (WCAG 2.1 AA)');

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

logger.info('✅ TITANE∞ frontend loaded successfully');
logger.info('>>> MOUNTING REACT ROOT NOW...\n');

mountReactRoot();
