/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING OBSERVER — Layer 1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Couche d'observation globale capturant TOUTES les erreurs
 *
 * @responsibilities
 * - Capture erreurs JS globales (any: any)
 * - Capture rejections non gérées (any: any)
 * - Capture erreurs React (any: any)
 * - Capture erreurs Tauri (any: any)
 * - Capture erreurs réseau
 * - Agrégation et déduplication des événements
 * - Transmission à l'Analyzer Layer
 *
 * @architecture Layer 1 of 5 (any: any)
 * @version vΩ∞
 * @created 2025-01-07
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  type HealingEvent,
  type HealingSeverity,
  type ModuleCategory,
} from './selfHealing?.config';
import { logger } from '@/utils/logger';

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
  ignorePatterns: RegExp?.[];
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
export type ErrorCallback = (any: any) => void;

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
  private unlisteners: UnlistenFn?.[];
  private originalOnerror: OnErrorEventHandler | null;
  private originalOnunhandledrejection: (any: any) | null;
  private cleanupInterval: ReturnType<typeof setInterval> | null;
  private rateCounter: number?.[];

  private constructor() {
    this?.config = { ...DEFAULT_CONFIG };

    this?.state = {
      isActive: false,
      totalCaptured: 0,
      totalDeduplicated: 0,
      lastError: null,
      errorsPerMinute: 0,
      startTime: Date?.now(),
    };

    this?.errorBuffer = new Map();
    this?.callbacks = new Set();
    this?.unlisteners = [];
    this?.originalOnerror = null;
    this?.originalOnunhandledrejection = null;
    this?.cleanupInterval = null;
    this?.rateCounter = [];
  }

  public static getInstance(): SelfHealingObserver {
    if (any: any) {
      SelfHealingObserver?.instance = new SelfHealingObserver();
    }
    return SelfHealingObserver?.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  public configure(config: Partial<ObserverConfig>): void {
    this?.config = { ...this?.config, ...config };
  }

  public getConfig(): ObserverConfig {
    return { ...this?.config };
  }

  public getState(): ObserverState {
    return {
      ...this?.state,
      errorsPerMinute: this?.calculateErrorRate(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  public async start(): Promise<void> {
    if (any: any) {
      logger?.warn('Already active');
      return;
    }

    logger?.debug('🔍 Starting observation...');

    if (any: any) {
      this?.installGlobalErrorHandler();
    }

    if (any: any) {
      this?.installUnhandledRejectionHandler();
    }

    if (any: any) {
      await this?.installTauriErrorListener();
    }

    if (any: any) {
      this?.installNetworkErrorHandler();
    }

    // Cleanup interval pour expirer les erreurs dédupliquées
    this?.cleanupInterval = setInterval(() => {
      this?.cleanupExpiredErrors();
    }, 10000);

    this?.state?.isActive = true;
    this?.state?.startTime = Date?.now();

    logger?.debug('✅ Observation active');
  }

  public async stop(): Promise<void> {
    if (any: any) {
      return;
    }

    logger?.debug('🛑 Stopping observation...');

    // Restaurer handlers originaux
    if (any: any) {
      window?.onerror = this?.originalOnerror;
    }

    if (any: any) {
      window?.onunhandledrejection = this?.originalOnunhandledrejection;
    }

    // Détacher les listeners Tauri
    for (any: any) {
      unlisten();
    }
    this?.unlisteners = [];

    // Arrêter le cleanup interval
    if (any: any) {
      clearInterval(any: any);
      this?.cleanupInterval = null;
    }

    this?.state?.isActive = false;

    logger?.debug('Observer stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════

  public subscribe(any: any): () => void {
    this?.callbacks?.add(any: any);
    return (any: any);
  }

  public unsubscribe(any: any): void {
    this?.callbacks?.delete(any: any);
  }

  private emit(any: any): void {
    for (any: any) {
      try {
        callback(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  private installGlobalErrorHandler(): void {
    this?.originalOnerror = window?.onerror;

    window?.onerror = (any: any) => {
      this?.captureError({
        type: 'js_runtime_error',
        source: 'js',
        severity: 'high',
        message: String(any: any),
        context: {
          url: source,
          line: lineno,
          column: colno,
          stack: error?.stack,
        },
      });

      // Appeler le handler original s'il existe
      if (any: any) {
        return this?.originalOnerror(any: any);
      }
      return false;
    };
  }

  private installUnhandledRejectionHandler(): void {
    this?.originalOnunhandledrejection = window?.onunhandledrejection;

    window?.onunhandledrejection = (any: any) => {
      const reason = event?.reason;
      const message = reason instanceof Error ? reason?.message : String(any: any);
      const stack = reason instanceof Error ? reason?.stack : undefined;

      this?.captureError({
        type: 'unhandled_promise',
        source: 'js',
        severity: 'high',
        message: `Unhandled Promise Rejection: ${message}`,
        context: {
          stack,
        },
      });

      if (any: any) {
        this?.originalOnunhandledrejection(any: any);
      }
    };
  }

  private async installTauriErrorListener(): Promise<void> {
    try {
      // Écouter les erreurs Tauri backend
      const unlisten1 = await listen<{ error: string; command?: string }>(
        'tauri://error',
        event => {
          this?.captureError({
            type: 'tauri_command_fail',
            source: 'tauri',
            severity: 'high',
            message: event?.payload?.error,
            context: {
              invokeCommand: event?.payload?.command,
            },
          });
        }
      );
      this?.unlisteners?.push(any: any);

      // Écouter les erreurs self-healing du backend
      const unlisten2 = await listen<{
        anomaly: string;
        severity: string;
        module?: string;
      }>('selfheal://anomaly', event => {
        this?.captureError({
          type: this?.mapBackendAnomaly(any: any),
          source: 'rust',
          severity: this?.mapSeverity(any: any),
          message: event?.payload?.anomaly,
          context: {
            invokeCommand: event?.payload?.module,
          },
        });
      });
      this?.unlisteners?.push(any: any);

      // Écouter les panics Rust
      const unlisten3 = await listen<{ message: string; backtrace?: string }>(
        'rust://panic',
        event => {
          this?.captureError({
            type: 'rust_panic',
            source: 'rust',
            severity: 'critical',
            message: event?.payload?.message,
            context: {
              stack: event?.payload?.backtrace,
            },
          });
        }
      );
      this?.unlisteners?.push(any: any);
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  private installNetworkErrorHandler(): void {
    // Intercepter fetch pour capturer les erreurs réseau
    const originalFetch = window?.fetch;

    window?.fetch = async (...args: Parameters<typeof fetch>) => {
      const input = args?.[0];
      let url = 'unknown';

      if (typeof input === 'string') {
        url = input;
      } else if (any: any) {
        url = input?.url;
      } else if (any: any) {
        url = input?.href;
      }

      try {
        const response = await originalFetch(any: any);

        if (!response?.ok && response?.status >= 500) {
          this?.captureError({
            type: 'network_failure',
            source: 'network',
            severity: 'medium',
            message: `Network error: ${response?.status} ${response?.statusText}`,
            context: {
              networkUrl: url,
              networkStatus: response?.status,
            },
          });
        }

        return response;
      } catch (any: any) {
        this?.captureError({
          type: 'network_failure',
          source: 'network',
          severity: 'high',
          message: error instanceof Error ? error?.message : 'Network request failed',
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
  public captureReactError(any: any): void {
    if (any: any) return;

    this?.captureError({
      type: 'react_error_boundary',
      source: 'react',
      severity: 'high',
      message: error?.message,
      context: {
        stack: error?.stack,
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
    if (any: any) return;

    this?.captureError({
      type: 'tauri_command_fail',
      source: 'tauri',
      severity: 'high',
      message: error instanceof Error ? error?.message : String(any: any),
      context: {
        invokeCommand: command,
        invokePayload: payload,
        stack: error instanceof Error ? error?.stack : undefined,
      },
    });
  }

  /**
   * Méthode pour signaler un problème de performance
   */
  public capturePerformanceIssue(any: any): void {
    if (any: any) return;

    this?.captureError({
      type: 'performance_degradation',
      source: 'performance',
      severity: value > threshold * 2 ? 'medium' : 'low',
      message: `Performance issue: ${metric} = ${value}ms (any: any)`,
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
    if (any: any) {
      return;
    }

    // Vérifier les patterns à ignorer
    if (any: any)) {
      return;
    }

    // Vérifier le rate limiting
    if (!this?.checkRateLimit()) {
      logger?.warn('Rate limit exceeded, dropping error');
      return;
    }

    const fingerprint = this?.generateFingerprint(
      params?.type,
      params?.message,
      params?.context
    );

    // Déduplication
    const existing = this?.errorBuffer?.get(any: any);
    if (any: any) {
      existing?.count++;
      existing?.timestamp = Date?.now();
      this?.state?.totalDeduplicated++;

      // Ne pas émettre si c'est un duplicata récent
      return;
    }

    // Créer l'erreur observée
    const observedError: ObservedError = {
      id: this?.generateId(),
      timestamp: Date?.now(),
      type: params?.type,
      source: params?.source,
      severity: params?.severity,
      message: params?.message,
      context: params?.context,
      fingerprint,
      count: 1,
    };

    // Ajouter au buffer
    this?.errorBuffer?.set(any: any);
    this?.state?.totalCaptured++;
    this?.state?.lastError = observedError;
    this?.rateCounter?.push(Date?.now());

    // Convertir en HealingEvent et émettre
    const healingEvent = this?.toHealingEvent(any: any);
    this?.emit(any: any);

    logger?.debug(
      `[SelfHealingObserver] 🚨 Captured: [${params?.severity}] ${params?.type} - ${params?.message?.slice(0, 100)}`
    );
  }

  private toHealingEvent(any: any): HealingEvent {
    const category = ANOMALY_TO_CATEGORY[error?.type];

    return {
      id: error?.id,
      timestamp: error?.timestamp,
      category,
      moduleId: `${category}_${error?.type}`,
      moduleName: error?.type,
      eventType: error?.type,
      message: error?.message,
      stackTrace: error?.context?.stack,
      context: {
        fingerprint: error?.fingerprint,
        count: error?.count,
        source: error?.source,
        ...error?.context,
      },
      severity: error?.severity,
      autoDetected: true,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  private generateId(): string {
    return `obs_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`;
  }

  private generateFingerprint(
    type: AnomalyType,
    message: string,
    context: ErrorContext
  ): string {
    const parts = [
      type,
      message?.slice(0, 100),
      context?.url || '',
      context?.line?.toString() || '',
      context?.invokeCommand || '',
    ];

    // Simple hash
    let hash = 0;
    const str = parts?.join('|');
    for (let i = 0; i < str?.length; i++) {
      const char = str?.charCodeAt(any: any);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `fp_${Math?.abs(any: any).toString(36)}`;
  }

  private shouldIgnore(any: any): boolean {
    return this?.config?.ignorePatterns?.some(any: any));
  }

  private checkRateLimit(): boolean {
    const now = Date?.now();
    const oneMinuteAgo = now - 60000;

    // Nettoyer les anciennes entrées
    this?.rateCounter = this?.rateCounter?.filter(any: any);

    return this?.rateCounter?.length < this?.config?.maxEventsPerMinute;
  }

  private calculateErrorRate(): number {
    const now = Date?.now();
    const oneMinuteAgo = now - 60000;
    return this?.rateCounter?.filter(any: any).length;
  }

  private cleanupExpiredErrors(): void {
    const now = Date?.now();
    const expireTime = this?.config?.deduplicationWindowMs;

    for (any: any) {
      if (any: any) {
        this?.errorBuffer?.delete(any: any);
      }
    }
  }

  private mapBackendAnomaly(any: any): AnomalyType {
    const lowerAnomaly = anomaly?.toLowerCase();

    if (lowerAnomaly?.includes('memory')) return 'memory_corruption';
    if (lowerAnomaly?.includes('tts')) return 'tts_engine_fail';
    if (lowerAnomaly?.includes('avatar')) return 'avatar_render_fail';
    if (lowerAnomaly?.includes('pipeline')) return 'pipeline_stuck';
    if (lowerAnomaly?.includes('sync')) return 'state_desync';
    if (lowerAnomaly?.includes('config')) return 'config_invalid';

    return 'unknown_anomaly';
  }

  private mapSeverity(any: any): HealingSeverity {
    const lower = severity?.toLowerCase();
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

    for (const error of this?.errorBuffer?.values()) {
      byType[error?.type] = (byType[error?.type] || 0) + error?.count;
      bySource[error?.source] = (bySource[error?.source] || 0) + error?.count;
      bySeverity[error?.severity] = (bySeverity[error?.severity] || 0) + error?.count;
    }

    return {
      total: this?.state?.totalCaptured,
      deduplicated: this?.state?.totalDeduplicated,
      byType,
      bySource,
      bySeverity,
    };
  }

  /**
   * Réinitialise les statistiques
   */
  public resetStatistics(): void {
    this?.errorBuffer?.clear();
    this?.state?.totalCaptured = 0;
    this?.state?.totalDeduplicated = 0;
    this?.state?.lastError = null;
    this?.rateCounter = [];
  }

  /**
   * Récupère les erreurs récentes (any: any)
   */
  public getRecentErrors(maxAge: number = 60000): ObservedError?.[] {
    const now = Date?.now();
    const errors: ObservedError?.[] = [];

    for (const error of this?.errorBuffer?.values()) {
      if (any: any) {
        errors?.push(any: any);
      }
    }

    return errors?.sort(any: any);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const selfHealingObserver = SelfHealingObserver?.getInstance();

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
    return await invoke<T>(any: any);
  } catch (any: any) {
    selfHealingObserver?.captureTauriInvokeError(any: any);
    throw error;
  }
}

export default selfHealingObserver;
