/**
 * TITANE∞ - Console Monitor & Auto-Heal Integration
 *
 * Monitore les logs console, détecte les patterns d'erreurs
 * et intègre automatiquement avec le système Auto-Heal
 */

import { autoHealEngine } from '@/services/ai/autoHealEngine';
import type { AutoHealError } from '@/services/ai/autoHealEngine';
import { createLogger } from '@/utils/logger';
import { predictiveEngine } from './predictiveEngine';

const logger = createLogger('[CONSOLE-MONITOR]');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ConsoleLogEntry {
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'debug' | 'info';
  message: string;
  args: unknown[];
  stack?: string;
}

export interface ConsoleStats {
  totalLogs: number;
  totalWarnings: number;
  totalErrors: number;
  errorRate: number; // Errors per minute
  topErrors: Array<{ message: string; count: number; category: ErrorCategory }>;
  lastError: ConsoleLogEntry | null;
  categoryCounts: Record<ErrorCategory, number>;
  performanceImpact: 'low' | 'medium' | 'high';
  trends: {
    last5min: number;
    last15min: number;
    last60min: number;
  };
}

export type ErrorCategory =
  | 'network'
  | 'memory'
  | 'runtime'
  | 'security'
  | 'performance'
  | 'ui'
  | 'data'
  | 'unknown';

interface ErrorPattern {
  pattern: RegExp | string;
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  // Maps to AutoHealError type via suggested mapping
  suggestedAutoHealType?: AutoHealError['type'];
}

// ═══════════════════════════════════════════════════════════════
// CONSOLE MONITOR CLASS
// ═══════════════════════════════════════════════════════════════

class ConsoleMonitor {
  private originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
  };

  private logs: ConsoleLogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 logs
  private readonly ERROR_THRESHOLD = 10; // Max errors per minute before auto-heal
  private readonly autoHealEnabled = false;

  private errorCounts = new Map<string, number>();
  private isMonitoring = false;
  private isProcessingError = false; // Prevent recursion

  private stats: ConsoleStats = {
    totalLogs: 0,
    totalWarnings: 0,
    totalErrors: 0,
    errorRate: 0,
    topErrors: [],
    lastError: null,
    categoryCounts: {
      network: 0,
      memory: 0,
      runtime: 0,
      security: 0,
      performance: 0,
      ui: 0,
      data: 0,
      unknown: 0,
    },
    performanceImpact: 'low',
    trends: {
      last5min: 0,
      last15min: 0,
      last60min: 0,
    },
  };

  // Pattern avancés avec catégorisation
  private readonly ERROR_PATTERNS: ErrorPattern[] = [
    // Network errors
    {
      pattern: /failed to fetch|network error|ECONNREFUSED|timeout/i,
      category: 'network',
      severity: 'high',
      suggestedAutoHealType: 'network',
    },
    {
      pattern: /cors|cross-origin/i,
      category: 'network',
      severity: 'medium',
      suggestedAutoHealType: 'network',
    },

    // Memory errors
    {
      pattern: /out of memory|heap|allocation failed/i,
      category: 'memory',
      severity: 'critical',
      suggestedAutoHealType: 'memory',
    },
    {
      pattern: /memory leak|excessive memory/i,
      category: 'memory',
      severity: 'high',
      suggestedAutoHealType: 'memory',
    },

    // Runtime errors
    {
      pattern: /uncaught|unhandled rejection/i,
      category: 'runtime',
      severity: 'critical',
      suggestedAutoHealType: 'critical',
    },
    {
      pattern: /cannot read property|undefined is not|null is not/i,
      category: 'runtime',
      severity: 'high',
      suggestedAutoHealType: 'critical',
    },
    {
      pattern: /stack overflow|maximum call stack/i,
      category: 'runtime',
      severity: 'critical',
      suggestedAutoHealType: 'critical',
    },

    // Security errors
    {
      pattern: /xss|injection|unauthorized|forbidden/i,
      category: 'security',
      severity: 'critical',
      suggestedAutoHealType: 'critical',
    },
    {
      pattern: /csrf|invalid token|expired session/i,
      category: 'security',
      severity: 'high',
      suggestedAutoHealType: 'provider',
    },

    // Performance errors
    {
      pattern: /slow|performance|lag|freeze/i,
      category: 'performance',
      severity: 'medium',
      suggestedAutoHealType: 'unknown',
    },
    {
      pattern: /fps drop|jank|stutter/i,
      category: 'performance',
      severity: 'medium',
      suggestedAutoHealType: 'unknown',
    },

    // UI errors
    {
      pattern: /render|hydration|component/i,
      category: 'ui',
      severity: 'medium',
      suggestedAutoHealType: 'validation',
    },
    {
      pattern: /react|vue|dom/i,
      category: 'ui',
      severity: 'low',
      suggestedAutoHealType: 'unknown',
    },

    // Data errors
    {
      pattern: /parse|json|invalid data|schema/i,
      category: 'data',
      severity: 'medium',
      suggestedAutoHealType: 'validation',
    },
    {
      pattern: /validation|type mismatch/i,
      category: 'data',
      severity: 'low',
      suggestedAutoHealType: 'validation',
    },
  ];

  private errorHistory: Array<{ timestamp: number; category: ErrorCategory }> = [];

  /**
   * Démarre le monitoring de la console
   */
  start(): void {
    if (this.isMonitoring) {
      logger.warn('Console monitoring already active');
      return;
    }

    this.isMonitoring = true;

    // Intercept console methods
    console.log = this.intercept('log', this.originalConsole.log);
    console.warn = this.intercept('warn', this.originalConsole.warn);
    console.error = this.intercept('error', this.originalConsole.error);
    console.debug = this.intercept('debug', this.originalConsole.debug);
    console.info = this.intercept('info', this.originalConsole.info);

    // Start periodic cleanup and analysis
    setInterval(() => this.analyzeAndCleanup(), 60000); // Every minute

    logger.info('✅ Console monitoring started');
  }

  /**
   * Arrête le monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
    console.info = this.originalConsole.info;

    this.isMonitoring = false;
    logger.info('Console monitoring stopped');
  }

  /**
   * Intercepte et enregistre les appels console
   */
  private intercept(
    level: ConsoleLogEntry['level'],
    originalMethod: (...args: unknown[]) => void
  ) {
    return (...args: unknown[]) => {
      // Always call original method first
      originalMethod(...args);

      // Skip if monitoring disabled
      if (!this.isMonitoring) return;

      // Record log entry
      const entry: ConsoleLogEntry = {
        timestamp: Date.now(),
        level,
        message: this.formatMessage(args),
        args,
        stack: level === 'error' ? new Error().stack : undefined,
      };

      this.logs.push(entry);
      if (this.logs.length > this.MAX_LOGS) {
        this.logs.shift();
      }

      // Update stats
      this.stats.totalLogs++;
      if (level === 'warn') this.stats.totalWarnings++;
      if (level === 'error') {
        this.stats.totalErrors++;
        this.stats.lastError = entry;
        this.handleError(entry);
      }
    };
  }

  /**
   * Format message from console args
   */
  private formatMessage(args: unknown[]): string {
    return args
      .map(arg => {
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

  /**
   * Handle detected error with advanced categorization
   */
  private handleError(entry: ConsoleLogEntry): void {
    // Prevent infinite recursion in error handling
    if (this.isProcessingError) {
      return;
    }

    // 🛡️ PROTECTION: Ignorer les erreurs du système AUTO-HEAL pour éviter boucle infinie
    if (
      entry.message.includes('[[AUTO-HEAL]]') ||
      entry.message.includes('[AUTO-HEAL]') ||
      entry.message.includes('autoHealEngine') ||
      entry.message.includes('[CONSOLE-MONITOR]')
    ) {
      return; // Skip self-generated errors
    }

    this.isProcessingError = true;
    try {
      // Track error count
      const errorKey = entry.message.substring(0, 100);
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

      // Detect pattern and categorize
      const detection = this.detectErrorPattern(entry.message);

      // Update category counts
      this.stats.categoryCounts[detection.category]++;

      // Track error history for trends
      this.errorHistory.push({
        timestamp: entry.timestamp,
        category: detection.category,
      });

      // Feed to predictive engine for ML-like analysis
      predictiveEngine.recordError(entry, detection.category);

      // Auto-heal integration for critical/high severity errors
      // BUT: Don't call autoHealEngine if it would create more logs
      // (for now, skip auto-heal to prevent recursion)
      if (
        this.autoHealEnabled &&
        (detection.severity === 'critical' || detection.severity === 'high')
      ) {
        // Disabled to prevent recursion
        const autoHealType =
          detection.suggestedAutoHealType ||
          this.mapCategoryToAutoHealType(detection.category);

        autoHealEngine.heal('console', new Error(entry.message), autoHealType, {
          stack: entry.stack,
          args: entry.args,
          timestamp: entry.timestamp,
          category: detection.category,
          severity: detection.severity,
        });
      }
    } finally {
      this.isProcessingError = false;
    }
  }

  /**
   * Map ErrorCategory to AutoHealError type
   */
  private mapCategoryToAutoHealType(
    category: ErrorCategory
  ):
    | 'provider'
    | 'network'
    | 'memory'
    | 'validation'
    | 'timeout'
    | 'critical'
    | 'unknown' {
    switch (category) {
      case 'network':
        return 'network';
      case 'memory':
        return 'memory';
      case 'runtime':
      case 'security':
        return 'critical';
      case 'data':
        return 'validation';
      case 'performance':
        return 'timeout';
      case 'ui':
      case 'unknown':
      default:
        return 'unknown';
    }
  }

  /**
   * Detect error patterns with category and severity
   */
  private detectErrorPattern(message: string): {
    isCritical: boolean;
    category: ErrorCategory;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedAutoHealType?: AutoHealError['type'];
  } {
    const lowerMessage = message.toLowerCase();

    // Check against advanced patterns
    for (const pattern of this.ERROR_PATTERNS) {
      const regex =
        typeof pattern.pattern === 'string'
          ? new RegExp(pattern.pattern, 'i')
          : pattern.pattern;

      if (regex.test(lowerMessage)) {
        return {
          isCritical: pattern.severity === 'critical',
          category: pattern.category,
          severity: pattern.severity,
          suggestedAutoHealType: pattern.suggestedAutoHealType,
        };
      }
    }

    // Fallback: check legacy critical patterns
    const criticalPatterns = ['critical', 'fatal', 'crash'];
    const isCritical = criticalPatterns.some(p => lowerMessage.includes(p));

    return {
      isCritical,
      category: 'unknown',
      severity: isCritical ? 'critical' : 'low',
      suggestedAutoHealType: isCritical ? 'critical' : 'unknown',
    };
  }

  /**
   * Analyze logs and cleanup old entries
   */
  private analyzeAndCleanup(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 5 * 60000;
    const fifteenMinutesAgo = now - 15 * 60000;
    const sixtyMinutesAgo = now - 60 * 60000;

    // Calculate error rate (errors per minute)
    const recentErrors = this.logs.filter(
      log => log.level === 'error' && log.timestamp > oneMinuteAgo
    );
    this.stats.errorRate = recentErrors.length;

    // Calculate error trends
    this.stats.trends = {
      last5min: this.errorHistory.filter(e => e.timestamp > fiveMinutesAgo).length,
      last15min: this.errorHistory.filter(e => e.timestamp > fifteenMinutesAgo).length,
      last60min: this.errorHistory.filter(e => e.timestamp > sixtyMinutesAgo).length,
    };

    // Calculate performance impact based on error rate and category
    const criticalCount =
      this.stats.categoryCounts.memory +
      this.stats.categoryCounts.runtime +
      this.stats.categoryCounts.security;
    if (criticalCount > 5 || this.stats.errorRate > 20) {
      this.stats.performanceImpact = 'high';
    } else if (criticalCount > 2 || this.stats.errorRate > 10) {
      this.stats.performanceImpact = 'medium';
    } else {
      this.stats.performanceImpact = 'low';
    }

    // Calculate top errors with category
    const errorCounts = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => {
        const detection = this.detectErrorPattern(message);
        return { message, count, category: detection.category };
      });
    this.stats.topErrors = errorCounts;

    // Trigger auto-heal if error rate too high
    if (this.stats.errorRate >= this.ERROR_THRESHOLD) {
      logger.warn(
        `⚠️ High error rate detected: ${this.stats.errorRate} errors/min (threshold: ${this.ERROR_THRESHOLD})`
      );

      autoHealEngine.heal(
        'console',
        new Error(`High error rate: ${this.stats.errorRate} errors/min`),
        'critical',
        {
          errorRate: this.stats.errorRate,
          topErrors: this.stats.topErrors,
          performanceImpact: this.stats.performanceImpact,
        }
      );
    }

    // Cleanup old error counts
    const recentErrorKeys = new Set(recentErrors.map(e => e.message.substring(0, 100)));
    for (const [key] of this.errorCounts) {
      if (!recentErrorKeys.has(key)) {
        this.errorCounts.delete(key);
      }
    }

    // Cleanup old error history (keep last 60 minutes)
    this.errorHistory = this.errorHistory.filter(e => e.timestamp > sixtyMinutesAgo);
  }

  /**
   * Get current statistics
   */
  getStats(): ConsoleStats {
    return { ...this.stats };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100): ConsoleLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get errors only
   */
  getErrors(limit = 50): ConsoleLogEntry[] {
    return this.logs.filter(log => log.level === 'error').slice(-limit);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.errorCounts.clear();
    this.errorHistory = [];
    this.stats = {
      totalLogs: 0,
      totalWarnings: 0,
      totalErrors: 0,
      errorRate: 0,
      topErrors: [],
      lastError: null,
      categoryCounts: {
        network: 0,
        memory: 0,
        runtime: 0,
        security: 0,
        performance: 0,
        ui: 0,
        data: 0,
        unknown: 0,
      },
      performanceImpact: 'low',
      trends: {
        last5min: 0,
        last15min: 0,
        last60min: 0,
      },
    };
    logger.info('Console logs cleared');
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════

export const consoleMonitor = new ConsoleMonitor();

// Initialize on first use (lazy load to avoid boot loops)
let isInitialized = false;

export function initializeConsoleMonitor(): void {
  if (isInitialized) return;
  if (typeof window === 'undefined') return; // Skip in SSR

  isInitialized = true;
  // Console monitoring disabled in this session to prevent infinite loops
  // Monitoring will be re-enabled in future versions with better recursion protection
}
