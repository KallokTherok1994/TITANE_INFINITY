import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { autoHealEngine } from '../autoHealEngine';
import { circuitBreaker } from '../circuitBreaker';

vi.mock('../circuitBreaker', () => ({
  circuitBreaker: {
    canExecute: vi.fn(() => true),
    recordSuccess: vi.fn(),
    recordFailure: vi.fn(),
    reset: vi.fn(),
    resetAll: vi.fn(),
    getStats: vi.fn(() => ({ state: 'CLOSED', failures: 0, successes: 0, totalCalls: 0, lastFailure: 0, lastSuccess: 0, lastStateChange: 0, openCount: 0, halfOpenAttempts: 0 })),
    hasOpenCircuits: vi.fn(() => false),
    getOpenCircuits: vi.fn(() => []),
    getAllStats: vi.fn(() => new Map()),
  },
}));

describe('AutoHealEngine', () => {
  beforeEach(() => {
    autoHealEngine.resetStats();
    autoHealEngine.configure({ enabled: true, logLevel: 'error' });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('error detection', () => {
    it('detectError() returns an AutoHealError with correct fields', () => {
      const err = autoHealEngine.detectError('ollama', 'Connection refused', 'network');

      expect(err.id).toMatch(/^heal_/);
      expect(err.source).toBe('ollama');
      expect(err.message).toBe('Connection refused');
      expect(err.type).toBe('network');
      expect(err.timestamp).toBeGreaterThan(0);
    });

    it('auto-classifies provider errors from message keywords', () => {
      // analyzeErrorType checks message content: 'provider' or 'api' → 'provider'
      const err = autoHealEngine.detectError('gemini', 'API error: quota exceeded');
      expect(err.type).toBe('provider');
    });

    it('auto-classifies network errors from message content', () => {
      const err = autoHealEngine.detectError('openai', 'timeout after 30s');
      expect(['network', 'timeout']).toContain(err.type);
    });

    it('auto-classifies validation errors', () => {
      const err = autoHealEngine.detectError('local', 'Invalid JSON response');
      expect(['validation', 'provider']).toContain(err.type);
    });

    it('increments totalErrors stat', () => {
      const before = autoHealEngine.getStats().totalErrors;
      autoHealEngine.detectError('test', 'boom', 'unknown');
      expect(autoHealEngine.getStats().totalErrors).toBe(before + 1);
    });

    it('accepts Error objects (not just strings)', () => {
      const err = autoHealEngine.detectError('test', new Error('real error'));
      expect(err.message).toBe('real error');
      expect(err.stackTrace).toBeDefined();
    });

    it('records the error in getRecentErrors()', () => {
      const err = autoHealEngine.detectError('test', 'tracked error', 'unknown');
      const recent = autoHealEngine.getRecentErrors(5);
      expect(recent.some(e => e.id === err.id)).toBe(true);
    });
  });

  describe('stats', () => {
    it('getStats() returns valid structure with all required fields', () => {
      const stats = autoHealEngine.getStats();
      expect(stats).toHaveProperty('totalErrors');
      expect(stats).toHaveProperty('totalHeals');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('healthScore');
      expect(stats).toHaveProperty('avgHealTime');
      expect(stats).toHaveProperty('errorsByType');
      expect(stats).toHaveProperty('actionsByType');
      expect(stats).toHaveProperty('providers');
    });

    it('starts with healthScore=100 and totalErrors=0', () => {
      const stats = autoHealEngine.getStats();
      expect(stats.healthScore).toBe(100);
      expect(stats.totalErrors).toBe(0);
    });

    it('resetStats() clears everything back to baseline', () => {
      autoHealEngine.detectError('test', 'err');
      autoHealEngine.resetStats();

      const stats = autoHealEngine.getStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.healthScore).toBe(100);
      expect(autoHealEngine.getRecentErrors()).toHaveLength(0);
    });
  });

  describe('configure()', () => {
    it('disabling stops heal triggers', async () => {
      autoHealEngine.configure({ enabled: false });
      const err = autoHealEngine.detectError('test', 'no-heal');
      // detectError with enabled=false should not trigger heal
      const recent = autoHealEngine.getRecentActions(10);
      // No action should be queued for this error
      expect(recent.some(a => a.errorId === err.id)).toBe(false);
    });
  });

  describe('self-test', () => {
    it('selfTest() resolves with success=true', async () => {
      const result = await autoHealEngine.selfTest();
      expect(result.success).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('selfTest() includes error_detection test', async () => {
      const result = await autoHealEngine.selfTest();
      expect(result.results.some(r => r.test === 'error_detection')).toBe(true);
    });
  });

  describe('error type categorisation in stats', () => {
    it('buckets errors by type in errorsByType', () => {
      autoHealEngine.detectError('s1', 'fail', 'network');
      autoHealEngine.detectError('s2', 'fail', 'network');
      autoHealEngine.detectError('s3', 'fail', 'timeout');

      const stats = autoHealEngine.getStats();
      expect(stats.errorsByType['network']).toBeGreaterThanOrEqual(2);
      expect(stats.errorsByType['timeout']).toBeGreaterThanOrEqual(1);
    });
  });
});
