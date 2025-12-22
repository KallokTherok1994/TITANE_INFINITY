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
    __TITANE_MONITORING__?: unknown;
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

type FatalErrorOverlayPayload = {
  title: string;
  message: string;
  stack?: string;
  source?: string;
};

type TitaneBootDiagnostics = {
  stage: string;
  timestamp: number;
};

type MemoryCoreLogLevel = 'Info' | 'Warning' | 'Error';

let lastBootStageLoggedToMemoryCore: string | null = null;

const tryWriteMemoryCoreLog = (
  level: MemoryCoreLogLevel,
  module: string,
  message: string
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const w = window as Window & {
      __TAURI__?: unknown;
      __TAURI_INTERNALS__?: unknown;
    };
    const isTauri = Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
    if (!isTauri) {
      return;
    }

    const now = Date.now();
    const id = `ui-${now}-${Math.random().toString(36).slice(2, 10)}`;

    void safeInvokeTauri<void>(
      TAURI_COMMANDS.MEMORY_WRITE_LOG,
      {
        log: {
          id,
          timestamp: now,
          level,
          module,
          message,
        },
      },
      2000
    ).catch(() => {
      // Do not break UI boot if logging fails
    });
  } catch {
    // Do not break UI boot if logging fails
  }
};

const setBootStage = (stage: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const w = window as typeof window & { __TITANE_BOOT__?: TitaneBootDiagnostics };
  w.__TITANE_BOOT__ = { stage, timestamp: Date.now() };

  if (stage !== lastBootStageLoggedToMemoryCore) {
    lastBootStageLoggedToMemoryCore = stage;
    tryWriteMemoryCoreLog('Info', 'frontend.boot', stage);
  }
};

const getUILogsSnapshot = (): unknown => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem('titane_ui_logs');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return parsed;
    }
    return parsed.slice(-200);
  } catch (error) {
    return { error: 'Failed to read titane_ui_logs', details: String(error) };
  }
};

const showDebugOverlay = (title: string, payload: unknown): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const existing = document.getElementById('titane-debug-overlay');
  if (existing) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'titane-debug-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  let body: string;
  try {
    body = JSON.stringify(payload, null, 2);
  } catch {
    body = String(payload);
  }

  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    ">
      <div style="
        width: min(1100px, 100%);
        max-height: 85vh;
        overflow: auto;
        background: #0a0a0a;
        color: #e5e7eb;
        border: 2px solid #3b3b3b;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.55);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 0.9rem; color: #9ca3af;">TITANE∞ Diagnostic</div>
            <div style="font-size: 1.1rem; font-weight: 700;">${escapeHtmlForError(title)}</div>
          </div>
          <button id="titane-debug-overlay-close" style="
            padding: 8px 12px;
            background: #1f1f1f;
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          ">Fermer</button>
        </div>
        <div style="padding: 16px;">
          <div style="color:#9ca3af;margin-bottom:12px;">Raccourci: Ctrl+Alt+D (ré-ouvre si fermé)</div>
          <pre style="white-space: pre-wrap; word-break: break-word; margin:0; padding: 12px; background:#000; border-radius: 10px; border:1px solid rgba(255,255,255,0.08);">${escapeHtmlForError(body)}</pre>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('titane-debug-overlay-close')?.addEventListener('click', () => {
    overlay.remove();
  });
};

const startBootBeacon = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Avoid duplicates across reloads
  if (document.getElementById('titane-boot-beacon')) {
    return;
  }

  const beacon = document.createElement('div');
  beacon.id = 'titane-boot-beacon';
  beacon.style.position = 'fixed';
  beacon.style.right = '12px';
  beacon.style.bottom = '12px';
  beacon.style.zIndex = '2147483647';
  beacon.style.maxWidth = '420px';
  beacon.style.background = 'rgba(0,0,0,0.85)';
  beacon.style.color = '#e5e7eb';
  beacon.style.border = '1px solid rgba(255,255,255,0.15)';
  beacon.style.borderRadius = '10px';
  beacon.style.padding = '10px 12px';
  beacon.style.fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
  beacon.style.fontSize = '12px';
  beacon.style.lineHeight = '1.35';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Fermer diagnostic');
  closeBtn.style.float = 'right';
  closeBtn.style.marginLeft = '8px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.color = '#9ca3af';
  closeBtn.style.border = 'none';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.onclick = () => beacon.remove();

  const content = document.createElement('div');
  beacon.appendChild(closeBtn);
  beacon.appendChild(content);
  document.body.appendChild(beacon);

  const render = (): void => {
    const w = window as typeof window & {
      __TAURI__?: unknown;
      __TAURI_INTERNALS__?: unknown;
      __TITANE_BOOT__?: TitaneBootDiagnostics;
    };

    const root = document.getElementById('root');
    const childCount = root?.childElementCount ?? 0;

    const stage = w.__TITANE_BOOT__?.stage ?? 'n/a';
    const isTauri = Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
    const href = typeof location !== 'undefined' ? String(location.href) : 'n/a';

    content.innerHTML = `${escapeHtmlForError('BOOT BEACON')}<br/>
<span style="color:#9ca3af;">stage</span>: ${escapeHtmlForError(stage)}<br/>
<span style="color:#9ca3af;">isTauri</span>: ${isTauri ? 'true' : 'false'}<br/>
<span style="color:#9ca3af;">rootChildren</span>: ${childCount}<br/>
<span style="color:#9ca3af;">href</span>: ${escapeHtmlForError(href)}<br/>
<span style="color:#9ca3af;">keys</span>: F12/Ctrl+Shift+I, Ctrl+Alt+D`;
  };

  render();
  window.setInterval(render, 1000);
};

const showFatalErrorOverlay = (payload: FatalErrorOverlayPayload): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const docAny = document as Document & { __titaneFatalOverlayShown?: boolean };
  if (docAny.__titaneFatalOverlayShown) {
    return;
  }
  docAny.__titaneFatalOverlayShown = true;

  const safeTitle = escapeHtmlForError(payload.title);
  const safeMessage = escapeHtmlForError(payload.message);
  const safeStack = escapeHtmlForError(payload.stack ?? '');
  const safeSource = escapeHtmlForError(payload.source ?? '');

  const stackBlock = safeStack
    ? `<details style="margin-top: 1rem;"><summary style="cursor:pointer;color:#8899aa;">Détails techniques</summary><pre style="margin-top:0.75rem;white-space:pre-wrap;background:#000;padding:1rem;border-radius:8px;max-height:45vh;overflow:auto;">${safeStack}</pre></details>`
    : '';

  const sourceLine = safeSource
    ? `<div style="margin-top:0.75rem;color:#9ca3af;font-size:0.85rem;">Source: ${safeSource}</div>`
    : '';

  const hint =
    'Astuce: appuie sur F12 (ou Ctrl+Shift+I) pour ouvrir les DevTools si disponibles.';

  document.body.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:100vh;
      background:#0a0a0a;
      color:#ff4444;
      font-family:monospace;
      padding:2rem;
      text-align:left;
    ">
      <div style="max-width: 980px; width: 100%;">
        <h1 style="font-size:1.6rem;margin:0 0 0.75rem 0;">⚠️ ${safeTitle}</h1>
        <div style="color:#9ca3af;margin-bottom:1rem;">${safeMessage}</div>
        ${sourceLine}
        <div style="margin-top:1rem;color:#9ca3af;font-size:0.9rem;">${escapeHtmlForError(hint)}</div>
        ${stackBlock}
      </div>
    </div>
  `;

  tryWriteMemoryCoreLog(
    'Error',
    'frontend.fatal',
    `${payload.title}: ${payload.message}${payload.source ? ` (${payload.source})` : ''}`
  );
};

if (typeof window !== 'undefined') {
  setBootStage('main.tsx: boot handlers registered');
  startBootBeacon();

  window.addEventListener('error', ev => {
    try {
      const err = ev.error instanceof Error ? ev.error : undefined;
      const message = err?.message || ev.message || 'Erreur JavaScript non gérée';
      const stack = err?.stack;
      showFatalErrorOverlay({
        title: 'Erreur UI (non capturée)',
        message,
        stack,
        source: ev.filename
          ? `${ev.filename}:${ev.lineno ?? 0}:${ev.colno ?? 0}`
          : undefined,
      });
    } catch {
      // Ne jamais casser le boot sur un handler d'erreur
    }
  });

  window.addEventListener('unhandledrejection', ev => {
    try {
      const reason = ev.reason;
      const err = reason instanceof Error ? reason : undefined;
      const message =
        err?.message ||
        (typeof reason === 'string' ? reason : 'Promise rejection non gérée');
      const stack = err?.stack;
      showFatalErrorOverlay({
        title: 'Erreur UI (Promise non gérée)',
        message,
        stack,
      });
    } catch {
      // Ne jamais casser le boot sur un handler d'erreur
    }
  });

  window.addEventListener('keydown', ev => {
    // Diagnostic overlay: Ctrl+Alt+D
    if (ev.ctrlKey && ev.altKey && (ev.key === 'd' || ev.key === 'D')) {
      ev.preventDefault();

      const w = window as typeof window & {
        __TAURI__?: unknown;
        __TAURI_INTERNALS__?: unknown;
        __TITANE_BOOT__?: TitaneBootDiagnostics;
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

const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const candidate = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };

  return Boolean(candidate.__TAURI__ || candidate.__TAURI_INTERNALS__);
};

const openDevtoolsSafe = async (): Promise<void> => {
  // Preferred path for Tauri v2
  try {
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
    const win = getCurrentWebviewWindow();
    // @ts-expect-error: openDevtools exists in Tauri v2 but not typed yet
    await win.openDevtools();
    return;
  } catch {
    // Fallback to legacy/global bridge if available
  }

  const legacyWindowAPI = getTauriWindowAPI();
  if (!legacyWindowAPI) {
    throw new Error('Tauri window API unavailable');
  }
  await legacyWindowAPI.getCurrent().openDevtools();
};

const cleanupServiceWorkersForTauri = (): void => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  if (!isTauriRuntime()) {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Best-effort cleanup (do not block boot)
  void navigator.serviceWorker
    .getRegistrations()
    .then(async registrations => {
      await Promise.all(registrations.map(r => r.unregister()));
    })
    .catch(() => {
      // ignore
    });

  if (typeof caches !== 'undefined') {
    void caches
      .keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .catch(() => {
        // ignore
      });
  }
};

cleanupServiceWorkersForTauri();

const scheduleBootWatchdog = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!isTauriRuntime()) {
    return;
  }

  window.setTimeout(() => {
    try {
      const root = document.getElementById('root');
      const childCount = root?.childElementCount ?? 0;

      if (childCount > 0) {
        return;
      }

      const w = window as typeof window & {
        __TITANE_BOOT__?: { stage: string; timestamp: number };
      };

      showDebugOverlay('Boot Watchdog (React non monté)', {
        now: new Date().toISOString(),
        boot: w.__TITANE_BOOT__ ?? null,
        isTauri: true,
        location: typeof location !== 'undefined' ? String(location.href) : 'n/a',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a',
        root: {
          exists: Boolean(root),
          childCount,
        },
        uiLogs: getUILogsSnapshot(),
        hint: 'Essaie F12 / Ctrl+Shift+I. Sinon Ctrl+Alt+D pour snapshot.',
      });
    } catch {
      // never break boot
    }
  }, 4500);
};

scheduleBootWatchdog();

// 🔧 DevTools keyboard shortcuts (F12 + Ctrl+Shift+I)
if (typeof window !== 'undefined') {
  if (isTauriRuntime()) {
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'F12' || (ev.ctrlKey && ev.shiftKey && ev.key === 'I')) {
        ev.preventDefault();
        void openDevtoolsSafe().catch((err: unknown) => {
          logger.error(
            'Failed to open DevTools',
            { component: 'DevTools' },
            err instanceof Error ? err : new Error(String(err))
          );
        });
      }
    });
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
  // In Tauri, service workers can create persistent caching issues across builds.
  if (!isTauriRuntime() && 'serviceWorker' in navigator && import.meta.env.PROD) {
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
