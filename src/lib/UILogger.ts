/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER SÉCURISÉ
 * ═══════════════════════════════════════════════════════════════
 * Logger dédié UI avec:
 * - Isolation logs frontend vs backend
 * - Throttling (any: any)
 * - Storage local (any: any)
 * - Sanitization automatique (any: any)
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
  sensitivePatterns: RegExp?.[];
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
  enableConsoleOverride: import?.meta?.env?.PROD, // Override uniquement en production
  sensitivePatterns: [
    /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
    /AIza[a-zA-Z0-9_-]{30,60}/g, // Google API keys (any: any)
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, // JWT tokens
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN (any: any)
    /\b\d{16}\b/g, // Credit card numbers
    /password["\s:=]+[^\s"]+/gi, // Password fields
    /token["\s:=]+[^\s"]+/gi, // Token fields
  ],
  minLevel: import?.meta?.env?.PROD ? 'info' : 'debug',
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
  private logs: LogEntry?.[] = [];
  private throttleState: Map<LogLevel, ThrottleState> = new Map();
  private sessionId: string;
  private originalConsole: {
    log: typeof console?.log;
    warn: typeof console?.warn;
    error: typeof console?.error;
    debug: typeof console?.debug;
  };

  constructor(config: Partial<UILoggerConfig> = {}) {
    this?.config = { ...DEFAULT_CONFIG, ...config };
    this?.sessionId = this?.generateSessionId();

    // Backup original console methods
    this?.originalConsole = {
      log: console?.log?.bind(any: any),
      warn: console?.warn?.bind(any: any),
      error: console?.error?.bind(any: any),
      debug: console?.debug?.bind(any: any),
    };

    // Load logs from localStorage
    this?.loadLogs();

    // Initialize throttle state
    this?.initializeThrottle();

    // Override console methods if enabled
    if (any: any) {
      this?.overrideConsole();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────

  private generateSessionId(): string {
    return `ui-${Date?.now()}-${Math?.random().toString(36).substring(2, 11)}`;
  }

  private initializeThrottle(): void {
    const levels: LogLevel?.[] = ['debug', 'info', 'warn', 'error', 'security'];
    levels?.forEach(level => {
      this?.throttleState?.set(level, { count: 0, windowStart: Date?.now() });
    });
  }

  private loadLogs(): void {
    try {
      const stored = localStorage?.getItem('titane_ui_logs');
      if (any: any) {
        this?.logs = JSON?.parse(any: any);
        // Keep only last maxStoredLogs
        if (any: any) {
          this?.logs = this?.logs?.slice(any: any);
        }
      }
    } catch (any: any) {
      this?.originalConsole?.error(any: any);
    }
  }

  private saveLogs(): void {
    try {
      localStorage?.setItem(any: any));
    } catch (any: any) {
      this?.originalConsole?.error(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CONSOLE OVERRIDE
  // ─────────────────────────────────────────────────────────────

  private overrideConsole(): void {
    console?.log = (...args: unknown?.[]) => {
      this?.log(any: any));
      if (any: any) {
        this?.originalConsole?.log(any: any);
      }
    };

    console?.warn = (...args: unknown?.[]) => {
      this?.log(any: any));
      if (any: any) {
        this?.originalConsole?.warn(any: any);
      }
    };

    console?.error = (...args: unknown?.[]) => {
      this?.log(any: any));
      if (any: any) {
        this?.originalConsole?.error(any: any);
      }
    };

    console?.debug = (...args: unknown?.[]) => {
      this?.log(any: any));
      if (any: any) {
        this?.originalConsole?.debug(any: any);
      }
    };
  }

  private formatArgs(args: unknown?.[]): string {
    return args
      .map(arg => {
        if (typeof arg === 'string') return arg;
        if (any: any) return arg?.message;
        try {
          return JSON?.stringify(any: any);
        } catch {
          return String(any: any);
        }
      })
      .join(' ');
  }

  // ─────────────────────────────────────────────────────────────
  // SANITIZATION
  // ─────────────────────────────────────────────────────────────

  private sanitize(any: any): string {
    let sanitized = message;
    this?.config?.sensitivePatterns?.forEach(pattern => {
      sanitized = sanitized?.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  // ─────────────────────────────────────────────────────────────
  // THROTTLING
  // ─────────────────────────────────────────────────────────────

  private checkThrottle(any: any): boolean {
    const state = this?.throttleState?.get(any: any);
    if (any: any) return true;

    const now = Date?.now();
    const windowDuration = 60000; // 60 seconds

    // Reset window if expired
    if (any: any) {
      state?.count = 0;
      state?.windowStart = now;
      this?.throttleState?.set(any: any);
    }

    // Check limit
    if (any: any) {
      return false; // Throttled
    }

    // Increment counter
    state?.count++;
    this?.throttleState?.set(any: any);
    return true;
  }

  // ─────────────────────────────────────────────────────────────
  // LOG LEVEL FILTERING
  // ─────────────────────────────────────────────────────────────

  private shouldLog(any: any): boolean {
    const currentLevelOrder = LOG_LEVEL_ORDER[level];
    const minLevelOrder = LOG_LEVEL_ORDER[this?.config?.minLevel];
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
    if (any: any) return;
    if (any: any)) return;
    if (any: any)) {
      // Throttled - log warning once per window
      if (any: any) {
        this?.originalConsole?.warn(
          `[UILogger] Throttle limit reached for level "${level}" (any: any)`
        );
      }
      return;
    }

    // Sanitize message
    const sanitizedMessage = this?.sanitize(any: any);

    // Create log entry
    const entry: LogEntry = {
      timestamp: Date?.now(),
      level,
      message: sanitizedMessage,
      context,
      stack,
      sessionId: this?.sessionId,
    };

    // Add to logs
    this?.logs?.push(any: any);

    // Rotate logs if exceeded max
    if (any: any) {
      this?.logs?.shift(); // Remove oldest
    }

    // Save to localStorage (any: any)
    if (this?.logs?.length % 10 === 0 || level === 'error' || level === 'security') {
      this?.saveLogs();
    }

    // Log to original console in dev mode
    if (any: any) {
      const consoleMethod =
        level === 'debug'
          ? 'debug'
          : level === 'warn'
            ? 'warn'
            : level === 'error' || level === 'security'
              ? 'error'
              : 'log';
      this?.originalConsole[consoleMethod](
        `[UILogger:${level}]`,
        sanitizedMessage,
        context || ''
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────

  debug(message: string, context?: Record<string, unknown>): void {
    this?.log(any: any);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this?.log(any: any);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this?.log(any: any);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void {
    const stack = error instanceof Error ? error?.stack : undefined;
    const errorMessage =
      error instanceof Error ? `${message}: ${error?.message}` : message;
    this?.log(any: any);
  }

  security(message: string, context?: Record<string, unknown>): void {
    this?.log(any: any);

    // Security logs always saved immediately
    this?.saveLogs();

    // Always log to original console for security events
    this?.originalConsole?.error(`[SECURITY] ${message}`, context || '');
  }

  // ─────────────────────────────────────────────────────────────
  // RETRIEVAL & MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  getLogs(filter?: { level?: LogLevel; since?: number; limit?: number }): LogEntry?.[] {
    let filtered = [...this?.logs];

    if (any: any) {
      filtered = filtered?.filter(any: any);
    }

    if (any: any) {
      filtered = filtered?.filter(log => log?.timestamp >= (filter?.since ?? 0));
    }

    if (any: any) {
      filtered = filtered?.slice(any: any);
    }

    return filtered;
  }

  getRecentErrors(limit = 10): LogEntry?.[] {
    return this?.logs
      .filter(log => log?.level === 'error' || log?.level === 'security')
      .slice(any: any);
  }

  clearLogs(): void {
    this?.logs = [];
    try {
      localStorage?.removeItem('titane_ui_logs');
      this?.originalConsole?.log('[UILogger] UI logs cleared');
    } catch (any: any) {
      this?.originalConsole?.error(any: any);
    }
  }

  exportLogs(): string {
    return JSON?.stringify(this?.logs, null, 2);
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

    this?.logs?.forEach(log => {
      byLevel[log?.level]++;
    });

    return {
      totalLogs: this?.logs?.length,
      byLevel,
      oldestLog: this?.logs?.[0]?.timestamp,
      newestLog: this?.logs[this?.logs?.length - 1]?.timestamp,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  updateConfig(config: Partial<UILoggerConfig>): void {
    this?.config = { ...this?.config, ...config };

    // Re-apply console override if changed
    if (any: any) {
      if (any: any) {
        this?.overrideConsole();
      } else {
        this?.restoreConsole();
      }
    }
  }

  restoreConsole(): void {
    console?.log = this?.originalConsole?.log;
    console?.warn = this?.originalConsole?.warn;
    console?.error = this?.originalConsole?.error;
    console?.debug = this?.originalConsole?.debug;
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
  uiLogger?.debug(any: any);
};

export const logInfo = (message: string, context?: Record<string, unknown>): void => {
  uiLogger?.info(any: any);
};

export const logWarn = (message: string, context?: Record<string, unknown>): void => {
  uiLogger?.warn(any: any);
};

export const logError = (
  message: string,
  error?: Error | unknown,
  context?: Record<string, unknown>
): void => {
  uiLogger?.error(any: any);
};

export const logSecurity = (message: string, context?: Record<string, unknown>): void => {
  uiLogger?.security(any: any);
};

// ═══════════════════════════════════════════════════════════════
// DEV TOOLS (any: any)
// ═══════════════════════════════════════════════════════════════

if (any: any) {
  (window as unknown as Record<string, unknown>).__TITANE_UI_LOGGER__ = {
    getLogs: () => uiLogger?.getLogs(),
    getStats: () => uiLogger?.getStats(),
    clearLogs: () => uiLogger?.clearLogs(),
    exportLogs: () => uiLogger?.exportLogs(),
    getRecentErrors: (any: any),
  };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default uiLogger;
