/**
 * TITANE∞ v24.2.0 — Système de Logging Structuré
 *
 * Remplace les console.log dispersés par un logger centralisé
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
  excludeModules?: string[];

  /** Modules à forcer (override minLevel) */
  forceModules?: string[];
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: import.meta.env.PROD ? 'info' : 'debug',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      format: import.meta.env.PROD ? 'compact' : 'text',
      excludeModules: [],
      forceModules: [],
      ...config,
    };
  }

  /**
   * Log niveau DEBUG
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log niveau INFO
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log niveau WARN
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log niveau ERROR
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, { ...context, error: error?.message }, error);
  }

  /**
   * Log niveau CRITICAL
   */
  critical(message: string, context?: LogContext, error?: Error): void {
    this.log('critical', message, { ...context, error: error?.message }, error);
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
    if (!this.shouldLog(level, context?.module)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: Date.now(),
    };

    // Buffer pour analytics
    this.addToBuffer(entry);

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File output (via Tauri backend)
    if (this.config.enableFile) {
      this.logToFile(entry);
    }

    // Remote output (analytics service)
    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }

  /**
   * Vérifier si on doit logger
   */
  private shouldLog(level: LogLevel, module?: string): boolean {
    // Force logging pour certains modules
    if (module && this.config.forceModules?.includes(module)) {
      return true;
    }

    // Exclure certains modules
    if (module && this.config.excludeModules?.includes(module)) {
      return false;
    }

    // Vérifier niveau minimum
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * Log vers console
   */
  private logToConsole(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'critical':
        console.error(formatted, entry.error);
        break;
    }
  }

  /**
   * Formater entrée log
   */
  private formatEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const module = entry.context?.module || 'Core';
    const emoji = this.getLevelEmoji(entry.level);

    switch (this.config.format) {
      case 'json':
        return JSON.stringify({
          timestamp,
          level: entry.level,
          module,
          message: entry.message,
          context: entry.context,
          error: entry.error?.message,
        });

      case 'compact':
        return `[${module}] ${emoji} ${entry.message}`;

      case 'text':
      default: {
        const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
        return `${timestamp} [${entry.level.toUpperCase()}] [${module}] ${emoji} ${entry.message}${contextStr}`;
      }
    }
  }

  /**
   * Emoji par niveau
   */
  private getLevelEmoji(level: LogLevel): string {
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
   * Log vers fichier (via Tauri)
   */
  private async logToFile(_entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement Tauri command
      // await invoke('log_to_file', { entry: this.formatEntry(_entry) });
    } catch (error) {
      // Fallback to console
      console.error('[Logger] Failed to write to file:', error);
    }
  }

  /**
   * Log vers service remote
   */
  private async logToRemote(_entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement analytics service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(_entry) });
    } catch (error) {
      // Silent fail for remote logging
    }
  }

  /**
   * Ajouter au buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);

    // Limiter taille buffer
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }
  }

  /**
   * Obtenir buffer logs
   */
  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Vider buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Mettre à jour config
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtenir config actuelle
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Exporter logs
   */
  exportLogs(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.buffer, null, 2);
    }

    return this.buffer.map(entry => this.formatEntry(entry)).join('\n');
  }
}

// Instance globale
export const logger = new Logger();

// Export type pour modules
export type { Logger };

/**
 * Hook React pour logger avec contexte automatique
 */
export function useLogger(module: string): Logger {
  // Créer logger avec contexte module
  const contextLogger = {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...context, module }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...context, module }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...context, module }),
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { ...context, module }, error),
    critical: (message: string, context?: LogContext, error?: Error) =>
      logger.critical(message, { ...context, module }, error),
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
 * logger.info('User logged in', { userId: '123' });
 *
 * // Avec module
 * logger.error('API call failed', { module: 'VectorStore' }, error);
 *
 * // Dans composant React
 * const log = useLogger('ChatInput');
 * log.debug('Message sent', { messageId: msg.id });
 * ```
 */
