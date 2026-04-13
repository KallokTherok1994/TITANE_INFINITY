/**
 * TITANE_INFINITY — Boot: Boot Sequence
 * Extracted from src/main.tsx (pure refactor, no behavior change).
 *
 * Exports: BOOT_RECOVERY_ONCE_KEY, SUSPENSE_RECOVERY_ONCE_KEY, emitBootMarker,
 *          setBootStage, isTauriRuntime, openDevtoolsSafe,
 *          cleanupServiceWorkersForTauri, scheduleBootWatchdog,
 *          DEFAULT_RUNTIME_CONFIG, setRuntimeConfig, initializeRuntimeConfig,
 *          getSingularityPollingIntervalMs
 */

import { isTauriAvailable } from '@/api/tauriClient';
import { createDevtoolsShortcutHandler } from '@/utils/devtoolsShortcuts';
import { logger } from '../lib/logger';
import { safeInvokeTauri } from '../utils/tauriProtector';
import { TAURI_COMMANDS } from '../core/commands/TAURI_COMMANDS';
import {
  TitaneBootDiagnostics,
  tryWriteMemoryCoreLog,
  showFatalErrorOverlay,
} from './errorRecovery';
import { showDebugOverlay, getUILogsSnapshot } from './beaconUI';

export { createDevtoolsShortcutHandler };

export const BOOT_RECOVERY_ONCE_KEY = 'titane_boot_recovery_once';
export const SUSPENSE_RECOVERY_ONCE_KEY = 'titane_suspense_recovery_once';

let lastBootStageLoggedToMemoryCore: string | null = null;
export const seenBootMarkers = new Set<string>();

export const setBootStage = (stage: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const w = window as typeof window & { __TITANE_BOOT__?: TitaneBootDiagnostics };
  w.__TITANE_BOOT__ = { stage, timestamp: Date.now() };

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.titaneBootStage = stage;
  }

  if (stage !== lastBootStageLoggedToMemoryCore) {
    lastBootStageLoggedToMemoryCore = stage;
    tryWriteMemoryCoreLog('Info', 'frontend.boot', stage);
  }
};

export const emitBootMarker = (marker: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (seenBootMarkers.has(marker)) {
    return;
  }

  seenBootMarkers.add(marker);
  setBootStage(marker);
  logger.info(`[${new Date().toISOString()}] ${marker}`);

  void import('@tauri-apps/api/event')
    .then(({ emit }) =>
      emit('titane://boot-marker', {
        marker,
        ts: Date.now(),
      })
    )
    .catch(() => {
      // Do not break UI boot if event bus is unavailable
    });

  void safeInvokeTauri<void>(TAURI_COMMANDS.BOOT_MARKER_LOG, { marker }, 1500).catch(
    () => {
      // Do not break UI boot if marker IPC fails
    }
  );

  if (marker === 'BOOT:READY') {
    window.__TITANE_BOOT_READY__ = true;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.titaneBootReady = '1';
    }
    try {
      window.localStorage.removeItem(BOOT_RECOVERY_ONCE_KEY);
      window.localStorage.removeItem(SUSPENSE_RECOVERY_ONCE_KEY);
    } catch {
      // ignore
    }
  }
};

type RuntimeConfigPayload = {
  ollamaUrl: string;
  ollamaModel: string;
  secretsMode: string;
  geminiConfigured: boolean;
  timestamp: number;
};

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfigPayload = Object.freeze({
  ollamaUrl: '/api/ollama',
  ollamaModel: 'gemma2:2b',
  secretsMode: 'ephemeral',
  geminiConfigured: false,
  timestamp: Date.now(),
});

export function setRuntimeConfig(config: Partial<RuntimeConfigPayload>): void {
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

export async function initializeRuntimeConfig(): Promise<void> {
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
    // Mode navigateur - utiliser la config par défaut (normal, pas une erreur)
    logger.info(
      '[RuntimeConfig] Mode navigateur détecté - utilisation config par défaut'
    );
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
      logger.info('[RuntimeConfig] Loaded (sanitized)', {
        secretsMode: runtimeConfig.secretsMode,
        geminiConfigured: runtimeConfig.geminiConfigured,
        ollamaEndpoint: runtimeConfig.ollamaUrl,
      });
    } else {
      logger.warn(
        '[RuntimeConfig] Backend returned unexpected payload; keeping defaults'
      );
    }
  } catch (error) {
    logger.warn('[RuntimeConfig] Failed to load from backend; using defaults');
  }
}

const getTauriWindowAPI = ():
  | {
      getCurrent?: () => {
        openDevtools?: () => Promise<void>;
        toggleDevtools?: () => Promise<void>;
      };
    }
  | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return (
    window as typeof window & {
      __TAURI__?: {
        window?: {
          getCurrent: () => {
            openDevtools?: () => Promise<void>;
            toggleDevtools?: () => Promise<void>;
          };
        };
      };
    }
  ).__TAURI__?.window;
};

export const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const candidate = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
    isTauri?: boolean;
  };

  return Boolean(
    isTauriAvailable() ||
    candidate.__TAURI__ ||
    candidate.__TAURI_INTERNALS__ ||
    candidate.isTauri
  );
};

export const openDevtoolsSafe = async (): Promise<void> => {
  let lastError: unknown = null;

  try {
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
    const win = getCurrentWebviewWindow() as {
      openDevtools?: () => Promise<void>;
      toggleDevtools?: () => Promise<void>;
    };

    if (typeof win.openDevtools === 'function') {
      await win.openDevtools();
      return;
    }

    if (typeof win.toggleDevtools === 'function') {
      await win.toggleDevtools();
      return;
    }
  } catch (error) {
    lastError = error;
  }

  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow() as {
      openDevtools?: () => Promise<void>;
      toggleDevtools?: () => Promise<void>;
    };

    if (typeof appWindow.openDevtools === 'function') {
      await appWindow.openDevtools();
      return;
    }

    if (typeof appWindow.toggleDevtools === 'function') {
      await appWindow.toggleDevtools();
      return;
    }
  } catch (error) {
    lastError = error;
  }

  const legacyWindowAPI = getTauriWindowAPI();
  const legacyCurrent = legacyWindowAPI?.getCurrent?.() as
    | {
        openDevtools?: () => Promise<void>;
        toggleDevtools?: () => Promise<void>;
      }
    | undefined;

  if (legacyCurrent && typeof legacyCurrent.openDevtools === 'function') {
    await legacyCurrent.openDevtools();
    return;
  }

  if (legacyCurrent && typeof legacyCurrent.toggleDevtools === 'function') {
    await legacyCurrent.toggleDevtools();
    return;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Tauri window API unavailable');
};

export const cleanupServiceWorkersForTauri = (): void => {
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

export const scheduleBootWatchdog = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (!isTauriRuntime()) {
    return;
  }

  window.setTimeout(() => {
    try {
      const bootReady = Boolean(window.__TITANE_BOOT_READY__);

      const loadingSplashVisible = Boolean(document.querySelector('.loading-splash'));
      const pageFallbackVisible = Boolean(
        document.querySelector('.page-loading-fallback')
      );
      const loadingStuck = loadingSplashVisible || pageFallbackVisible;

      if (bootReady && !loadingStuck) {
        return;
      }

      let recoveryAlreadyAttempted = false;
      try {
        recoveryAlreadyAttempted =
          window.localStorage.getItem(BOOT_RECOVERY_ONCE_KEY) === '1';
      } catch {
        recoveryAlreadyAttempted = false;
      }

      if (loadingStuck && !recoveryAlreadyAttempted) {
        try {
          window.localStorage.setItem(BOOT_RECOVERY_ONCE_KEY, '1');
        } catch {
          // ignore
        }

        if ('serviceWorker' in navigator) {
          void navigator.serviceWorker
            .getRegistrations()
            .then(registrations => Promise.all(registrations.map(r => r.unregister())))
            .catch(() => {
              // ignore
            });
        }

        if (typeof caches !== 'undefined') {
          void caches
            .keys()
            .then(keys => Promise.all(keys.map(key => caches.delete(key))))
            .catch(() => {
              // ignore
            });
        }

        window.setTimeout(() => {
          window.location.reload();
        }, 600);
        return;
      }

      if (!window.__TITANE_BOOT_FALLBACK__) {
        window.__TITANE_BOOT_FALLBACK__ = true;
        showFatalErrorOverlay({
          title: 'BOOT timeout (>20s)',
          message:
            "Initialisation incomplète. L'application passe en fallback non bloquant. Vérifie les logs BOOT/IPC puis relance.",
          source: 'BOOT_WATCHDOG_20S',
        });

        const reloadBtn = document.createElement('button');
        reloadBtn.id = 'titane-boot-reload-btn';
        reloadBtn.textContent = '🔄 Relancer';
        reloadBtn.style.position = 'fixed';
        reloadBtn.style.right = '20px';
        reloadBtn.style.bottom = '20px';
        reloadBtn.style.zIndex = '2147483647';
        reloadBtn.style.padding = '10px 14px';
        reloadBtn.style.borderRadius = '10px';
        reloadBtn.style.border = '1px solid rgba(255,255,255,0.2)';
        reloadBtn.style.background = '#1f2937';
        reloadBtn.style.color = '#f3f4f6';
        reloadBtn.style.cursor = 'pointer';
        reloadBtn.addEventListener('click', () => {
          window.location.reload();
        });
        document.body.appendChild(reloadBtn);
      }

      const root = document.getElementById('root');
      const childCount = root?.childElementCount ?? 0;

      if (loadingStuck) {
        const w = window as typeof window & {
          __TITANE_BOOT__?: { stage: string; timestamp: number };
        };

        showDebugOverlay('Boot Watchdog (loading persistant)', {
          now: new Date().toISOString(),
          boot: w.__TITANE_BOOT__ ?? null,
          bootReady,
          isTauri: true,
          location: typeof location !== 'undefined' ? String(location.href) : 'n/a',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a',
          loading: {
            loadingSplashVisible,
            pageFallbackVisible,
            recoveryAlreadyAttempted,
          },
          root: {
            exists: Boolean(root),
            childCount,
          },
          uiLogs: getUILogsSnapshot(),
          hint: 'Un auto-reload a été tenté une fois; vérifier erreurs JS et chunks.',
        });
        return;
      }

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
  }, 20000);
};

export const getSingularityPollingIntervalMs = (): number => {
  const defaultIntervalMs = import.meta.env.DEV ? 5000 : 0;

  if (typeof window === 'undefined') {
    return defaultIntervalMs;
  }

  const envEnabled =
    String(import.meta.env.VITE_SINGULARITY_POLLING_ENABLED ?? '') === '1';
  const storedEnabled = window.localStorage.getItem('titane_singularity_polling_enabled');
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

  if (!enabled) {
    return 0;
  }

  if (!Number.isFinite(candidate) || candidate <= 0) {
    return 5000;
  }

  return Math.max(1000, Math.floor(candidate));
};
