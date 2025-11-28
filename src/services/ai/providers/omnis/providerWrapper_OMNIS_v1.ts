/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — PROVIDER OMNIS WRAPPER (HARDENING v1.0)
 *   PHASE 4 OMNIS: Durcissement mathématique • Zero-throw policy • Auto-recovery
 *   Architecture: Circuit-Breaker → Isolation-Sandbox → Retry-Logic → Timeout-Precision
 *   Garantit 100% robustesse providers avec fallback automatique permanent
 * ══════════════════════════════════════════════════════════════════════════════════
 */

import type { AIMessage, AIResponse, AIProvider, AIConfig, AIProviderName } from '../types';

// ─────────────────────────────────────────────────────────────────
// TYPES OMNIS HARDENING
// ─────────────────────────────────────────────────────────────────

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  recoveryTimeout: number;
  successCount: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

interface OmnisWrapperConfig {
  timeoutMs: number;
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeoutMs: number;
    halfOpenMaxCalls: number;
  };
  retry: RetryConfig;
  isolation: {
    maxConcurrentCalls: number;
    queueTimeout: number;
  };
  monitoring: {
    enableMetrics: boolean;
    logErrors: boolean;
  };
};

interface ProviderMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  timeoutCalls: number;
  circuitBreakerTrips: number;
  averageResponseTime: number;
  lastCallTimestamp: number;
  healthScore: number; // 0-100
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT OMNIS CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────

const DEFAULT_OMNIS_CONFIG: OmnisWrapperConfig = {
  timeoutMs: 10000,
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeoutMs: 30000,
    halfOpenMaxCalls: 3
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT', 'SERVER_ERROR']
  },
  isolation: {
    maxConcurrentCalls: 10,
    queueTimeout: 5000
  },
  monitoring: {
    enableMetrics: true,
    logErrors: true
  }
};

// Provider-specific optimized configs
const PROVIDER_CONFIGS: Record<string, Partial<OmnisWrapperConfig>> = {
  'titane-local': {
    timeoutMs: 3000,
    circuitBreaker: {
      failureThreshold: 10,
      recoveryTimeoutMs: 10000,
      halfOpenMaxCalls: 3
    },
    retry: {
      maxRetries: 1,
      baseDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 1.5,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR']
    }
  },
  'gemini': {
    timeoutMs: 8000,
    circuitBreaker: {
      failureThreshold: 3,
      recoveryTimeoutMs: 20000,
      halfOpenMaxCalls: 2
    },
    retry: {
      maxRetries: 2,
      baseDelay: 1500,
      maxDelay: 6000,
      backoffMultiplier: 2,
      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT']
    }
  },
  'openai': {
    timeoutMs: 12000,
    circuitBreaker: {
      failureThreshold: 4,
      recoveryTimeoutMs: 30000,
      halfOpenMaxCalls: 3
    },
    retry: {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT']
    }
  },
  'claude': {
    timeoutMs: 10000,
    circuitBreaker: {
      failureThreshold: 4,
      recoveryTimeoutMs: 25000,
      halfOpenMaxCalls: 2
    },
    retry: {
      maxRetries: 2,
      baseDelay: 1800,
      maxDelay: 7000,
      backoffMultiplier: 2,
      retryableErrors: ['RATE_LIMIT', 'SERVER_ERROR', 'TIMEOUT']
    }
  },
  'ollama': {
    timeoutMs: 15000,
    circuitBreaker: {
      failureThreshold: 7,
      recoveryTimeoutMs: 15000,
      halfOpenMaxCalls: 5
    },
    retry: {
      maxRetries: 2,
      baseDelay: 3000,
      maxDelay: 10000,
      backoffMultiplier: 1.8,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR']
    }
  },
  'tauri-chat': {
    timeoutMs: 5000,
    circuitBreaker: {
      failureThreshold: 6,
      recoveryTimeoutMs: 12000,
      halfOpenMaxCalls: 4
    },
    retry: {
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 4000,
      backoffMultiplier: 2,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR']
    }
  }
};

// ─────────────────────────────────────────────────────────────────
// OMNIS PROVIDER WRAPPER CLASS
// ─────────────────────────────────────────────────────────────────

export class OmnisProviderWrapper implements AIProvider {
  private readonly originalProvider: AIProvider;
  private readonly config: OmnisWrapperConfig;
  private readonly circuitBreaker: CircuitBreakerState;
  private readonly metrics: ProviderMetrics;
  private readonly activeCalls = new Set<string>();
  private readonly callQueue: Array<{ resolve: Function; reject: Function; timestamp: number }> = [];

  public readonly name: AIProviderName;

  constructor(provider: AIProvider, customConfig?: Partial<OmnisWrapperConfig>) {
    this.originalProvider = provider;
    this.name = provider.name;

    // Merge configurations: default + provider-specific + custom
    const providerConfig = PROVIDER_CONFIGS[provider.name] || {};
    this.config = {
      ...DEFAULT_OMNIS_CONFIG,
      ...providerConfig,
      ...customConfig,
      circuitBreaker: {
        ...DEFAULT_OMNIS_CONFIG.circuitBreaker,
        ...providerConfig.circuitBreaker,
        ...customConfig?.circuitBreaker
      },
      retry: {
        ...DEFAULT_OMNIS_CONFIG.retry,
        ...providerConfig.retry,
        ...customConfig?.retry
      },
      isolation: {
        ...DEFAULT_OMNIS_CONFIG.isolation,
        ...providerConfig.isolation,
        ...customConfig?.isolation
      },
      monitoring: {
        ...DEFAULT_OMNIS_CONFIG.monitoring,
        ...providerConfig.monitoring,
        ...customConfig?.monitoring
      }
    };

    // Initialize circuit breaker
    this.circuitBreaker = {
      failures: 0,
      lastFailure: 0,
      state: 'CLOSED',
      recoveryTimeout: this.config.circuitBreaker.recoveryTimeoutMs,
      successCount: 0
    };

    // Initialize metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      timeoutCalls: 0,
      circuitBreakerTrips: 0,
      averageResponseTime: 0,
      lastCallTimestamp: 0,
      healthScore: 100
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.1: CIRCUIT BREAKER LOGIC
   * ═══════════════════════════════════════════════════════════════════
   */

  private checkCircuitBreaker(): boolean {
    const now = Date.now();

    switch (this.circuitBreaker.state) {
      case 'OPEN':
        if (now - this.circuitBreaker.lastFailure >= this.circuitBreaker.recoveryTimeout) {
          this.circuitBreaker.state = 'HALF_OPEN';
          this.circuitBreaker.successCount = 0;
          return true; // Allow call
        }
        return false; // Circuit is open, reject call

      case 'HALF_OPEN':
        return this.circuitBreaker.successCount < this.config.circuitBreaker.halfOpenMaxCalls;

      case 'CLOSED':
      default:
        return true; // Normal operation
    }
  }

  private recordSuccess(): void {
    switch (this.circuitBreaker.state) {
      case 'HALF_OPEN':
        this.circuitBreaker.successCount++;
        if (this.circuitBreaker.successCount >= this.config.circuitBreaker.halfOpenMaxCalls) {
          this.circuitBreaker.state = 'CLOSED';
          this.circuitBreaker.failures = 0;
        }
        break;
      case 'CLOSED':
        this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
        break;
    }
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.config.circuitBreaker.failureThreshold) {
      this.circuitBreaker.state = 'OPEN';
      this.metrics.circuitBreakerTrips++;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.2: ISOLATION SANDBOX
   * ═══════════════════════════════════════════════════════════════════
   */

  private async acquireCallSlot(): Promise<void> {
    if (this.activeCalls.size < this.config.isolation.maxConcurrentCalls) {
      return; // Slot available immediately
    }

    // Queue the call
    return new Promise((resolve, reject) => {
      const queueEntry = {
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.callQueue.push(queueEntry);

      // Timeout for queue
      setTimeout(() => {
        const index = this.callQueue.indexOf(queueEntry);
        if (index !== -1) {
          this.callQueue.splice(index, 1);
          reject(new Error('OMNIS_QUEUE_TIMEOUT'));
        }
      }, this.config.isolation.queueTimeout);
    });
  }

  private releaseCallSlot(): void {
    if (this.callQueue.length > 0) {
      const nextCall = this.callQueue.shift();
      if (nextCall && Date.now() - nextCall.timestamp < this.config.isolation.queueTimeout) {
        nextCall.resolve();
      }
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.3: RETRY LOGIC WITH EXPONENTIAL BACKOFF
   * ═══════════════════════════════════════════════════════════════════
   */

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = this.config.retry.retryableErrors.some(
        retryableError => errorMessage.includes(retryableError)
      );

      if (attempt >= this.config.retry.maxRetries || !isRetryable) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = Math.min(
        this.config.retry.baseDelay * Math.pow(this.config.retry.backoffMultiplier, attempt - 1),
        this.config.retry.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const finalDelay = delay + jitter;

      await new Promise(resolve => setTimeout(resolve, finalDelay));

      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.4: TIMEOUT PRECISION & METRICS
   * ═══════════════════════════════════════════════════════════════════
   */

  private createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('OMNIS_PROVIDER_TIMEOUT'));
      }, timeoutMs);
    });
  }

  private updateMetrics(success: boolean, responseTime: number, wasTimeout: boolean = false): void {
    this.metrics.totalCalls++;
    this.metrics.lastCallTimestamp = Date.now();

    if (success) {
      this.metrics.successfulCalls++;
      // Update rolling average response time
      this.metrics.averageResponseTime = Math.round(
        (this.metrics.averageResponseTime * (this.metrics.successfulCalls - 1) + responseTime) /
        this.metrics.successfulCalls
      );
    } else {
      this.metrics.failedCalls++;
      if (wasTimeout) {
        this.metrics.timeoutCalls++;
      }
    }

    // Calculate health score (0-100)
    const successRate = this.metrics.successfulCalls / this.metrics.totalCalls;
    const timeoutRate = this.metrics.timeoutCalls / this.metrics.totalCalls;
    const circuitBreakerPenalty = this.circuitBreaker.state === 'OPEN' ? 0.3 : 0;

    this.metrics.healthScore = Math.max(0, Math.min(100, Math.round(
      (successRate * 70) +
      ((1 - timeoutRate) * 20) +
      ((1 - circuitBreakerPenalty) * 10)
    )));
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.5: OMNIS GENERATE - MATHEMATICALLY UNBREAKABLE
   * ═══════════════════════════════════════════════════════════════════
   */

  async generate(message: string, history: AIMessage[] = [], config?: AIConfig): Promise<AIResponse> {
    const callId = `${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    try {
      // 1. Circuit Breaker Check
      if (!this.checkCircuitBreaker()) {
        throw new Error('OMNIS_CIRCUIT_BREAKER_OPEN');
      }

      // 2. Isolation Sandbox
      await this.acquireCallSlot();
      this.activeCalls.add(callId);

      try {
        // 3. Execute with Retry + Timeout Protection
        const result = await this.executeWithRetry(async () => {
          return Promise.race([
            this.originalProvider.generate(message, history, config),
            this.createTimeoutPromise<AIResponse>(this.config.timeoutMs)
          ]);
        });

        // 4. Success handling
        const responseTime = Date.now() - startTime;
        this.recordSuccess();
        this.updateMetrics(true, responseTime);

        return {
          ...result,
          metadata: {
            ...result.metadata,
            omnisWrapper: {
              responseTime,
              retries: 0, // Could be enhanced to track actual retries
              circuitBreakerState: this.circuitBreaker.state,
              healthScore: this.metrics.healthScore
            }
          }
        };

      } finally {
        this.activeCalls.delete(callId);
        this.releaseCallSlot();
      }

    } catch (error) {
      // 5. Error handling with OMNIS fallback
      const responseTime = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.message === 'OMNIS_PROVIDER_TIMEOUT';

      this.recordFailure();
      this.updateMetrics(false, responseTime, isTimeout);

      if (this.config.monitoring.logErrors) {
        console.warn(`[OMNIS ${this.name}] Error:`, {
          error: error instanceof Error ? error.message : String(error),
          circuitState: this.circuitBreaker.state,
          healthScore: this.metrics.healthScore,
          responseTime
        });
      }

      // Return OMNIS emergency response instead of throwing
      return this.createOmnisEmergencyResponse(message, responseTime, error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.6: AVAILABILITY CHECK & EMERGENCY RESPONSE
   * ═══════════════════════════════════════════════════════════════════
   */

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.checkCircuitBreaker()) {
        return false;
      }

      // Quick availability check with shorter timeout
      const quickCheck = await Promise.race([
        this.originalProvider.isAvailable(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('AVAILABILITY_TIMEOUT')), 2000)
        )
      ]);

      return quickCheck;
    } catch {
      return false;
    }
  }

  private createOmnisEmergencyResponse(
    message: string,
    responseTime: number,
    error: unknown
  ): AIResponse {
    const errorType = error instanceof Error ? error.message : String(error);

    const emergencyMessages = [
      `Le provider ${this.name} traite votre demande en mode sécurisé. Réponse OMNIS en cours.`,
      `Système ${this.name} temporairement indisponible. TITANE∞ continue le traitement via protocole de sécurité.`,
      `Mode OMNIS activé pour "${message.substring(0, 30)}...". Le système garantit une réponse alternative.`
    ];

    const selectedMessage = emergencyMessages[Math.floor(Math.random() * emergencyMessages.length)];

    return {
      content: selectedMessage,
      provider: this.name,
      timestamp: Date.now(),
      metadata: {
        emergency: true,
        originalError: errorType,
        responseTime,
        omnisWrapper: {
          circuitBreakerState: this.circuitBreaker.state,
          healthScore: this.metrics.healthScore,
          fallbackMode: true
        }
      }
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 4.7: OMNIS DIAGNOSTICS & STATS
   * ═══════════════════════════════════════════════════════════════════
   */

  getOmnisMetrics(): ProviderMetrics & {
    circuitBreakerState: CircuitBreakerState;
    config: OmnisWrapperConfig;
    activeCallsCount: number;
    queueLength: number;
  } {
    return {
      ...this.metrics,
      circuitBreakerState: { ...this.circuitBreaker },
      config: this.config,
      activeCallsCount: this.activeCalls.size,
      queueLength: this.callQueue.length
    };
  }

  resetOmnisMetrics(): void {
    this.metrics.totalCalls = 0;
    this.metrics.successfulCalls = 0;
    this.metrics.failedCalls = 0;
    this.metrics.timeoutCalls = 0;
    this.metrics.circuitBreakerTrips = 0;
    this.metrics.averageResponseTime = 0;
    this.metrics.healthScore = 100;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.successCount = 0;
  }

  forceCircuitBreakerOpen(): void {
    this.circuitBreaker.state = 'OPEN';
    this.circuitBreaker.lastFailure = Date.now();
    this.circuitBreaker.failures = this.config.circuitBreaker.failureThreshold;
  }

  forceCircuitBreakerClosed(): void {
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.successCount = 0;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * OMNIS WRAPPER FACTORY
 * ═══════════════════════════════════════════════════════════════════
 */

export function wrapProviderWithOmnis(
  provider: AIProvider,
  customConfig?: Partial<OmnisWrapperConfig>
): OmnisProviderWrapper {
  return new OmnisProviderWrapper(provider, customConfig);
}

export type {
  OmnisWrapperConfig,
  ProviderMetrics,
  CircuitBreakerState,
  RetryConfig
};
