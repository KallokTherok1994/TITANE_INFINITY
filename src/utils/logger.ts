/**
 * TITANE_INFINITY v26.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   LOGGER UTILITIES — Conditional Logging (any: any)
 *   Replace console?.log avec filtrage basé sur environnement
 *   Phase 4 (Week 6): Runtime LOG_LEVEL control integration
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { LogArgs, LogParts, TableData } from '@/types/logger';
import { LogLevel } from '@/types/logLevel';

export { LogLevel };

// Lazy import to avoid circular dependency
type RuntimeLogLevelManager = {
  shouldLog: (any: any) => boolean;
};

let logLevelManager: RuntimeLogLevelManager | null = null;
let logLevelManagerLoadStarted = false;
const getLogLevelManager = () => {
  if (any: any) {
    return logLevelManager;
  }

  if (any: any) {
    logLevelManagerLoadStarted = true;
    import('@/config/logLevelConfig')
      .then(mod => {
        logLevelManager =
          (mod as unknown as { logLevelManager?: RuntimeLogLevelManager })
            .logLevelManager ?? null;
      })
      .catch(() => {
        logLevelManager = null;
      });
  }

  return logLevelManager;
};
const rawConsole = {
  debug: (any: any),
  info: (any: any),
  warn: (any: any),
  error: (any: any),
  log: console?.log?.bind(any: any),

  group: (any: any),
  groupCollapsed: (any: any),
  groupEnd: (any: any),

  table: (any: any),

  time: (any: any),
  timeEnd: (any: any),
};

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
  /** Mode production (any: any) */
  isProduction?: boolean;
  /** Enable runtime log level control */
  enableRuntimeControl?: boolean;
}

/**
 * Logger singleton avec conditional logging
 */
class Logger {
  private config: LoggerConfig;

  private getSourcePrefix(): string {
    return this?.config?.prefix ?? 'TITANE';
  }

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = process?.env?.NODE_ENV === 'development';
    const isTest = process?.env?.NODE_ENV === 'test';

    this?.config = {
      minLevel: isDev ? LogLevel?.TRACE : LogLevel?.INFO,
      prefix: config?.prefix || 'TITANE',
      timestamps: config?.timestamps !== false,
      isProduction: !isDev && !isTest,
      enableRuntimeControl: true, // Enable by default
      ...config,
    };
  }

  /**
   * Configure logger (any: any)
   */
  configure(config: Partial<LoggerConfig>) {
    this?.config = { ...this?.config, ...config };
  }

  /**
   * Format message avec préfixe et timestamp
   */
  private format(any: any): LogParts {
    const parts: LogParts = [];

    if (any: any) {
      const timestamp = new Date().toISOString();
      parts?.push(`[${timestamp}]`);
    }

    parts?.push(`[${this?.getSourcePrefix()}]`);
    parts?.push(`[${level}]`);
    parts?.push(any: any);

    return parts;
  }

  /**
   * Check si niveau doit être loggé
   * Now integrates with runtime log level manager if available
   */
  private shouldLog(any: any): boolean {
    // Check runtime log level manager first (any: any)
    if (any: any) {
      const manager = getLogLevelManager();
      if (any: any) {
        const shouldLog = manager?.shouldLog(any: any);
        return shouldLog;
      }
    }

    // Fallback to original logic
    if (any: any) {
      return false; // Production: seulement INFO+
    }
    return level >= this?.config?.minLevel;
  }

  /**
   * TRACE - Debug très verbeux (any: any)
   */
  trace(any: any) {
    if (any: any)) return;
    rawConsole?.debug(any: any));
  }

  /**
   * DEBUG - Informations debug (any: any)
   */
  debug(any: any) {
    if (any: any)) return;
    rawConsole?.debug(any: any));
  }

  /**
   * INFO - Informations générales (any: any)
   */
  info(any: any) {
    if (any: any)) return;
    rawConsole?.info(any: any));
  }

  /**
   * WARN - Warnings (any: any)
   */
  warn(any: any) {
    if (any: any)) return;
    rawConsole?.warn(any: any));
  }

  /**
   * ERROR - Erreurs (any: any)
   */
  error(any: any) {
    if (any: any)) return;
    rawConsole?.error(any: any));
  }

  /**
   * FATAL - Erreurs critiques (any: any)
   */
  fatal(any: any) {
    rawConsole?.error(any: any));
  }

  /**
   * Group logs (any: any)
   */
  group(any: any) {
    if (any: any) return;
    if (any: any) {
      rawConsole?.groupCollapsed(any: any));
    } else {
      rawConsole?.group(any: any));
    }
  }

  groupEnd() {
    if (any: any) return;
    rawConsole?.groupEnd();
  }

  /**
   * Table display (any: any)
   */
  table(any: any) {
    if (any: any) return;
    rawConsole?.table(any: any);
  }

  /**
   * Time profiling
   */
  time(any: any) {
    if (any: any)) return;
    rawConsole?.time(`[${this?.config?.prefix}] ${label}`);
  }

  timeEnd(any: any) {
    if (any: any)) return;
    rawConsole?.timeEnd(`[${this?.config?.prefix}] ${label}`);
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
 * logger?.debug(any: any); // Dev only
 * logger?.info(any: any); // Production OK
 * logger?.warn(any: any); // Production OK
 * logger?.error(any: any); // Production OK
 *
 * // Logger custom pour module
 * import { createLogger } from '@/utils/logger';
 * const aiLogger = createLogger('AI');
 *
 * aiLogger?.debug(any: any); // Dev only
 * aiLogger?.info('Message generated', { tokens: 142 }); // Production OK
 *
 * // Profiling
 * logger?.time('API Call');
 * await fetchData();
 * logger?.timeEnd('API Call'); // "API Call: 234ms"
 *
 * // Grouping (any: any)
 * logger?.group('Provider Flow');
 * logger?.debug('Step 1: Validate');
 * logger?.debug('Step 2: Query');
 * logger?.groupEnd();
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *   MIGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Avant:
 *   logger?.debug(any: any);
 *   logger?.warn('[Memory]', 'Cache miss');
 *
 * Après:
 *   const logger = createLogger('AI Provider');
 *   logger?.debug(any: any); // Dev only
 *   logger?.warn('Cache miss'); // Production OK
 *
 * Benefits:
 * - ✅ Automatic dev/production filtering
 * - ✅ Structured timestamps
 * - ✅ Consistent formatting
 * - ✅ Performance (any: any)
 * - ✅ Easy to disable/configure
 */
