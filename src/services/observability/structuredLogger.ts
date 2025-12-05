/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — STRUCTURED LOGGER (Phase 10)
 *   Logging structuré avec correlation IDs et niveaux
 * ═══════════════════════════════════════════════════════════════════
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  correlationIdPrefix: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * Structured Logger
 * ═══════════════════════════════════════════════════════════════════
 */

class StructuredLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private currentCorrelationId: string | null = null;
  private readonly STORAGE_KEY = 'titane_structured_logs';

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxStoredLogs: 1000,
      correlationIdPrefix: 'titane',
      ...config,
    };

    this.loadLogsFromStorage();
  }

  /**
   * Generate a unique correlation ID
   */
  generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${this.config.correlationIdPrefix}-${timestamp}-${random}`;
  }

  /**
   * Set current correlation ID (for tracing request chains)
   */
  setCorrelationId(id: string): void {
    this.currentCorrelationId = id;
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string | null {
    return this.currentCorrelationId;
  }

  /**
   * Clear current correlation ID
   */
  clearCorrelationId(): void {
    this.currentCorrelationId = null;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Partial<LogContext>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Partial<LogContext>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Partial<LogContext>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Partial<LogContext>): void {
    const errorContext: Partial<LogContext> = {
      ...context,
      metadata: {
        ...context?.metadata,
        errorName: error?.name,
        errorMessage: error?.message,
      },
    };

    this.log('error', message, errorContext, error);
  }

  /**
   * Log fatal message (critical system failure)
   */
  fatal(message: string, error?: Error, context?: Partial<LogContext>): void {
    const errorContext: Partial<LogContext> = {
      ...context,
      metadata: {
        ...context?.metadata,
        errorName: error?.name,
        errorMessage: error?.message,
      },
    };

    this.log('fatal', message, errorContext, error);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Partial<LogContext>,
    error?: Error
  ): void {
    // Check if log level is enabled
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: {
        correlationId: this.currentCorrelationId || undefined,
        ...context,
      },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Store log
    this.logs.push(entry);
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Storage persistence
    if (this.config.enableStorage) {
      this.saveLogsToStorage();
    }
  }

  /**
   * Log to console with color coding
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const correlationId = entry.context.correlationId || 'N/A';
    const component = entry.context.component || 'System';

    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${correlationId}] [${component}]`;

    const styles: Record<LogLevel, string> = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red',
      fatal: 'color: red; font-weight: bold',
    };

    console.log(`%c${prefix}`, styles[entry.level], entry.message, entry.context);

    if (entry.error) {
      console.error('Error:', entry.error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogsToStorage(): void {
    try {
      const logsToStore = this.logs.slice(-this.config.maxStoredLogs);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logsToStore));
    } catch (error) {
      console.error('[StructuredLogger] Failed to save logs to storage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[StructuredLogger] Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  /**
   * Get all logs
   */
  getLogs(filters?: {
    level?: LogLevel;
    component?: string;
    correlationId?: string;
    startTime?: number;
    endTime?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filters?.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters?.component) {
      filtered = filtered.filter(log => log.context.component === filters.component);
    }

    if (filters?.correlationId) {
      filtered = filtered.filter(log => log.context.correlationId === filters.correlationId);
    }

    if (filters?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filters.startTime!);
    }

    if (filters?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filters.endTime!);
    }

    return filtered;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.saveLogsToStorage();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logs summary
   */
  getSummary(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byComponent: Record<string, number>;
    oldestLog: number | null;
    newestLog: number | null;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    const byComponent: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level]++;

      const component = log.context.component || 'Unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      byComponent,
      oldestLog: this.logs.length > 0 ? this.logs[0].timestamp : null,
      newestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
    };
  }

  /**
   * Configure logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * Singleton Export
 * ═══════════════════════════════════════════════════════════════════
 */

export const logger = new StructuredLogger();

/**
 * ═══════════════════════════════════════════════════════════════════
 * Component-specific Loggers
 * ═══════════════════════════════════════════════════════════════════
 */

export function createComponentLogger(component: string) {
  return {
    debug: (message: string, context?: Partial<LogContext>) =>
      logger.debug(message, { ...context, component }),
    info: (message: string, context?: Partial<LogContext>) =>
      logger.info(message, { ...context, component }),
    warn: (message: string, context?: Partial<LogContext>) =>
      logger.warn(message, { ...context, component }),
    error: (message: string, error?: Error, context?: Partial<LogContext>) =>
      logger.error(message, error, { ...context, component }),
    fatal: (message: string, error?: Error, context?: Partial<LogContext>) =>
      logger.fatal(message, error, { ...context, component }),
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * HOF: Log Operation Duration
 * ═══════════════════════════════════════════════════════════════════
 */

export async function logOperation<T>(
  operation: string,
  component: string,
  fn: () => Promise<T>
): Promise<T> {
  const correlationId = logger.generateCorrelationId();
  logger.setCorrelationId(correlationId);

  const startTime = Date.now();
  logger.info(`Starting operation: ${operation}`, { component, operation });

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logger.info(`Operation completed: ${operation}`, {
      component,
      operation,
      duration,
      metadata: { success: true },
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      `Operation failed: ${operation}`,
      error instanceof Error ? error : new Error(String(error)),
      { component, operation, duration, metadata: { success: false } }
    );

    throw error;
  } finally {
    logger.clearCorrelationId();
  }
}
