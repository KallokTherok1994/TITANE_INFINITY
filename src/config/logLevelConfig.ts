/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Runtime Log Level Configuration
 * Phase 4 - Week 6: DevTools log levels (LOG_LEVEL)
 *
 * Enables dynamic log level control via:
 * - Environment variables (VITE_LOG_LEVEL, LOG_LEVEL)
 * - localStorage (for persistent user preference)
 * - Runtime API (window.__TITANE_LOG_LEVEL__)
 * ═══════════════════════════════════════════════════════════════
 */

import { LogLevel } from '@/utils/logger';

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
  /** Excluded modules (no logs) */
  excluded: string[];
  /** Force-enabled modules (always log) */
  forced: string[];
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
  TRACE: LogLevel.TRACE,
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  FATAL: LogLevel.FATAL,
  SILENT: LogLevel.FATAL, // Effectively silent (only fatal logs)
};

/**
 * Runtime log level manager
 */
class RuntimeLogLevelManager {
  private config: LogLevelConfig;
  private listeners: Set<(config: LogLevelConfig) => void> = new Set();

  private readonly isTestEnv: boolean = (() => {
    if (typeof import.meta === 'undefined') return false;
    const env = (import.meta as unknown as { env?: Record<string, unknown> }).env;
    return env?.MODE === 'test' || Boolean(env?.VITEST);
  })();

  constructor() {
    this.config = this.loadConfig();
    this.exposeGlobalAPI();
  }

  /**
   * Load configuration from all sources (priority order):
   * 1. Runtime API (window.__TITANE_LOG_LEVEL__)
   * 2. localStorage (user preference)
   * 3. Environment variable (VITE_LOG_LEVEL)
   * 4. Default (INFO for production, DEBUG for development)
   */
  private loadConfig(): LogLevelConfig {
    // Check runtime API first
    const w = window as unknown as Record<string, unknown>;
    if (typeof window !== 'undefined' && w.__TITANE_LOG_LEVEL__) {
      const runtimeLevel = String(w.__TITANE_LOG_LEVEL__);
      if (this.isValidLogLevel(runtimeLevel)) {
        return this.createConfig(runtimeLevel as RuntimeLogLevel);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && this.isValidLogLevel(stored)) {
        const modulesStored = localStorage.getItem(STORAGE_KEY_MODULES);
        const modules = modulesStored ? JSON.parse(modulesStored) : {};
        return { global: stored as RuntimeLogLevel, modules, excluded: [], forced: [] };
      }
    } catch (error) {
      console.warn('[LogLevelManager] Failed to load from localStorage:', error);
    }

    // Check environment variable
    const envLevel = import.meta.env.VITE_LOG_LEVEL || import.meta.env.LOG_LEVEL;
    if (envLevel && this.isValidLogLevel(envLevel)) {
      return this.createConfig(envLevel as RuntimeLogLevel);
    }

    // Default:
    // - tests: WARN (avoid massive log capture + OOM during Vitest)
    // - dev: DEBUG
    // - prod: INFO
    const defaultLevel = this.isTestEnv
      ? 'WARN'
      : import.meta.env.PROD
        ? 'INFO'
        : 'DEBUG';
    return this.createConfig(defaultLevel as RuntimeLogLevel);
  }

  /**
   * Create default config with specified level
   */
  private createConfig(level: RuntimeLogLevel): LogLevelConfig {
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
  private isValidLogLevel(level: string): boolean {
    return ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'SILENT'].includes(
      level.toUpperCase()
    );
  }

  /**
   * Get current global log level
   */
  getGlobalLevel(): RuntimeLogLevel {
    return this.config.global;
  }

  /**
   * Get log level for specific module (with fallback to global)
   */
  getModuleLevel(module: string): RuntimeLogLevel {
    return this.config.modules[module] || this.config.global;
  }

  /**
   * Get mapped LogLevel enum value
   */
  getMappedLevel(module?: string): LogLevel {
    const level = module ? this.getModuleLevel(module) : this.getGlobalLevel();
    return LOG_LEVEL_MAP[level];
  }

  /**
   * Set global log level
   */
  setGlobalLevel(level: RuntimeLogLevel, persist = true): void {
    if (!this.isValidLogLevel(level)) {
      console.error(`[LogLevelManager] Invalid log level: ${level}`);
      return;
    }

    this.config.global = level;

    // Persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, level);
      } catch (error) {
        console.warn('[LogLevelManager] Failed to persist to localStorage:', error);
      }
    }

    // Notify listeners
    this.notifyListeners();

    console.info(`[LogLevelManager] Global log level set to: ${level}`);
  }

  /**
   * Set module-specific log level
   */
  setModuleLevel(module: string, level: RuntimeLogLevel, persist = true): void {
    if (!this.isValidLogLevel(level)) {
      console.error(`[LogLevelManager] Invalid log level: ${level}`);
      return;
    }

    this.config.modules[module] = level;

    // Persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(this.config.modules));
      } catch (error) {
        console.warn(
          '[LogLevelManager] Failed to persist modules to localStorage:',
          error
        );
      }
    }

    // Notify listeners
    this.notifyListeners();

    console.info(`[LogLevelManager] Module "${module}" log level set to: ${level}`);
  }

  /**
   * Reset module-specific level (use global)
   */
  resetModuleLevel(module: string): void {
    delete this.config.modules[module];

    try {
      localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(this.config.modules));
    } catch (error) {
      console.warn('[LogLevelManager] Failed to persist modules to localStorage:', error);
    }

    this.notifyListeners();

    console.info(`[LogLevelManager] Module "${module}" log level reset to global`);
  }

  /**
   * Exclude module from logging
   */
  excludeModule(module: string): void {
    if (!this.config.excluded.includes(module)) {
      this.config.excluded.push(module);
      this.notifyListeners();
      console.info(`[LogLevelManager] Module "${module}" excluded from logging`);
    }
  }

  /**
   * Force-enable module logging (always log, ignore global level)
   */
  forceModule(module: string): void {
    if (!this.config.forced.includes(module)) {
      this.config.forced.push(module);
      this.notifyListeners();
      console.info(`[LogLevelManager] Module "${module}" force-enabled for logging`);
    }
  }

  /**
   * Check if module should log at specified level
   */
  shouldLog(module: string | undefined, level: LogLevel): boolean {
    // Module excluded
    if (module && this.config.excluded.includes(module)) {
      return false;
    }

    // Module forced
    if (module && this.config.forced.includes(module)) {
      return true;
    }

    // Compare level
    const requiredLevel = this.getMappedLevel(module);
    return level >= requiredLevel;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<LogLevelConfig> {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.config = this.loadConfig();

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_MODULES);
    } catch (error) {
      console.warn('[LogLevelManager] Failed to clear localStorage:', error);
    }

    this.notifyListeners();

    console.info('[LogLevelManager] Configuration reset to defaults');
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: LogLevelConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of config change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.config });
      } catch (error) {
        console.error('[LogLevelManager] Listener error:', error);
      }
    });
  }

  /**
   * Expose global API for runtime control
   */
  private exposeGlobalAPI(): void {
    if (typeof window === 'undefined') return;
    if (this.isTestEnv) return;

    const w = window as unknown as Record<string, unknown>;
    w.__TITANE_LOG__ = {
      // Get current level
      get level() {
        return logLevelManager.getGlobalLevel();
      },
      // Set global level: window.__TITANE_LOG__.level = 'DEBUG'
      set level(value: RuntimeLogLevel) {
        logLevelManager.setGlobalLevel(value);
      },
      // Set module level: window.__TITANE_LOG__.setModule('ChatEngine', 'TRACE')
      setModule: (module: string, level: RuntimeLogLevel) => {
        logLevelManager.setModuleLevel(module, level);
      },
      // Reset module: window.__TITANE_LOG__.resetModule('ChatEngine')
      resetModule: (module: string) => {
        logLevelManager.resetModuleLevel(module);
      },
      // Exclude module: window.__TITANE_LOG__.exclude('NoiseLogger')
      exclude: (module: string) => {
        logLevelManager.excludeModule(module);
      },
      // Force module: window.__TITANE_LOG__.force('CriticalModule')
      force: (module: string) => {
        logLevelManager.forceModule(module);
      },
      // Get config: window.__TITANE_LOG__.config
      get config() {
        return logLevelManager.getConfig();
      },
      // Reset: window.__TITANE_LOG__.reset()
      reset: () => {
        logLevelManager.reset();
      },
    };

    console.info(
      '[LogLevelManager] Global API exposed: window.__TITANE_LOG__',
      `\nCurrent level: ${this.config.global}`,
      `\nUsage:`,
      `\n  window.__TITANE_LOG__.level = 'DEBUG'`,
      `\n  window.__TITANE_LOG__.setModule('ChatEngine', 'TRACE')`,
      `\n  window.__TITANE_LOG__.config`
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
 * ## Environment Variable (build-time)
 * ```bash
 * # .env.development
 * VITE_LOG_LEVEL=DEBUG
 *
 * # .env.production
 * VITE_LOG_LEVEL=INFO
 * ```
 *
 * ## Runtime Control (DevTools Console)
 * ```javascript
 * // Set global level
 * window.__TITANE_LOG__.level = 'DEBUG'
 * window.__TITANE_LOG__.level = 'TRACE' // Very verbose
 * window.__TITANE_LOG__.level = 'SILENT' // No logs
 *
 * // Set module-specific level
 * window.__TITANE_LOG__.setModule('ChatEngine', 'TRACE')
 * window.__TITANE_LOG__.setModule('MemoryEngine', 'WARN')
 *
 * // Reset module to global level
 * window.__TITANE_LOG__.resetModule('ChatEngine')
 *
 * // Exclude noisy module
 * window.__TITANE_LOG__.exclude('PerformanceMonitor')
 *
 * // Force important module
 * window.__TITANE_LOG__.force('SecurityEngine')
 *
 * // View current config
 * window.__TITANE_LOG__.config
 *
 * // Reset to defaults
 * window.__TITANE_LOG__.reset()
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
 * if (logLevelManager.shouldLog('MyModule', LogLevel.DEBUG)) {
 *   logger.debug('Expensive debug operation', computeDebugData());
 * }
 * ```
 *
 * ## Persistent User Preference
 * Log level is saved to localStorage and restored on page reload.
 * User can set their preferred verbosity once and it persists across sessions.
 *
 * ═══════════════════════════════════════════════════════════════
 */
