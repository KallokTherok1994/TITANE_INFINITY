/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING OBSERVER — Layer 1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Couche d'observation globale capturant TOUTES les erreurs
 *
 * @responsibilities
 * - Capture erreurs JS globales (window.onerror)
 * - Capture rejections non gérées (unhandledrejection)
 * - Capture erreurs React (Error Boundaries)
 * - Capture erreurs Tauri (invoke failures)
 * - Capture erreurs réseau
 * - Agrégation et déduplication des événements
 * - Transmission à l'Analyzer Layer
 *
 * @architecture Layer 1 of 5 (Observer → Analyzer → Playbook → Executor → Sync)
 * @version vΩ∞
 * @created 2025-01-07
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  type HealingEvent,
  type HealingSeverity,
  type ModuleCategory,
} from './selfHealing.config';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES LOCAUX OBSERVER
// ═══════════════════════════════════════════════════════════════════════════

/** Type d'anomalie détectée par l'Observer */
export type AnomalyType =
  | 'js_runtime_error'
  | 'unhandled_promise'
  | 'react_error_boundary'
  | 'tauri_command_fail'
  | 'rust_panic'
  | 'network_failure'
  | 'performance_degradation'
  | 'memory_corruption'
  | 'tts_engine_fail'
  | 'avatar_render_fail'
  | 'pipeline_stuck'
  | 'state_desync'
  | 'config_invalid'
  | 'unknown_anomaly';

/** Source de l'erreur */
export type HealingSource = 'js' | 'react' | 'tauri' | 'rust' | 'network' | 'performance';

/** Configuration de l'Observer */
export interface ObserverConfig {
  enabled: boolean;
  captureGlobalErrors: boolean;
  captureUnhandledRejections: boolean;
  captureReactErrors: boolean;
  captureTauriErrors: boolean;
  captureNetworkErrors: boolean;
  capturePerformanceIssues: boolean;
  deduplicationWindowMs: number;
  maxEventsPerMinute: number;
  ignorePatterns: RegExp[];
}

/** Contexte d'une erreur capturée */
export interface ErrorContext {
  url?: string;
  line?: number;
  column?: number;
  stack?: string;
  componentStack?: string;
  invokeCommand?: string;
  invokePayload?: unknown;
  networkUrl?: string;
  networkStatus?: number;
  performanceMetric?: string;
  performanceValue?: number;
}

/** Erreur observée avec métadonnées */
export interface ObservedError {
  id: string;
  timestamp: number;
  type: AnomalyType;
  source: HealingSource;
  severity: HealingSeverity;
  message: string;
  context: ErrorContext;
  fingerprint: string;
  count: number;
}

/** État de l'Observer */
export interface ObserverState {
  isActive: boolean;
  totalCaptured: number;
  totalDeduplicated: number;
  lastError: ObservedError | null;
  errorsPerMinute: number;
  startTime: number;
}

/** Callback pour recevoir les événements */
export type ErrorCallback = (event: HealingEvent) => void;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ObserverConfig = {
  enabled: true,
  captureGlobalErrors: true,
  captureUnhandledRejections: true,
  captureReactErrors: true,
  captureTauriErrors: true,
  captureNetworkErrors: true,
  capturePerformanceIssues: true,
  deduplicationWindowMs: 5000,
  maxEventsPerMinute: 100,
  ignorePatterns: [
    /ResizeObserver loop/i,
    /Loading chunk \d+ failed/i,
    /^Script error\.?$/i,
  ],
};

/** Mapping anomaly type vers catégorie de module */
const ANOMALY_TO_CATEGORY: Record<AnomalyType, ModuleCategory> = {
  js_runtime_error: 'react',
  unhandled_promise: 'react',
  react_error_boundary: 'react',
  tauri_command_fail: 'tauri',
  rust_panic: 'tauri',
  network_failure: 'network',
  performance_degradation: 'performance',
  memory_corruption: 'memory',
  tts_engine_fail: 'tts',
  avatar_render_fail: 'react',
  pipeline_stuck: 'ia',
  state_desync: 'tauri',
  config_invalid: 'io',
  unknown_anomaly: 'react',
};

/** Mapping niveau de sévérité */
const SEVERITY_MAP: Record<string, HealingSeverity> = {
  fatal: 'critical',
  critical: 'critical',
  error: 'high',
  warning: 'medium',
  info: 'info',
  low: 'low',
};

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class SelfHealingObserver {
  private static instance: SelfHealingObserver;

  private config: ObserverConfig;
  private state: ObserverState;
  private errorBuffer: Map<string, ObservedError>;
  private callbacks: Set<ErrorCallback>;
  private unlisteners: UnlistenFn[];
  private originalOnerror: OnErrorEventHandler | null;
  private originalOnunhandledrejection: ((event: PromiseRejectionEvent) => void) | null;
  private cleanupInterval: ReturnType<typeof setInterval> | null;
  private rateCounter: number[];

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };

    this.state = {
      isActive: false,
      totalCaptured: 0,
      totalDeduplicated: 0,
      lastError: null,
      errorsPerMinute: 0,
      startTime: Date.now(),
    };

    this.errorBuffer = new Map();
    this.callbacks = new Set();
    this.unlisteners = [];
    this.originalOnerror = null;
    this.originalOnunhandledrejection = null;
    this.cleanupInterval = null;
    this.rateCounter = [];
  }

  public static getInstance(): SelfHealingObserver {
    if (!SelfHealingObserver.instance) {
      SelfHealingObserver.instance = new SelfHealingObserver();
    }
    return SelfHealingObserver.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<ObserverConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ObserverConfig {
    return { ...this.config };
  }

  public getState(): ObserverState {
    return {
      ...this.state,
      errorsPerMinute: this.calculateErrorRate(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  public async start(): Promise<void> {
    if (this.state.isActive) {
      console.warn('[SelfHealingObserver] Already active');
      return;
    }

    console.log('[SelfHealingObserver] 🔍 Starting observation...');

    if (this.config.captureGlobalErrors) {
      this.installGlobalErrorHandler();
    }

    if (this.config.captureUnhandledRejections) {
      this.installUnhandledRejectionHandler();
    }

    if (this.config.captureTauriErrors) {
      await this.installTauriErrorListener();
    }

    if (this.config.captureNetworkErrors) {
      this.installNetworkErrorHandler();
    }

    // Cleanup interval pour expirer les erreurs dédupliquées
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredErrors();
    }, 10000);

    this.state.isActive = true;
    this.state.startTime = Date.now();

    console.log('[SelfHealingObserver] ✅ Observation active');
  }

  public async stop(): Promise<void> {
    if (!this.state.isActive) {
      return;
    }

    console.log('[SelfHealingObserver] 🛑 Stopping observation...');

    // Restaurer handlers originaux
    if (this.originalOnerror !== null) {
      window.onerror = this.originalOnerror;
    }

    if (this.originalOnunhandledrejection !== null) {
      window.onunhandledrejection = this.originalOnunhandledrejection;
    }

    // Détacher les listeners Tauri
    for (const unlisten of this.unlisteners) {
      unlisten();
    }
    this.unlisteners = [];

    // Arrêter le cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.state.isActive = false;

    console.log('[SelfHealingObserver] Observer stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════

  public subscribe(callback: ErrorCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public unsubscribe(callback: ErrorCallback): void {
    this.callbacks.delete(callback);
  }

  private emit(event: HealingEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (err) {
        console.error('[SelfHealingObserver] Callback error:', err);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private installGlobalErrorHandler(): void {
    this.originalOnerror = window.onerror;

    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        type: 'js_runtime_error',
        source: 'js',
        severity: 'high',
        message: String(message),
        context: {
          url: source,
          line: lineno,
          column: colno,
          stack: error?.stack,
        },
      });

      // Appeler le handler original s'il existe
      if (this.originalOnerror) {
        return this.originalOnerror(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  private installUnhandledRejectionHandler(): void {
    this.originalOnunhandledrejection = window.onunhandledrejection;

    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;

      this.captureError({
        type: 'unhandled_promise',
        source: 'js',
        severity: 'high',
        message: `Unhandled Promise Rejection: ${message}`,
        context: {
          stack,
        },
      });

      if (this.originalOnunhandledrejection) {
        this.originalOnunhandledrejection(event);
      }
    };
  }

  private async installTauriErrorListener(): Promise<void> {
    try {
      // Écouter les erreurs Tauri backend
      const unlisten1 = await listen<{ error: string; command?: string }>(
        'tauri://error',
        event => {
          this.captureError({
            type: 'tauri_command_fail',
            source: 'tauri',
            severity: 'high',
            message: event.payload.error,
            context: {
              invokeCommand: event.payload.command,
            },
          });
        }
      );
      this.unlisteners.push(unlisten1);

      // Écouter les erreurs self-healing du backend
      const unlisten2 = await listen<{
        anomaly: string;
        severity: string;
        module?: string;
      }>('selfheal://anomaly', event => {
        this.captureError({
          type: this.mapBackendAnomaly(event.payload.anomaly),
          source: 'rust',
          severity: this.mapSeverity(event.payload.severity),
          message: event.payload.anomaly,
          context: {
            invokeCommand: event.payload.module,
          },
        });
      });
      this.unlisteners.push(unlisten2);

      // Écouter les panics Rust
      const unlisten3 = await listen<{ message: string; backtrace?: string }>(
        'rust://panic',
        event => {
          this.captureError({
            type: 'rust_panic',
            source: 'rust',
            severity: 'critical',
            message: event.payload.message,
            context: {
              stack: event.payload.backtrace,
            },
          });
        }
      );
      this.unlisteners.push(unlisten3);
    } catch (err) {
      console.warn('[SelfHealingObserver] Could not install Tauri listeners:', err);
    }
  }

  private installNetworkErrorHandler(): void {
    // Intercepter fetch pour capturer les erreurs réseau
    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const input = args[0];
      let url = 'unknown';

      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.href;
      }

      try {
        const response = await originalFetch(...args);

        if (!response.ok && response.status >= 500) {
          this.captureError({
            type: 'network_failure',
            source: 'network',
            severity: 'medium',
            message: `Network error: ${response.status} ${response.statusText}`,
            context: {
              networkUrl: url,
              networkStatus: response.status,
            },
          });
        }

        return response;
      } catch (error) {
        this.captureError({
          type: 'network_failure',
          source: 'network',
          severity: 'high',
          message: error instanceof Error ? error.message : 'Network request failed',
          context: {
            networkUrl: url,
          },
        });
        throw error;
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REACT ERROR BOUNDARY INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Méthode à appeler depuis un React Error Boundary
   */
  public captureReactError(error: Error, componentStack: string): void {
    if (!this.config.captureReactErrors) return;

    this.captureError({
      type: 'react_error_boundary',
      source: 'react',
      severity: 'high',
      message: error.message,
      context: {
        stack: error.stack,
        componentStack,
      },
    });
  }

  /**
   * Méthode à appeler lors d'un échec d'invoke Tauri
   */
  public captureTauriInvokeError(
    command: string,
    error: unknown,
    payload?: unknown
  ): void {
    if (!this.config.captureTauriErrors) return;

    this.captureError({
      type: 'tauri_command_fail',
      source: 'tauri',
      severity: 'high',
      message: error instanceof Error ? error.message : String(error),
      context: {
        invokeCommand: command,
        invokePayload: payload,
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }

  /**
   * Méthode pour signaler un problème de performance
   */
  public capturePerformanceIssue(metric: string, value: number, threshold: number): void {
    if (!this.config.capturePerformanceIssues) return;

    this.captureError({
      type: 'performance_degradation',
      source: 'performance',
      severity: value > threshold * 2 ? 'medium' : 'low',
      message: `Performance issue: ${metric} = ${value}ms (threshold: ${threshold}ms)`,
      context: {
        performanceMetric: metric,
        performanceValue: value,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE CAPTURE LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  private captureError(params: {
    type: AnomalyType;
    source: HealingSource;
    severity: HealingSeverity;
    message: string;
    context: ErrorContext;
  }): void {
    if (!this.config.enabled || !this.state.isActive) {
      return;
    }

    // Vérifier les patterns à ignorer
    if (this.shouldIgnore(params.message)) {
      return;
    }

    // Vérifier le rate limiting
    if (!this.checkRateLimit()) {
      console.warn('[SelfHealingObserver] Rate limit exceeded, dropping error');
      return;
    }

    const fingerprint = this.generateFingerprint(
      params.type,
      params.message,
      params.context
    );

    // Déduplication
    const existing = this.errorBuffer.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
      this.state.totalDeduplicated++;

      // Ne pas émettre si c'est un duplicata récent
      return;
    }

    // Créer l'erreur observée
    const observedError: ObservedError = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: params.type,
      source: params.source,
      severity: params.severity,
      message: params.message,
      context: params.context,
      fingerprint,
      count: 1,
    };

    // Ajouter au buffer
    this.errorBuffer.set(fingerprint, observedError);
    this.state.totalCaptured++;
    this.state.lastError = observedError;
    this.rateCounter.push(Date.now());

    // Convertir en HealingEvent et émettre
    const healingEvent = this.toHealingEvent(observedError);
    this.emit(healingEvent);

    console.log(
      `[SelfHealingObserver] 🚨 Captured: [${params.severity}] ${params.type} - ${params.message.slice(0, 100)}`
    );
  }

  private toHealingEvent(error: ObservedError): HealingEvent {
    const category = ANOMALY_TO_CATEGORY[error.type];

    return {
      id: error.id,
      timestamp: error.timestamp,
      category,
      moduleId: `${category}_${error.type}`,
      moduleName: error.type,
      eventType: error.type,
      message: error.message,
      stackTrace: error.context.stack,
      context: {
        fingerprint: error.fingerprint,
        count: error.count,
        source: error.source,
        ...error.context,
      },
      severity: error.severity,
      autoDetected: true,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private generateId(): string {
    return `obs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateFingerprint(
    type: AnomalyType,
    message: string,
    context: ErrorContext
  ): string {
    const parts = [
      type,
      message.slice(0, 100),
      context.url || '',
      context.line?.toString() || '',
      context.invokeCommand || '',
    ];

    // Simple hash
    let hash = 0;
    const str = parts.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `fp_${Math.abs(hash).toString(36)}`;
  }

  private shouldIgnore(message: string): boolean {
    return this.config.ignorePatterns.some(pattern => pattern.test(message));
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Nettoyer les anciennes entrées
    this.rateCounter = this.rateCounter.filter(t => t > oneMinuteAgo);

    return this.rateCounter.length < this.config.maxEventsPerMinute;
  }

  private calculateErrorRate(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    return this.rateCounter.filter(t => t > oneMinuteAgo).length;
  }

  private cleanupExpiredErrors(): void {
    const now = Date.now();
    const expireTime = this.config.deduplicationWindowMs;

    for (const [fingerprint, error] of this.errorBuffer) {
      if (now - error.timestamp > expireTime) {
        this.errorBuffer.delete(fingerprint);
      }
    }
  }

  private mapBackendAnomaly(anomaly: string): AnomalyType {
    const lowerAnomaly = anomaly.toLowerCase();

    if (lowerAnomaly.includes('memory')) return 'memory_corruption';
    if (lowerAnomaly.includes('tts')) return 'tts_engine_fail';
    if (lowerAnomaly.includes('avatar')) return 'avatar_render_fail';
    if (lowerAnomaly.includes('pipeline')) return 'pipeline_stuck';
    if (lowerAnomaly.includes('sync')) return 'state_desync';
    if (lowerAnomaly.includes('config')) return 'config_invalid';

    return 'unknown_anomaly';
  }

  private mapSeverity(severity: string): HealingSeverity {
    const lower = severity.toLowerCase();
    return SEVERITY_MAP[lower] || 'info';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  public getStatistics(): {
    total: number;
    deduplicated: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const error of this.errorBuffer.values()) {
      byType[error.type] = (byType[error.type] || 0) + error.count;
      bySource[error.source] = (bySource[error.source] || 0) + error.count;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + error.count;
    }

    return {
      total: this.state.totalCaptured,
      deduplicated: this.state.totalDeduplicated,
      byType,
      bySource,
      bySeverity,
    };
  }

  /**
   * Réinitialise les statistiques
   */
  public resetStatistics(): void {
    this.errorBuffer.clear();
    this.state.totalCaptured = 0;
    this.state.totalDeduplicated = 0;
    this.state.lastError = null;
    this.rateCounter = [];
  }

  /**
   * Récupère les erreurs récentes (pour l'Analyzer)
   */
  public getRecentErrors(maxAge: number = 60000): ObservedError[] {
    const now = Date.now();
    const errors: ObservedError[] = [];

    for (const error of this.errorBuffer.values()) {
      if (now - error.timestamp <= maxAge) {
        errors.push(error);
      }
    }

    return errors.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingObserver = SelfHealingObserver.getInstance();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper pour invoke Tauri avec capture d'erreurs automatique
 */
export async function observedInvoke<T>(
  command: string,
  payload?: Record<string, unknown>
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');

  try {
    return await invoke<T>(command, payload);
  } catch (error) {
    selfHealingObserver.captureTauriInvokeError(command, error, payload);
    throw error;
  }
}

export default selfHealingObserver;
