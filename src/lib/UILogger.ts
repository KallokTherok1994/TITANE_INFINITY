/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER SÉCURISÉ
 * ═══════════════════════════════════════════════════════════════
 * Logger dédié UI avec:
 * - Isolation logs frontend vs backend
 * - Throttling (max 100 logs/min par level)
 * - Storage local (max 1000 logs, rotation FIFO)
 * - Sanitization automatique (PII, secrets)
 * - Override console.* en production
 * ───────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

export interface UILoggerConfig {
  enabled: boolean;
  maxLogsPerMinute: number;
  maxStoredLogs: number;
  enableConsoleOverride: boolean;
  sensitivePatterns: RegExp[];
  minLevel: LogLevel;
}

interface ThrottleState {
  count: number;
  windowStart: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: UILoggerConfig = {
  enabled: true,
  maxLogsPerMinute: 100,
  maxStoredLogs: 1000,
  enableConsoleOverride: import.meta.env.PROD, // Override uniquement en production
  sensitivePatterns: [
    /sk-[a-zA-Z0-9]{48}/g,           // OpenAI API keys
    /AIza[a-zA-Z0-9_-]{35}/g,        // Google API keys
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, // JWT tokens
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,   // Email addresses
    /\b\d{3}-\d{2}-\d{4}\b/g,        // SSN (US)
    /\b\d{16}\b/g,                   // Credit card numbers
    /password["\s:=]+[^\s"]+/gi,     // Password fields
    /token["\s:=]+[^\s"]+/gi,        // Token fields
  ],
  minLevel: import.meta.env.PROD ? 'info' : 'debug',
};

// ═══════════════════════════════════════════════════════════════
// LOG LEVEL ORDERING
// ═══════════════════════════════════════════════════════════════

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  security: 4,
};

// ═══════════════════════════════════════════════════════════════
// UI LOGGER CLASS
// ═══════════════════════════════════════════════════════════════

export class UILogger {
  private config: UILoggerConfig;
  private logs: LogEntry[] = [];
  private throttleState: Map<LogLevel, ThrottleState> = new Map();
  private sessionId: string;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor(config: Partial<UILoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();

    // Backup original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    // Load logs from localStorage
    this.loadLogs();

    // Initialize throttle state
    this.initializeThrottle();

    // Override console methods if enabled
    if (this.config.enableConsoleOverride) {
      this.overrideConsole();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────

  private generateSessionId(): string {
    return `ui-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private initializeThrottle(): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'security'];
    levels.forEach((level) => {
      this.throttleState.set(level, { count: 0, windowStart: Date.now() });
    });
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem('titane_ui_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
        // Keep only last maxStoredLogs
        if (this.logs.length > this.config.maxStoredLogs) {
          this.logs = this.logs.slice(-this.config.maxStoredLogs);
        }
      }
    } catch (error) {
      this.originalConsole.error('[UILogger] Failed to load logs from storage:', error);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem('titane_ui_logs', JSON.stringify(this.logs));
    } catch (error) {
      this.originalConsole.error('[UILogger] Failed to save logs to storage:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CONSOLE OVERRIDE
  // ─────────────────────────────────────────────────────────────

  private overrideConsole(): void {
    console.log = (...args: unknown[]) => {
      this.log('info', this.formatArgs(args));
      if (import.meta.env.DEV) {
        this.originalConsole.log(...args);
      }
    };

    console.warn = (...args: unknown[]) => {
      this.log('warn', this.formatArgs(args));
      if (import.meta.env.DEV) {
        this.originalConsole.warn(...args);
      }
    };

    console.error = (...args: unknown[]) => {
      this.log('error', this.formatArgs(args));
      if (import.meta.env.DEV) {
        this.originalConsole.error(...args);
      }
    };

    console.debug = (...args: unknown[]) => {
      this.log('debug', this.formatArgs(args));
      if (import.meta.env.DEV) {
        this.originalConsole.debug(...args);
      }
    };
  }

  private formatArgs(args: unknown[]): string {
    return args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');
  }

  // ─────────────────────────────────────────────────────────────
  // SANITIZATION
  // ─────────────────────────────────────────────────────────────

  private sanitize(message: string): string {
    let sanitized = message;
    this.config.sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  // ─────────────────────────────────────────────────────────────
  // THROTTLING
  // ─────────────────────────────────────────────────────────────

  private checkThrottle(level: LogLevel): boolean {
    const state = this.throttleState.get(level);
    if (!state) return true;

    const now = Date.now();
    const windowDuration = 60000; // 60 seconds

    // Reset window if expired
    if (now - state.windowStart >= windowDuration) {
      state.count = 0;
      state.windowStart = now;
      this.throttleState.set(level, state);
    }

    // Check limit
    if (state.count >= this.config.maxLogsPerMinute) {
      return false; // Throttled
    }

    // Increment counter
    state.count++;
    this.throttleState.set(level, state);
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // LOG LEVEL FILTERING
  // ─────────────────────────────────────────────────────────────

  private shouldLog(level: LogLevel): boolean {
    const currentLevelOrder = LOG_LEVEL_ORDER[level];
    const minLevelOrder = LOG_LEVEL_ORDER[this.config.minLevel];
    return currentLevelOrder >= minLevelOrder;
  }

  // ─────────────────────────────────────────────────────────────
  // CORE LOGGING
  // ─────────────────────────────────────────────────────────────

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    stack?: string
  ): void {
    if (!this.config.enabled) return;
    if (!this.shouldLog(level)) return;
    if (!this.checkThrottle(level)) {
      // Throttled - log warning once per window
      if (this.throttleState.get(level)?.count === this.config.maxLogsPerMinute) {
        this.originalConsole.warn(
          `[UILogger] Throttle limit reached for level "${level}" (${this.config.maxLogsPerMinute}/min)`
        );
      }
      return;
    }

    // Sanitize message
    const sanitizedMessage = this.sanitize(message);

    // Create log entry
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message: sanitizedMessage,
      context,
      stack,
      sessionId: this.sessionId,
    };

    // Add to logs
    this.logs.push(entry);

    // Rotate logs if exceeded max
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Save to localStorage (throttled to avoid performance issues)
    if (this.logs.length % 10 === 0 || level === 'error' || level === 'security') {
      this.saveLogs();
    }

    // Log to original console in dev mode
    if (import.meta.env.DEV) {
      const consoleMethod = level === 'debug' ? 'debug' : level === 'warn' ? 'warn' : level === 'error' || level === 'security' ? 'error' : 'log';
      this.originalConsole[consoleMethod](`[UILogger:${level}]`, sanitizedMessage, context || '');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorMessage = error instanceof Error ? `${message}: ${error.message}` : message;
    this.log('error', errorMessage, context, stack);
  }

  security(message: string, context?: Record<string, unknown>): void {
    this.log('security', message, context);

    // Security logs always saved immediately
    this.saveLogs();

    // Always log to original console for security events
    this.originalConsole.error(`[SECURITY] ${message}`, context || '');
  }

  // ─────────────────────────────────────────────────────────────
  // RETRIEVAL & MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  getLogs(filter?: { level?: LogLevel; since?: number; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.since !== undefined) {
      filtered = filtered.filter((log) => log.timestamp >= (filter.since ?? 0));
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  getRecentErrors(limit = 10): LogEntry[] {
    return this.logs
      .filter((log) => log.level === 'error' || log.level === 'security')
      .slice(-limit);
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('titane_ui_logs');
      this.info('UI logs cleared');
    } catch (error) {
      this.originalConsole.error('[UILogger] Failed to clear logs:', error);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getStats(): {
    totalLogs: number;
    byLevel: Record<LogLevel, number>;
    oldestLog?: number;
    newestLog?: number;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      security: 0,
    };

    this.logs.forEach((log) => {
      byLevel[log.level]++;
    });

    return {
      totalLogs: this.logs.length,
      byLevel,
      oldestLog: this.logs[0]?.timestamp,
      newestLog: this.logs[this.logs.length - 1]?.timestamp,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  updateConfig(config: Partial<UILoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Re-apply console override if changed
    if (config.enableConsoleOverride !== undefined) {
      if (config.enableConsoleOverride) {
        this.overrideConsole();
      } else {
        this.restoreConsole();
      }
    }
  }

  restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
  }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════

export const uiLogger = new UILogger();

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const logDebug = (message: string, context?: Record<string, unknown>): void => {
  uiLogger.debug(message, context);
};

export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  uiLogger.info(message, context);
};

export const logWarn = (message: string, context?: Record<string, unknown>): void => {
  uiLogger.warn(message, context);
};

export const logError = (message: string, error?: Error | unknown, context?: Record<string, unknown>): void => {
  uiLogger.error(message, error, context);
};

export const logSecurity = (message: string, context?: Record<string, unknown>): void => {
  uiLogger.security(message, context);
};

// ═══════════════════════════════════════════════════════════════
// DEV TOOLS (window object for debugging)
// ═══════════════════════════════════════════════════════════════

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__TITANE_UI_LOGGER__ = {
    getLogs: () => uiLogger.getLogs(),
    getStats: () => uiLogger.getStats(),
    clearLogs: () => uiLogger.clearLogs(),
    exportLogs: () => uiLogger.exportLogs(),
    getRecentErrors: (limit?: number) => uiLogger.getRecentErrors(limit),
  };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default uiLogger;
