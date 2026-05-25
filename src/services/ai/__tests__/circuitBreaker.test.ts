import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { circuitBreaker, DEFAULT_CIRCUIT_CONFIG } from '../circuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    circuitBreaker.resetAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts CLOSED for any provider', () => {
      expect(circuitBreaker.canExecute('ollama')).toBe(true);
      expect(circuitBreaker.getStats('ollama').state).toBe('CLOSED');
    });

    it('reports no open circuits initially', () => {
      circuitBreaker.canExecute('ollama');
      expect(circuitBreaker.hasOpenCircuits()).toBe(false);
      expect(circuitBreaker.getOpenCircuits()).toHaveLength(0);
    });
  });

  describe('CLOSED → OPEN transition', () => {
    it('opens after failureThreshold failures within window', () => {
      const provider = 'test-provider-open';
      // Meet minimum calls + exceed failure threshold
      const threshold = DEFAULT_CIRCUIT_CONFIG.failureThreshold;
      const minCalls = DEFAULT_CIRCUIT_CONFIG.minimumCalls;
      const total = Math.max(threshold, minCalls);

      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error(`fail ${i}`));
      }

      expect(circuitBreaker.getStats(provider).state).toBe('OPEN');
      expect(circuitBreaker.canExecute(provider)).toBe(false);
    });

    it('does NOT open before minimumCalls is met', () => {
      const provider = 'test-below-min';
      const minCalls = DEFAULT_CIRCUIT_CONFIG.minimumCalls;

      for (let i = 0; i < minCalls - 1; i++) {
        circuitBreaker.recordFailure(provider, new Error(`fail ${i}`));
      }

      expect(circuitBreaker.getStats(provider).state).toBe('CLOSED');
    });

    it('adds the provider to open circuits list', () => {
      const provider = 'test-open-list';
      const total = Math.max(
        DEFAULT_CIRCUIT_CONFIG.failureThreshold,
        DEFAULT_CIRCUIT_CONFIG.minimumCalls
      );

      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error('x'));
      }

      expect(circuitBreaker.getOpenCircuits()).toContain(provider);
      expect(circuitBreaker.hasOpenCircuits()).toBe(true);
    });
  });

  describe('OPEN → HALF_OPEN transition', () => {
    it('transitions to HALF_OPEN after recoveryTimeout', () => {
      const provider = 'test-half-open';
      const total = Math.max(
        DEFAULT_CIRCUIT_CONFIG.failureThreshold,
        DEFAULT_CIRCUIT_CONFIG.minimumCalls
      );
      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error('x'));
      }

      expect(circuitBreaker.getStats(provider).state).toBe('OPEN');

      // Advance time past recovery timeout
      vi.advanceTimersByTime(DEFAULT_CIRCUIT_CONFIG.recoveryTimeoutMs + 1);

      const canExecute = circuitBreaker.canExecute(provider);
      expect(canExecute).toBe(true);
      expect(circuitBreaker.getStats(provider).state).toBe('HALF_OPEN');
    });

    it('stays OPEN before recoveryTimeout elapses', () => {
      const provider = 'test-stays-open';
      const total = Math.max(
        DEFAULT_CIRCUIT_CONFIG.failureThreshold,
        DEFAULT_CIRCUIT_CONFIG.minimumCalls
      );
      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error('x'));
      }

      vi.advanceTimersByTime(DEFAULT_CIRCUIT_CONFIG.recoveryTimeoutMs - 1000);

      expect(circuitBreaker.canExecute(provider)).toBe(false);
      expect(circuitBreaker.getStats(provider).state).toBe('OPEN');
    });
  });

  describe('HALF_OPEN → CLOSED recovery', () => {
    function openAndHalfOpenProvider(provider: string) {
      const total = Math.max(
        DEFAULT_CIRCUIT_CONFIG.failureThreshold,
        DEFAULT_CIRCUIT_CONFIG.minimumCalls
      );
      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error('x'));
      }
      vi.advanceTimersByTime(DEFAULT_CIRCUIT_CONFIG.recoveryTimeoutMs + 1);
      circuitBreaker.canExecute(provider); // triggers OPEN → HALF_OPEN
    }

    it('closes after successThreshold successes', () => {
      const provider = 'test-recovery';
      openAndHalfOpenProvider(provider);
      expect(circuitBreaker.getStats(provider).state).toBe('HALF_OPEN');

      for (let i = 0; i < DEFAULT_CIRCUIT_CONFIG.successThreshold; i++) {
        circuitBreaker.recordSuccess(provider);
      }

      expect(circuitBreaker.getStats(provider).state).toBe('CLOSED');
    });

    it('re-opens on failure in HALF_OPEN state', () => {
      const provider = 'test-reopen';
      openAndHalfOpenProvider(provider);

      circuitBreaker.recordFailure(provider, new Error('recovery fail'));

      expect(circuitBreaker.getStats(provider).state).toBe('OPEN');
    });
  });

  describe('success recovery in CLOSED state', () => {
    it('decrements failure count on success', () => {
      const provider = 'test-success-closed';
      circuitBreaker.recordFailure(provider, new Error('x'));
      const beforeFailures = circuitBreaker.getStats(provider).failures;
      circuitBreaker.recordSuccess(provider);
      const afterFailures = circuitBreaker.getStats(provider).failures;
      expect(afterFailures).toBeLessThan(beforeFailures);
    });
  });

  describe('manual reset', () => {
    it('reset() closes an open circuit immediately', () => {
      const provider = 'test-manual-reset';
      const total = Math.max(
        DEFAULT_CIRCUIT_CONFIG.failureThreshold,
        DEFAULT_CIRCUIT_CONFIG.minimumCalls
      );
      for (let i = 0; i < total; i++) {
        circuitBreaker.recordFailure(provider, new Error('x'));
      }
      expect(circuitBreaker.getStats(provider).state).toBe('OPEN');

      circuitBreaker.reset(provider);

      expect(circuitBreaker.getStats(provider).state).toBe('CLOSED');
      expect(circuitBreaker.canExecute(provider)).toBe(true);
    });

    it('resetAll() closes all circuits', () => {
      const providers = ['p1', 'p2', 'p3'];
      for (const p of providers) {
        const total = Math.max(
          DEFAULT_CIRCUIT_CONFIG.failureThreshold,
          DEFAULT_CIRCUIT_CONFIG.minimumCalls
        );
        for (let i = 0; i < total; i++) {
          circuitBreaker.recordFailure(p, new Error('x'));
        }
      }
      expect(circuitBreaker.hasOpenCircuits()).toBe(true);

      circuitBreaker.resetAll();

      expect(circuitBreaker.hasOpenCircuits()).toBe(false);
    });
  });

  describe('provider-specific configs', () => {
    it('ollama uses more tolerant threshold than claude', () => {
      // ollama failureThreshold=6, claude failureThreshold=3
      // After 4 failures: ollama CLOSED, claude OPEN
      const ollamaTotal = Math.max(4, DEFAULT_CIRCUIT_CONFIG.minimumCalls);
      const claudeTotal = Math.max(4, DEFAULT_CIRCUIT_CONFIG.minimumCalls);

      for (let i = 0; i < ollamaTotal; i++) {
        circuitBreaker.recordFailure('ollama', new Error('x'));
      }
      for (let i = 0; i < claudeTotal; i++) {
        circuitBreaker.recordFailure('claude', new Error('x'));
      }

      const ollamaState = circuitBreaker.getStats('ollama').state;
      const claudeState = circuitBreaker.getStats('claude').state;

      // At 4 failures: ollama (threshold 6) stays CLOSED, claude (threshold 3) OPEN
      expect(ollamaState).toBe('CLOSED');
      expect(claudeState).toBe('OPEN');
    });
  });

  describe('stats tracking', () => {
    it('tracks totalCalls across successes and failures', () => {
      const provider = 'test-stats';
      circuitBreaker.recordSuccess(provider);
      circuitBreaker.recordSuccess(provider);
      circuitBreaker.recordFailure(provider, new Error('x'));

      const stats = circuitBreaker.getStats(provider);
      expect(stats.totalCalls).toBe(3);
    });

    it('getAllStats() returns stats for all known providers', () => {
      circuitBreaker.canExecute('pa');
      circuitBreaker.canExecute('pb');
      const all = circuitBreaker.getAllStats();
      expect(all.has('pa')).toBe(true);
      expect(all.has('pb')).toBe(true);
    });
  });
});
