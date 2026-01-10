/**
 * TITANE∞ v24.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.5 — CIRCUIT BREAKER PATTERN
 *   Prevents cascade failures when providers go down
 *   States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('CircuitBreaker');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting recovery (OPEN → HALF_OPEN) */
  recoveryTimeoutMs: number;
  /** Number of successful calls in HALF_OPEN to close circuit */
  successThreshold: number;
  /** Time window in ms to count failures */
  failureWindowMs: number;
  /** Minimum number of calls before evaluating failure rate */
  minimumCalls: number;
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number;
  lastSuccess: number;
  lastStateChange: number;
  totalCalls: number;
  openCount: number;
  halfOpenAttempts: number;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════

// v26.4.0: Configuration très tolérante pour éviter les blocages
export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 100, // Était 5 - beaucoup plus tolérant
  recoveryTimeoutMs: 5000, // Était 30000 - recovery plus rapide
  successThreshold: 1, // Était 2 - 1 succès suffit
  failureWindowMs: 300000, // Était 60000 - fenêtre plus large
  minimumCalls: 50, // Était 3 - plus de calls avant évaluation
};

// v26.4.0: Provider-specific configs - TRÈS TOLÉRANT
export const PROVIDER_CIRCUIT_CONFIGS: Record<string, Partial<CircuitBreakerConfig>> = {
  claude: {
    failureThreshold: 50, // Était 3
    recoveryTimeoutMs: 2000, // Était 20000
  },
  openai: {
    failureThreshold: 50, // Était 3
    recoveryTimeoutMs: 2000, // Était 20000
  },
  gemini: {
    failureThreshold: 50, // Était 4
    recoveryTimeoutMs: 2000, // Était 25000
  },
  'tauri-backend': {
    failureThreshold: 100, // Était 5
    recoveryTimeoutMs: 1000, // Était 15000
  },
  ollama: {
    failureThreshold: 100, // Était 6
    recoveryTimeoutMs: 1000, // Était 10000
  },
  'titane-local': {
    failureThreshold: 1000, // Était 10
    recoveryTimeoutMs: 500, // Était 5000
  },
};

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER CLASS
// ═══════════════════════════════════════════════════════════════

// ✨ v24.2.1: Max timestamps per provider to prevent unbounded growth
const MAX_FAILURE_TIMESTAMPS = 100;

class CircuitBreaker {
  private circuits: Map<string, CircuitStats> = new Map();
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  private failureTimestamps: Map<string, number[]> = new Map();

  constructor() {
    logger.info('Circuit Breaker initialized');
  }

  /**
   * Get or create circuit for a provider
   */
  private getCircuit(provider: string): CircuitStats {
    if (!this.circuits.has(provider)) {
      this.circuits.set(provider, {
        state: 'CLOSED',
        failures: 0,
        successes: 0,
        lastFailure: 0,
        lastSuccess: 0,
        lastStateChange: Date.now(),
        totalCalls: 0,
        openCount: 0,
        halfOpenAttempts: 0,
      });
    }
    const circuit = this.circuits.get(provider);
    if (!circuit) {
      throw new Error(`Circuit for provider ${provider} not found after initialization`);
    }
    return circuit;
  }

  /**
   * Get config for a provider
   */
  private getConfig(provider: string): CircuitBreakerConfig {
    if (!this.configs.has(provider)) {
      const providerConfig = PROVIDER_CIRCUIT_CONFIGS[provider] || {};
      this.configs.set(provider, { ...DEFAULT_CIRCUIT_CONFIG, ...providerConfig });
    }
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Config for provider ${provider} not found after initialization`);
    }
    return config;
  }

  /**
   * Get failure timestamps within window
   */
  private getRecentFailures(provider: string, windowMs: number): number[] {
    const timestamps = this.failureTimestamps.get(provider) || [];
    const cutoff = Date.now() - windowMs;
    return timestamps.filter(t => t > cutoff);
  }

  /**
   * Check if provider circuit allows requests
   */
  canExecute(provider: string): boolean {
    const circuit = this.getCircuit(provider);
    const config = this.getConfig(provider);
    const now = Date.now();

    switch (circuit.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if recovery timeout has passed
        if (now - circuit.lastStateChange >= config.recoveryTimeoutMs) {
          this.transitionState(provider, 'HALF_OPEN');
          logger.info(`Circuit ${provider}: OPEN → HALF_OPEN (attempting recovery)`);
          return true;
        }
        return false;

      case 'HALF_OPEN':
        // Allow limited requests in half-open state
        circuit.halfOpenAttempts++;
        return true;
    }
  }

  /**
   * Record a successful call
   */
  recordSuccess(provider: string): void {
    const circuit = this.getCircuit(provider);
    const config = this.getConfig(provider);

    circuit.successes++;
    circuit.lastSuccess = Date.now();
    circuit.totalCalls++;

    if (circuit.state === 'HALF_OPEN') {
      // Check if we have enough successes to close
      if (circuit.successes >= config.successThreshold) {
        this.transitionState(provider, 'CLOSED');
        logger.info(
          `Circuit ${provider}: HALF_OPEN → CLOSED (recovered after ${circuit.successes} successes)`
        );
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.halfOpenAttempts = 0;
      }
    } else if (circuit.state === 'CLOSED') {
      // Reset failure count on success in closed state
      circuit.failures = Math.max(0, circuit.failures - 1);
    }
  }

  /**
   * Record a failed call
   */
  recordFailure(provider: string, error?: Error): void {
    const circuit = this.getCircuit(provider);
    const config = this.getConfig(provider);
    const now = Date.now();

    circuit.failures++;
    circuit.lastFailure = now;
    circuit.totalCalls++;

    // Track failure timestamp
    const timestamps = this.failureTimestamps.get(provider) || [];
    timestamps.push(now);
    // Keep only recent timestamps + enforce max size
    let filtered = timestamps.filter(t => t > now - config.failureWindowMs);
    // ✨ v24.2.1: Enforce absolute size limit
    if (filtered.length > MAX_FAILURE_TIMESTAMPS) {
      filtered = filtered.slice(-MAX_FAILURE_TIMESTAMPS);
    }
    this.failureTimestamps.set(provider, filtered);

    if (circuit.state === 'HALF_OPEN') {
      // Any failure in half-open returns to open
      this.transitionState(provider, 'OPEN');
      logger.warn(
        `Circuit ${provider}: HALF_OPEN → OPEN (failed during recovery: ${error?.message || 'unknown'})`
      );
      circuit.successes = 0;
      circuit.halfOpenAttempts = 0;
    } else if (circuit.state === 'CLOSED') {
      // Check if we should open the circuit
      const recentFailures = this.getRecentFailures(provider, config.failureWindowMs);

      if (
        circuit.totalCalls >= config.minimumCalls &&
        recentFailures.length >= config.failureThreshold
      ) {
        this.transitionState(provider, 'OPEN');
        circuit.openCount++;
        logger.warn(
          `Circuit ${provider}: CLOSED → OPEN (${recentFailures.length} failures in ${config.failureWindowMs}ms)`
        );
      }
    }
  }

  /**
   * Transition circuit state
   */
  private transitionState(provider: string, newState: CircuitState): void {
    const circuit = this.getCircuit(provider);
    const oldState = circuit.state;
    circuit.state = newState;
    circuit.lastStateChange = Date.now();

    logger.debug(`Circuit ${provider} state transition: ${oldState} → ${newState}`);
  }

  /**
   * Force reset a circuit (for recovery/testing)
   */
  reset(provider: string): void {
    const circuit = this.getCircuit(provider);
    circuit.state = 'CLOSED';
    circuit.failures = 0;
    circuit.successes = 0;
    circuit.lastStateChange = Date.now();
    circuit.halfOpenAttempts = 0;
    this.failureTimestamps.delete(provider);
    logger.info(`Circuit ${provider} manually reset`);
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    for (const provider of this.circuits.keys()) {
      this.reset(provider);
    }
    logger.info('All circuits reset');
  }

  /**
   * Get circuit stats for a provider
   */
  getStats(provider: string): CircuitStats {
    return { ...this.getCircuit(provider) };
  }

  /**
   * Get all circuit stats
   */
  getAllStats(): Map<string, CircuitStats> {
    const stats = new Map<string, CircuitStats>();
    for (const [provider, circuit] of this.circuits) {
      stats.set(provider, { ...circuit });
    }
    return stats;
  }

  /**
   * Check if any circuit is open (system under stress)
   */
  hasOpenCircuits(): boolean {
    for (const circuit of this.circuits.values()) {
      if (circuit.state === 'OPEN') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of open circuit providers
   */
  getOpenCircuits(): string[] {
    const open: string[] = [];
    for (const [provider, circuit] of this.circuits) {
      if (circuit.state === 'OPEN') {
        open.push(provider);
      }
    }
    return open;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════

export const circuitBreaker = new CircuitBreaker();

export default circuitBreaker;
