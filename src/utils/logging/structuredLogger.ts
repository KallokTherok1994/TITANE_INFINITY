/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Structured Logger - Centralized logging with structured output
 * Part of SUPER PROMPT #3: Observability
 */

import { tauriClient } from '@/lib/tauriClient';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: LogContext;
}

export interface LogContext {
  sessionId?: string;
  userId?: string;
  requestId?: string;
  engineId?: string;
  providerId?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableBackend: boolean;
  prettyPrint: boolean;
  contextProvider?: () => LogContext;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL ORDERING
// ═══════════════════════════════════════════════════════════════════════════

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

const RESET = '\x1b[0m';

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURED LOGGER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * StructuredLogger - Centralized logging system
 *
 * Features:
 * - Structured JSON output
 * - Log levels with filtering
 * - Context injection
 * - Backend forwarding (Tauri)
 * - Pretty print mode for development
 */
class StructuredLoggerImpl {
  private config: LoggerConfig = {
    minLevel: 'info',
    enableConsole: true,
    enableBackend: true,
    prettyPrint: true,
  };

  private history: LogEntry[] = [];
  private readonly maxHistory = 500;
  private backendQueue: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a child logger with a specific category
   */
  child(category: string): CategoryLogger {
    return new CategoryLogger(this, category);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOG METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  debug(category: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', category, message, data);
  }

  error(
    category: string,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.log('error', category, message, data, error);
  }

  fatal(
    category: string,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.log('fatal', category, message, data, error);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, unknown>,
    error?: Error | unknown
  ): void {
    // Check level
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.config.minLevel]) {
      return;
    }

    // Build entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      context: this.config.contextProvider?.(),
    };

    // Add error if present
    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = {
          name: 'Unknown',
          message: String(error),
        };
      }
    }

    // Store in history
    this.addToHistory(entry);

    // Output to console
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Queue for backend
    if (this.config.enableBackend) {
      this.queueForBackend(entry);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════════════════════════════════════════

  private outputToConsole(entry: LogEntry): void {
    const consoleMethod = this.getConsoleMethod(entry.level);

    if (this.config.prettyPrint) {
      this.prettyPrint(entry, consoleMethod);
    } else {
      consoleMethod(JSON.stringify(entry));
    }
  }

  private prettyPrint(
    entry: LogEntry,
    consoleMethod: (...args: unknown[]) => void
  ): void {
    const color = LEVEL_COLORS[entry.level];
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const time = entry.timestamp ? entry.timestamp.split('T')[1]?.split('.')[0] : 'N/A';

    let output = `${color}[${levelStr}]${RESET} ${time} [${entry.category}] ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      output += ` ${JSON.stringify(entry.data)}`;
    }

    consoleMethod(output);

    if (entry.error) {
      console.error(`  └─ ${entry.error.name}: ${entry.error.message}`);
      if (entry.error.stack) {
        const stackLines = entry.error.stack.split('\n').slice(1, 4);
        stackLines.forEach(line => console.error(`     ${line.trim()}`));
      }
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKEND FORWARDING
  // ═══════════════════════════════════════════════════════════════════════════

  private queueForBackend(entry: LogEntry): void {
    this.backendQueue.push(entry);

    // Debounce flush
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushToBackend();
      }, 100);
    }
  }

  private async flushToBackend(): Promise<void> {
    this.flushTimer = null;

    if (this.backendQueue.length === 0) return;

    const entries = [...this.backendQueue];
    this.backendQueue = [];

    try {
      // Check if Tauri is available
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        await tauriClient.logEntries({ entries });
      }
    } catch {
      // Silently fail if backend not available
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  private addToHistory(entry: LogEntry): void {
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getHistory(limit?: number, level?: LogLevel): LogEntry[] {
    let entries = this.history;

    if (level) {
      entries = entries.filter(e => e.level === level);
    }

    return entries.slice(-(limit ?? this.maxHistory));
  }

  getRecentErrors(limit = 10): LogEntry[] {
    return this.history
      .filter(e => e.level === 'error' || e.level === 'fatal')
      .slice(-limit);
  }

  clearHistory(): void {
    this.history = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY LOGGER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CategoryLogger - Logger bound to a specific category
 */
class CategoryLogger {
  constructor(
    private parent: StructuredLoggerImpl,
    private category: string
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.parent.debug(this.category, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.parent.info(this.category, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.parent.warn(this.category, message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.parent.error(this.category, message, error, data);
  }

  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.parent.fatal(this.category, message, error, data);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Global structured logger instance
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logging';
 *
 * // Direct usage
 * logger.info('MyComponent', 'User logged in', { userId: '123' });
 *
 * // Category logger
 * const log = logger.child('MyComponent');
 * log.info('User logged in', { userId: '123' });
 * log.error('Failed to load', error, { context: 'additional' });
 * ```
 */
export const logger = new StructuredLoggerImpl();

// Export types
export { CategoryLogger };
