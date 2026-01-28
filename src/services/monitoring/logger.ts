/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ — Structured Logger
 * Logger structuré avec niveaux, contexte, et corrélation IDs
 * Sprint 2: Monitoring Avancé (NIVEAU 2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Niveaux de log (ordre croissant de sévérité)
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Entrée de log structurée
 */
export interface LogEntry {
  /** Niveau de log */
  level: LogLevel;
  /** Timestamp ISO 8601 */
  timestamp: string;
  /** Message principal */
  message: string;
  /** Module/composant source (ex: 'ChatIA', 'AIRouter') */
  module: string;
  /** ID de corrélation (pour tracer une requête end-to-end) */
  correlationId?: string;
  /** Contexte additionnel (metadata) */
  context?: Record<string, unknown>;
  /** Stack trace (pour erreurs) */
  stack?: string;
}

/**
 * Configuration du logger
 */
export interface LoggerConfig {
  /** Niveau minimum pour afficher les logs (défaut: INFO) */
  minLevel: LogLevel;
  /** Activer les logs en console (défaut: true) */
  enableConsole: boolean;
  /** Activer la persistence en mémoire (défaut: true, pour debug) */
  enableMemoryBuffer: boolean;
  /** Taille max du buffer mémoire (défaut: 1000) */
  maxBufferSize: number;
}

/**
 * Logger structuré
 * Remplace console.log par un système professionnel avec:
 * - Niveaux de log (debug, info, warn, error)
 * - Contexte structuré (module, correlationId, metadata)
 * - Persistence en mémoire (pour debug/export)
 * - Filtrage par niveau
 */
class StructuredLogger {
  private config: LoggerConfig = {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableMemoryBuffer: true,
    maxBufferSize: 1000,
  };

  /** Buffer mémoire des logs récents */
  private buffer: LogEntry[] = [];

  /**
   * Configure le logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log niveau DEBUG (détails bas niveau)
   */
  debug(message: string, module: string, context?: Record<string, unknown>, correlationId?: string): void {
    this.log(LogLevel.DEBUG, message, module, context, correlationId);
  }

  /**
   * Log niveau INFO (informations générales)
   */
  info(message: string, module: string, context?: Record<string, unknown>, correlationId?: string): void {
    this.log(LogLevel.INFO, message, module, context, correlationId);
  }

  /**
   * Log niveau WARN (avertissements)
   */
  warn(message: string, module: string, context?: Record<string, unknown>, correlationId?: string): void {
    this.log(LogLevel.WARN, message, module, context, correlationId);
  }

  /**
   * Log niveau ERROR (erreurs)
   */
  error(message: string, module: string, error?: Error | unknown, context?: Record<string, unknown>, correlationId?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorContext = {
      ...context,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : String(error),
    };

    this.log(LogLevel.ERROR, message, module, errorContext, correlationId, stack);
  }

  /**
   * Méthode interne de log
   */
  private log(
    level: LogLevel,
    message: string,
    module: string,
    context?: Record<string, unknown>,
    correlationId?: string,
    stack?: string
  ): void {
    // Filtrer par niveau minimum
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      module,
      correlationId,
      context,
      stack,
    };

    // Ajouter au buffer mémoire
    if (this.config.enableMemoryBuffer) {
      this.buffer.push(entry);
      if (this.buffer.length > this.config.maxBufferSize) {
        this.buffer.shift(); // Supprimer le plus ancien
      }
    }

    // Afficher en console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
  }

  /**
   * Affiche un log en console (format lisible)
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const emoji = this.getLevelEmoji(entry.level);
    const color = this.getLevelColor(entry.level);

    // Format: [TIMESTAMP] EMOJI [LEVEL] [MODULE] Message
    const prefix = `[${entry.timestamp}] ${emoji} [${levelName}] [${entry.module}]`;

    // Message principal
    const logArgs: unknown[] = [`%c${prefix}`, `color: ${color}; font-weight: bold`, entry.message];

    // Contexte additionnel (si présent)
    if (entry.correlationId) {
      logArgs.push(`\n  CorrelationID: ${entry.correlationId}`);
    }
    if (entry.context && Object.keys(entry.context).length > 0) {
      logArgs.push('\n  Context:', entry.context);
    }
    if (entry.stack) {
      logArgs.push('\n  Stack:', entry.stack);
    }

    // Choisir la méthode console appropriée
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...logArgs);
        break;
      case LogLevel.INFO:
        console.info(...logArgs);
        break;
      case LogLevel.WARN:
        console.warn(...logArgs);
        break;
      case LogLevel.ERROR:
        console.error(...logArgs);
        break;
    }
  }

  /**
   * Emoji pour chaque niveau
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
    }
  }

  /**
   * Couleur pour chaque niveau (console styling)
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '#888'; // Gris
      case LogLevel.INFO:
        return '#0af'; // Bleu
      case LogLevel.WARN:
        return '#fa0'; // Orange
      case LogLevel.ERROR:
        return '#f00'; // Rouge
    }
  }

  /**
   * Récupère les logs récents du buffer
   */
  getRecentLogs(limit: number = 100, minLevel?: LogLevel): LogEntry[] {
    let logs = this.buffer.slice(-limit);

    // Filtrer par niveau si spécifié
    if (minLevel !== undefined) {
      logs = logs.filter(entry => entry.level >= minLevel);
    }

    return logs;
  }

  /**
   * Exporte les logs en JSON (pour debug/analyse)
   */
  exportLogs(minLevel?: LogLevel): string {
    const logs = this.getRecentLogs(this.config.maxBufferSize, minLevel);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Nettoie le buffer (pour tests uniquement)
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Crée un logger avec contexte pré-configuré (factory)
   * Utile pour modules qui loguent souvent avec le même contexte
   */
  createModuleLogger(module: string, baseContext?: Record<string, unknown>) {
    return {
      debug: (message: string, context?: Record<string, unknown>, correlationId?: string) =>
        this.debug(message, module, { ...baseContext, ...context }, correlationId),
      info: (message: string, context?: Record<string, unknown>, correlationId?: string) =>
        this.info(message, module, { ...baseContext, ...context }, correlationId),
      warn: (message: string, context?: Record<string, unknown>, correlationId?: string) =>
        this.warn(message, module, { ...baseContext, ...context }, correlationId),
      error: (message: string, error?: Error | unknown, context?: Record<string, unknown>, correlationId?: string) =>
        this.error(message, module, error, { ...baseContext, ...context }, correlationId),
    };
  }
}

/**
 * Instance singleton du logger
 */
export const logger = new StructuredLogger();

/**
 * Helper: Génère un correlation ID unique (UUID v4 simplifié)
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook React pour logger dans composants (optionnel)
 */
export function useLogger(module: string, baseContext?: Record<string, unknown>) {
  return logger.createModuleLogger(module, baseContext);
}
