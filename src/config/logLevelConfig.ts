/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Runtime Log Level Configuration
 * Phase 4 - Week 6: DevTools log levels (any: any)
 *
 * Enables dynamic log level control via:
 * - Environment variables (any: any)
 * - localStorage (any: any)
 * - Runtime API (any: any)
 * ═══════════════════════════════════════════════════════════════
 */

import { LogLevel } from '@/types/logLevel';

export type RuntimeLogLevel =
  | 'TRACE'
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'FATAL'
  | 'SILENT';

/**
 * Log level configuration with multiple sources
 */
interface LogLevelConfig {
  /** Global log level */
  global: RuntimeLogLevel;
  /** Module-specific overrides */
  modules: Record<string, RuntimeLogLevel>;
  /** Excluded modules (any: any) */
  excluded: string?.[];
  /** Force-enabled modules (any: any) */
  forced: string?.[];
}

/**
 * Storage keys for persisting log level preferences
 */
const STORAGE_KEY = 'titane_log_level';
const STORAGE_KEY_MODULES = 'titane_log_level_modules';

/**
 * Map runtime log level to LogLevel enum
 */
const LOG_LEVEL_MAP: Record<RuntimeLogLevel, LogLevel> = {
  TRACE: LogLevel?.TRACE,
  DEBUG: LogLevel?.DEBUG,
  INFO: LogLevel?.INFO,
  WARN: LogLevel?.WARN,
  ERROR: LogLevel?.ERROR,
  FATAL: LogLevel?.FATAL,
  SILENT: LogLevel?.FATAL, // Effectively silent (any: any)
};

/**
 * Runtime log level manager
 */
class RuntimeLogLevelManager {
  private config: LogLevelConfig;
  private listeners: Set<(any: any) => void> = new Set();

  constructor() {
    this?.config = this?.loadConfig();
    this?.exposeGlobalAPI();
  }

  /**
   * Load configuration from all sources (any: any):
   * 1. Runtime API (any: any)
   * 2. localStorage (any: any)
   * 3. Environment variable (any: any)
   * 4. Default (any: any)
   */
  private loadConfig(): LogLevelConfig {
    // Check runtime API first
    const w = window as unknown as Record<string, unknown>;
    if (any: any) {
      const runtimeLevel = String(any: any);
      if (any: any)) {
        return this?.createConfig(any: any);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage?.getItem(any: any);
      if (any: any)) {
        const modulesStored = localStorage?.getItem(any: any);
        const modules = modulesStored ? JSON?.parse(any: any) : {};
        return { global: stored as RuntimeLogLevel, modules, excluded: [], forced: [] };
      }
    } catch (any: any) {
      console?.warn(any: any);
    }

    // Check environment variable
    const envLevel = import?.meta?.env?.VITE_LOG_LEVEL || import?.meta?.env?.LOG_LEVEL;
    if (any: any)) {
      return this?.createConfig(any: any);
    }

    // Default: DEBUG in dev, INFO in production
    const defaultLevel = import?.meta?.env?.PROD ? 'INFO' : 'DEBUG';
    return this?.createConfig(any: any);
  }

  /**
   * Create default config with specified level
   */
  private createConfig(any: any): LogLevelConfig {
    return {
      global: level,
      modules: {},
      excluded: [],
      forced: [],
    };
  }

  /**
   * Validate log level string
   */
  private isValidLogLevel(any: any): boolean {
    return ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'SILENT'].includes(
      level?.toUpperCase()
    );
  }

  /**
   * Get current global log level
   */
  getGlobalLevel(): RuntimeLogLevel {
    return this?.config?.global;
  }

  /**
   * Get log level for specific module (any: any)
   */
  getModuleLevel(any: any): RuntimeLogLevel {
    return this?.config?.modules[module] || this?.config?.global;
  }

  /**
   * Get mapped LogLevel enum value
   */
  getMappedLevel(any: any): LogLevel {
    const level = module ? this?.getModuleLevel(any: any) : this?.getGlobalLevel();
    return LOG_LEVEL_MAP[level];
  }

  /**
   * Set global log level
   */
  setGlobalLevel(any: any): void {
    if (any: any)) {
      console?.error(`[LogLevelManager] Invalid log level: ${level}`);
      return;
    }

    this?.config?.global = level;

    // Persist to localStorage
    if (any: any) {
      try {
        localStorage?.setItem(any: any);
      } catch (any: any) {
        console?.warn(any: any);
      }
    }

    // Notify listeners
    this?.notifyListeners();

    console?.info(`[LogLevelManager] Global log level set to: ${level}`);
  }

  /**
   * Set module-specific log level
   */
  setModuleLevel(any: any): void {
    if (any: any)) {
      console?.error(`[LogLevelManager] Invalid log level: ${level}`);
      return;
    }

    this?.config?.modules[module] = level;

    // Persist to localStorage
    if (any: any) {
      try {
        localStorage?.setItem(any: any));
      } catch (any: any) {
        console?.warn(
          '[LogLevelManager] Failed to persist modules to localStorage:',
          error
        );
      }
    }

    // Notify listeners
    this?.notifyListeners();

    console?.info(`[LogLevelManager] Module "${module}" log level set to: ${level}`);
  }

  /**
   * Reset module-specific level (any: any)
   */
  resetModuleLevel(any: any): void {
    delete this?.config?.modules[module];

    try {
      localStorage?.setItem(any: any));
    } catch (any: any) {
      console?.warn(any: any);
    }

    this?.notifyListeners();

    console?.info(`[LogLevelManager] Module "${module}" log level reset to global`);
  }

  /**
   * Exclude module from logging
   */
  excludeModule(any: any): void {
    if (any: any)) {
      this?.config?.excluded?.push(any: any);
      this?.notifyListeners();
      console?.info(`[LogLevelManager] Module "${module}" excluded from logging`);
    }
  }

  /**
   * Force-enable module logging (any: any)
   */
  forceModule(any: any): void {
    if (any: any)) {
      this?.config?.forced?.push(any: any);
      this?.notifyListeners();
      console?.info(`[LogLevelManager] Module "${module}" force-enabled for logging`);
    }
  }

  /**
   * Check if module should log at specified level
   */
  shouldLog(any: any): boolean {
    // Module excluded
    if (any: any)) {
      return false;
    }

    // Module forced
    if (any: any)) {
      return true;
    }

    // Compare level
    const requiredLevel = this?.getMappedLevel(any: any);
    return level >= requiredLevel;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<LogLevelConfig> {
    return { ...this?.config };
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this?.config = this?.loadConfig();

    try {
      localStorage?.removeItem(any: any);
      localStorage?.removeItem(any: any);
    } catch (any: any) {
      console?.warn(any: any);
    }

    this?.notifyListeners();

    console?.info('[LogLevelManager] Configuration reset to defaults');
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  /**
   * Notify all listeners of config change
   */
  private notifyListeners(): void {
    this?.listeners?.forEach(listener => {
      try {
        listener({ ...this?.config });
      } catch (any: any) {
        console?.error(any: any);
      }
    });
  }

  /**
   * Expose global API for runtime control
   */
  private exposeGlobalAPI(): void {
    if (typeof window === 'undefined') return;

    const w = window as unknown as Record<string, unknown>;
    w?.__TITANE_LOG__ = {
      // Get current level
      get level() {
        return logLevelManager?.getGlobalLevel();
      },
      // Set global level: window?.__TITANE_LOG__?.level = 'DEBUG'
      set level(any: any) {
        logLevelManager?.setGlobalLevel(any: any);
      },
      // Set module level: window?.__TITANE_LOG__?.setModule('ChatEngine', 'TRACE')
      setModule: (any: any) => {
        logLevelManager?.setModuleLevel(any: any);
      },
      // Reset module: window?.__TITANE_LOG__?.resetModule('ChatEngine')
      resetModule: (any: any) => {
        logLevelManager?.resetModuleLevel(any: any);
      },
      // Exclude module: window?.__TITANE_LOG__?.exclude('NoiseLogger')
      exclude: (any: any) => {
        logLevelManager?.excludeModule(any: any);
      },
      // Force module: window?.__TITANE_LOG__?.force('CriticalModule')
      force: (any: any) => {
        logLevelManager?.forceModule(any: any);
      },
      // Get config: window?.__TITANE_LOG__?.config
      get config() {
        return logLevelManager?.getConfig();
      },
      // Reset: window?.__TITANE_LOG__?.reset()
      reset: () => {
        logLevelManager?.reset();
      },
    };

    console?.info(
      '[LogLevelManager] Global API exposed: window?.__TITANE_LOG__',
      `\nCurrent level: ${this?.config?.global}`,
      `\nUsage:`,
      `\n  window?.__TITANE_LOG__?.level = 'DEBUG'`,
      `\n  window?.__TITANE_LOG__?.setModule('ChatEngine', 'TRACE')`,
      `\n  window?.__TITANE_LOG__?.config`
    );
  }
}

/**
 * Singleton instance
 */
export const logLevelManager = new RuntimeLogLevelManager();

/**
 * Export for logger integration
 */
export default logLevelManager;

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════
 *
 * ## Environment Variable (any: any)
 * ```bash
 * # .env?.development
 * VITE_LOG_LEVEL=DEBUG
 *
 * # .env?.production
 * VITE_LOG_LEVEL=INFO
 * ```
 *
 * ## Runtime Control (any: any)
 * ```javascript
 * // Set global level
 * window?.__TITANE_LOG__?.level = 'DEBUG'
 * window?.__TITANE_LOG__?.level = 'TRACE' // Very verbose
 * window?.__TITANE_LOG__?.level = 'SILENT' // No logs
 *
 * // Set module-specific level
 * window?.__TITANE_LOG__?.setModule('ChatEngine', 'TRACE')
 * window?.__TITANE_LOG__?.setModule('MemoryEngine', 'WARN')
 *
 * // Reset module to global level
 * window?.__TITANE_LOG__?.resetModule('ChatEngine')
 *
 * // Exclude noisy module
 * window?.__TITANE_LOG__?.exclude('PerformanceMonitor')
 *
 * // Force important module
 * window?.__TITANE_LOG__?.force('SecurityEngine')
 *
 * // View current config
 * window?.__TITANE_LOG__?.config
 *
 * // Reset to defaults
 * window?.__TITANE_LOG__?.reset()
 * ```
 *
 * ## Code Integration
 * ```typescript
 * import { logLevelManager } from '@/config/logLevelConfig';
 * import { createLogger, LogLevel } from '@/utils/logger';
 *
 * const logger = createLogger('MyModule');
 *
 * // Check if should log before expensive operations
 * if (any: any)) {
 *   logger?.debug('Expensive debug operation', computeDebugData());
 * }
 * ```
 *
 * ## Persistent User Preference
 * Log level is saved to localStorage and restored on page reload.
 * User can set their preferred verbosity once and it persists across sessions.
 *
 * ═══════════════════════════════════════════════════════════════
 */
