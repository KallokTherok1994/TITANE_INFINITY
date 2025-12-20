/**
 * TITANE_INFINITY v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   LOGGER UTILITIES — Production-Ready Conditional Logging
 *   Replace console.log avec filtrage basé sur environnement
 *   Phase 4 (Week 6): Runtime LOG_LEVEL control integration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { LogArgs, LogParts, TableData } from '@/types/logger';

// Lazy import to avoid circular dependency
type RuntimeLogLevelManager = {
  shouldLog: (source: string, level: number) => boolean;
};

let logLevelManager: RuntimeLogLevelManager | null = null;
let logLevelManagerLoadStarted = false;
const getLogLevelManager = () => {
  if (logLevelManager) {
    return logLevelManager;
  }

  if (!logLevelManagerLoadStarted) {
    logLevelManagerLoadStarted = true;
    import('@/config/logLevelConfig')
      .then(mod => {
        logLevelManager = (mod as unknown as { logLevelManager?: RuntimeLogLevelManager })
          .logLevelManager ?? null;
      })
      .catch(() => {
        logLevelManager = null;
      });
  }

  return logLevelManager;
};

/**
 * Log levels (par ordre de priorité)
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * Configuration logger
 */
interface LoggerConfig {
  /** Niveau minimum pour afficher logs */
  minLevel: LogLevel;
  /** Préfixe pour tous les logs */
  prefix?: string;
  /** Activer timestamps */
  timestamps?: boolean;
  /** Mode production (disable debug/trace) */
  isProduction?: boolean;
  /** Enable runtime log level control */
  enableRuntimeControl?: boolean;
}

/**
 * Logger singleton avec conditional logging
 */
class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';

    this.config = {
      minLevel: isDev ? LogLevel.TRACE : LogLevel.INFO,
      prefix: config?.prefix || 'TITANE',
      timestamps: config?.timestamps !== false,
      isProduction: !isDev && !isTest,
      enableRuntimeControl: true, // Enable by default
      ...config,
    };
  }

  /**
   * Configure logger (pour tests ou runtime changes)
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Format message avec préfixe et timestamp
   */
  private format(level: string, ...args: LogArgs): LogParts {
    const parts: LogParts = [];

    if (this.config.timestamps) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    parts.push(`[${this.config.prefix}]`);
    parts.push(`[${level}]`);
    parts.push(...args);

    return parts;
  }

  /**
   * Check si niveau doit être loggé
   * Now integrates with runtime log level manager if available
   */
  private shouldLog(level: LogLevel): boolean {
    // Check runtime log level manager first (if enabled)
    if (this.config.enableRuntimeControl) {
      const manager = getLogLevelManager();
      if (manager) {
        const shouldLog = manager.shouldLog(this.config.prefix, level);
        return shouldLog;
      }
    }

    // Fallback to original logic
    if (this.config.isProduction && level < LogLevel.INFO) {
      return false; // Production: seulement INFO+
    }
    return level >= this.config.minLevel;
  }

  /**
   * TRACE - Debug très verbeux (dev only)
   */
  trace(...args: LogArgs) {
    if (!this.shouldLog(LogLevel.TRACE)) return;
    console.log(...this.format('TRACE', ...args));
  }

  /**
   * DEBUG - Informations debug (dev only)
   */
  debug(...args: LogArgs) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.log(...this.format('DEBUG', ...args));
  }

  /**
   * INFO - Informations générales (production OK)
   */
  info(...args: LogArgs) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(...this.format('INFO', ...args));
  }

  /**
   * WARN - Warnings (production OK)
   */
  warn(...args: LogArgs) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(...this.format('WARN', ...args));
  }

  /**
   * ERROR - Erreurs (production OK)
   */
  error(...args: LogArgs) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    console.error(...this.format('ERROR', ...args));
  }

  /**
   * FATAL - Erreurs critiques (toujours loggé)
   */
  fatal(...args: LogArgs) {
    console.error(...this.format('FATAL', ...args));
  }

  /**
   * Group logs (dev only)
   */
  group(label: string, collapsed = false) {
    if (this.config.isProduction) return;
    if (collapsed) {
      console.groupCollapsed(...this.format('GROUP', label));
    } else {
      console.group(...this.format('GROUP', label));
    }
  }

  groupEnd() {
    if (this.config.isProduction) return;
    console.groupEnd();
  }

  /**
   * Table display (dev only)
   */
  table(data: TableData) {
    if (this.config.isProduction) return;
    console.table(data);
  }

  /**
   * Time profiling
   */
  time(label: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.time(`[${this.config.prefix}] ${label}`);
  }

  timeEnd(label: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.timeEnd(`[${this.config.prefix}] ${label}`);
  }
}

/**
 * Export singleton par défaut
 */
export const logger = new Logger();

/**
 * Export créateur de loggers avec préfixe custom
 */
export function createLogger(prefix: string, config?: Partial<LoggerConfig>) {
  return new Logger({ ...config, prefix });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * // Logger par défaut
 * import { logger } from '@/utils/logger';
 *
 * logger.debug('Config loaded', config); // Dev only
 * logger.info('User logged in', userId); // Production OK
 * logger.warn('API slow response', latency); // Production OK
 * logger.error('Failed to save', error); // Production OK
 *
 * // Logger custom pour module
 * import { createLogger } from '@/utils/logger';
 * const aiLogger = createLogger('AI');
 *
 * aiLogger.debug('Provider selected', provider); // Dev only
 * aiLogger.info('Message generated', { tokens: 142 }); // Production OK
 *
 * // Profiling
 * logger.time('API Call');
 * await fetchData();
 * logger.timeEnd('API Call'); // "[TITANE] API Call: 234ms"
 *
 * // Grouping (dev only)
 * logger.group('Provider Flow');
 * logger.debug('Step 1: Validate');
 * logger.debug('Step 2: Query');
 * logger.groupEnd();
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *   MIGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Avant:
 *   console.log('[AI Provider]', 'Selected:', provider);
 *   console.warn('[Memory]', 'Cache miss');
 *
 * Après:
 *   const logger = createLogger('AI Provider');
 *   logger.debug('Selected:', provider); // Dev only
 *   logger.warn('Cache miss'); // Production OK
 *
 * Benefits:
 * - ✅ Automatic dev/production filtering
 * - ✅ Structured timestamps
 * - ✅ Consistent formatting
 * - ✅ Performance (no-op in production for debug)
 * - ✅ Easy to disable/configure
 */
