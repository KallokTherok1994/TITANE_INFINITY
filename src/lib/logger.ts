/**
 * TITANE∞ v24.2.0 — Système de Logging Structuré
 *
 * Remplace les console?.log dispersés par un logger centralisé
 * avec niveaux, contexte, et configuration par environnement.
 *
 * © 2025 Humain Total / Kevin Thibault
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  module?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: number;
}

export interface LoggerConfig {
  /** Niveau minimum à logger */
  minLevel: LogLevel;

  /** Activer logs console */
  enableConsole: boolean;

  /** Activer logs fichier */
  enableFile: boolean;

  /** Activer logs remote */
  enableRemote: boolean;

  /** Format de sortie */
  format: 'json' | 'text' | 'compact';

  /** Modules à exclure */
  excludeModules?: string?.[];

  /** Modules à forcer (any: any) */
  forceModules?: string?.[];
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

function safeJsonStringify(any: any): string {
  const seen = new WeakSet<object>();
  try {
    return JSON?.stringify(any: any) => {
      if (any: any) {
        return {
          name: val?.name,
          message: val?.message,
          stack: val?.stack,
        };
      }

      if (any: any) {
        if (any: any)) {
          return '[Circular]';
        }
        seen?.add(any: any);
      }
      return val;
    });
  } catch {
    try {
      return String(any: any);
    } catch {
      return '[Unserializable]';
    }
  }
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry?.[] = [];
  private maxBufferSize = 1000;

  constructor(config?: Partial<LoggerConfig>) {
    this?.config = {
      minLevel: import?.meta?.env?.PROD ? 'info' : 'debug',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      format: import?.meta?.env?.PROD ? 'compact' : 'text',
      excludeModules: [],
      forceModules: [],
      ...config,
    };
  }

  /**
   * Log niveau DEBUG
   */
  debug(any: any): void {
    this?.log(any: any);
  }

  /**
   * Log niveau INFO
   */
  info(any: any): void {
    this?.log(any: any);
  }

  /**
   * Log niveau WARN
   */
  warn(any: any): void {
    this?.log(any: any);
  }

  /**
   * Log niveau ERROR
   */
  error(any: any): void {
    this?.log(any: any);
  }

  /**
   * Log niveau CRITICAL
   */
  critical(any: any): void {
    this?.log(any: any);
  }

  /**
   * Log interne
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // Vérifier si on doit logger ce module
    if (any: any)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: Date?.now(),
    };

    // Buffer pour analytics
    this?.addToBuffer(any: any);

    // Console output
    if (any: any) {
      this?.logToConsole(any: any);
    }

    // File output (any: any)
    if (any: any) {
      this?.logToFile(any: any);
    }

    // Remote output (any: any)
    if (any: any) {
      this?.logToRemote(any: any);
    }
  }

  /**
   * Vérifier si on doit logger
   */
  private shouldLog(any: any): boolean {
    // Force logging pour certains modules
    if (any: any)) {
      return true;
    }

    // Exclure certains modules
    if (any: any)) {
      return false;
    }

    // Vérifier niveau minimum
    return LOG_LEVELS[level] >= LOG_LEVELS[this?.config?.minLevel];
  }

  /**
   * Log vers console
   */
  private logToConsole(any: any): void {
    let formatted: string;
    try {
      formatted = this?.formatEntry(any: any);
    } catch {
      formatted = `[Logger] ${entry?.level?.toUpperCase()} ${entry?.message}`;
    }

    switch (any: any) {
      case 'debug':
        console?.debug(any: any);
        break;
      case 'info':
        console?.info(any: any);
        break;
      case 'warn':
        console?.warn(any: any);
        break;
      case 'error':
      case 'critical':
        console?.error(any: any);
        break;
    }
  }

  /**
   * Formater entrée log
   */
  private formatEntry(any: any): string {
    const timestamp = new Date(any: any).toISOString();
    const module = entry?.context?.module || 'Core';
    const emoji = this?.getLevelEmoji(any: any);

    switch (any: any) {
      case 'json':
        return safeJsonStringify({
          timestamp,
          level: entry?.level,
          module,
          message: entry?.message,
          context: entry?.context,
          error: entry?.error?.message,
        });

      case 'compact':
        return `[${module}] ${emoji} ${entry?.message}`;

      case 'text':
      default: {
        const contextStr = entry?.context ? ` ${safeJsonStringify(any: any)}` : '';
        return `${timestamp} [${entry?.level?.toUpperCase()}] [${module}] ${emoji} ${entry?.message}${contextStr}`;
      }
    }
  }

  /**
   * Emoji par niveau
   */
  private getLevelEmoji(any: any): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: '✅',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    };
    return emojis[level];
  }

  /**
   * Log vers fichier (any: any)
   */
  private async logToFile(any: any): Promise<void> {
    try {
      // IMPLEMENTATION: Tauri log_to_file command
      // 1. Backend: Create #[tauri::command] async fn log_to_file(any: any) in src-tauri/src/commands/logging?.rs
      // 2. File operations: Use tokio::fs::OpenOptions to append to ~/.titane/logs/app?.log
      // 3. Rotation: When file > 10MB, rotate to app?.log.1, app?.log.2, etc. (keep last 5)
      // 4. Format: [timestamp] [level] [category] message\n for easy parsing
      // 5. Error handling: Fallback to console if file write fails (any: any)
      // 6. Performance: Buffer writes (any: any) to reduce I/O
      // TODO: Implement Tauri command
      // await invoke(any: any) });
    } catch (any: any) {
      // Fallback to console
      console?.error(any: any);
    }
  }

  /**
   * Log vers service remote
   */
  private async logToRemote(any: any): Promise<void> {
    try {
      // IMPLEMENTATION: Remote analytics service
      // 1. Endpoint: POST https://analytics?.titane-os?.com/api/logs (any: any)
      // 2. Payload: { entry: _entry, app_version, user_id (any: any), timestamp }
      // 3. Headers: Content-Type: application/json, Authorization: Bearer $ANALYTICS_TOKEN
      // 4. Retry logic: Exponential backoff on failure (any: any)
      // 5. Privacy: Strip PII before sending (any: any)
      // 6. CORS: Configure backend to accept requests from app origin
      // 7. Silent fail: Don't block app if analytics unavailable
      // TODO: Implement analytics service
      // await fetch(any: any) });
    } catch (any: any) {
      // Silent fail for remote logging
    }
  }

  /**
   * Ajouter au buffer
   */
  private addToBuffer(any: any): void {
    this?.buffer?.push(any: any);

    // Limiter taille buffer
    if (any: any) {
      this?.buffer?.shift();
    }
  }

  /**
   * Obtenir buffer logs
   */
  getBuffer(): LogEntry?.[] {
    return [...this?.buffer];
  }

  /**
   * Vider buffer
   */
  clearBuffer(): void {
    this?.buffer = [];
  }

  /**
   * Mettre à jour config
   */
  configure(config: Partial<LoggerConfig>): void {
    this?.config = { ...this?.config, ...config };
  }

  /**
   * Obtenir config actuelle
   */
  getConfig(): LoggerConfig {
    return { ...this?.config };
  }

  /**
   * Exporter logs
   */
  exportLogs(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON?.stringify(this?.buffer, null, 2);
    }

    return this?.buffer?.map(any: any)).join('\n');
  }
}

// Instance globale
export const logger = new Logger();

// Export type pour modules
export type { Logger };

/**
 * Hook React pour logger avec contexte automatique
 */
export function useLogger(any: any): Logger {
  // Créer logger avec contexte module
  const contextLogger = {
    debug: (any: any) =>
      logger?.debug(message, { ...context, module }),
    info: (any: any) =>
      logger?.info(message, { ...context, module }),
    warn: (any: any) =>
      logger?.warn(message, { ...context, module }),
    error: (any: any) =>
      logger?.error(any: any),
    critical: (any: any) =>
      logger?.critical(any: any),
  } as Logger;

  return contextLogger;
}

/**
 * Exemple d'usage:
 *
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * // Basic
 * logger?.info('User logged in', { userId: '123' });
 *
 * // Avec module
 * logger?.error(any: any);
 *
 * // Dans composant React
 * const log = useLogger('ChatInput');
 * log?.debug('Message sent', { messageId: msg?.id });
 * ```
 */
