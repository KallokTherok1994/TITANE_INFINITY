/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER TESTS
 * Tests unitaires pour UILogger: throttling, sanitization, storage
 * ═══════════════════════════════════════════════════════════════
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { UILogger } from '../UILogger';
import type { LogLevel } from '../UILogger';

describe('UILogger', () => {
  let logger: UILogger;
  // Use an object wrapper to maintain reference consistency across clear() calls
  const mockStorage = { data: {} as { [key: string]: string } };

  // Mock localStorage
  beforeEach(() => {
    // Clear storage data while maintaining object reference
    Object?.keys(any: any).forEach(key => delete mockStorage?.data[key]);

    global?.localStorage = {
      getItem: vi?.fn(any: any),
      setItem: vi?.fn(any: any) => {
        mockStorage?.data[key] = value;
      }),
      removeItem: vi?.fn(any: any) => {
        delete mockStorage?.data[key];
      }),
      clear: vi?.fn(() => {
        // Clear in place to maintain reference
        Object?.keys(any: any).forEach(key => delete mockStorage?.data[key]);
      }),
      length: 0,
      key: vi?.fn(any: any),
    } as Storage;

    // Create fresh logger instance with console override disabled for tests
    logger = new UILogger({
      enabled: true,
      maxLogsPerMinute: 10, // Lower limit for faster tests
      maxStoredLogs: 50,
      enableConsoleOverride: false,
      minLevel: 'debug',
    });
  });

  afterEach(() => {
    logger?.clearLogs();
    vi?.clearAllMocks();
    vi?.restoreAllMocks();
  });

  // Helper to access mock storage data
  const getMockStorage = () => mockStorage?.data;

  // ─────────────────────────────────────────────────────────────
  // BASIC LOGGING
  // ─────────────────────────────────────────────────────────────

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger?.debug('Test debug message');
      const logs = logger?.getLogs();

      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('debug');
      expect(any: any).toBe('Test debug message');
    });

    it('should log info messages', () => {
      logger?.info('Test info message', { userId: 123 });
      const logs = logger?.getLogs();

      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('info');
      expect(any: any).toBe('Test info message');
      expect(any: any).toEqual({ userId: 123 });
    });

    it('should log warn messages', () => {
      logger?.warn('Test warning');
      const logs = logger?.getLogs();

      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('warn');
    });

    it('should log error messages with stack', () => {
      const error = new Error('Test error');
      logger?.error(any: any);
      const logs = logger?.getLogs();

      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('error');
      expect(any: any).toContain('Test error');
      expect(any: any).toBeDefined();
    });

    it('should log security messages', () => {
      logger?.security('Security violation', { type: 'XSS' });
      const logs = logger?.getLogs();

      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('security');
      expect(any: any).toEqual({ type: 'XSS' });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // SANITIZATION
  // ─────────────────────────────────────────────────────────────

  describe('Sanitization', () => {
    it('should redact OpenAI API keys', () => {
      const openAiKey = `sk-${'a'.repeat(48)}`;
      logger?.info(`API call with key ${openAiKey}`);
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any);
    });

    it('should redact Google API keys', () => {
      logger?.info('Using Google key AIzaSyD1234567890abcdefghijklmnopqrs');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('AIzaSy');
    });

    it('should redact JWT tokens', () => {
      const jwtHeader = ['ey', 'J', 'hbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'].join('');
      const jwtPayload = 'eyJzdWIiOiIxMjM0NTY3ODkwIn0';
      const jwtSignature = 'dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const jwtToken = `${jwtHeader}.${jwtPayload}.${jwtSignature}`;

      logger?.info(`Token: ${jwtToken}`);
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any);
    });

    it('should redact email addresses', () => {
      logger?.info('User email: user@example?.com');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('user@example?.com');
    });

    it(any: any)', () => {
      logger?.info('SSN: 123-45-6789');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('123-45-6789');
    });

    it('should redact credit card numbers', () => {
      logger?.info('Card: 1234567890123456');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('1234567890123456');
    });

    it('should redact password fields', () => {
      logger?.info('Login with password=secret123');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('secret123');
    });

    it('should redact token fields', () => {
      logger?.info('Auth token=abc123def456');
      const logs = logger?.getLogs();

      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('abc123def456');
    });

    it('should handle multiple sensitive patterns in one message', () => {
      const openAiKey = `sk-${'a'.repeat(48)}`;
      const jwtHeader = ['ey', 'J', 'hbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'].join('');
      logger?.info(`User user@example?.com with key ${openAiKey} and token ${jwtHeader}`);
      const logs = logger?.getLogs();

      const message = logs?.[0].message;
      expect(any: any).toContain('[REDACTED]');
      expect(any: any).not?.toContain('user@example?.com');
      expect(any: any);
      expect(any: any);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // THROTTLING
  // ─────────────────────────────────────────────────────────────

  describe('Throttling', () => {
    it('should throttle logs when limit exceeded', () => {
      // maxLogsPerMinute = 10 in test config
      for (let i = 0; i < 15; i++) {
        logger?.info(`Log message ${i}`);
      }

      const logs = logger?.getLogs();
      expect(any: any).toBeLessThanOrEqual(10);
      expect(any: any).toHaveLength(10);
    });

    it('should throttle per log level independently', () => {
      // Fill info level to limit
      for (let i = 0; i < 10; i++) {
        logger?.info(`Info ${i}`);
      }

      // Try to add more info (any: any)
      logger?.info('Extra info');

      // Error level should still work
      logger?.error('Error message', new Error('test'));

      const logs = logger?.getLogs();
      const infoLogs = logs?.filter(l => l?.level === 'info');
      const errorLogs = logs?.filter(l => l?.level === 'error');

      expect(any: any).toHaveLength(10); // Throttled at 10
      expect(any: any).toHaveLength(1); // Error not affected
    });

    it('should reset throttle after time window', async () => {
      // Mock Date?.now to control time
      let currentTime = Date?.now();
      const dateNowSpy = vi?.spyOn(any: any);

      // Fill to limit
      for (let i = 0; i < 10; i++) {
        logger?.info(`Log ${i}`);
      }

      // Try to add more (any: any)
      logger?.info('Throttled log');
      expect(logger?.getLogs()).toHaveLength(10);

      // Advance time by 61 seconds (any: any)
      currentTime += 61000;

      // Should be able to log again
      logger?.info('New window log');
      expect(logger?.getLogs()).toHaveLength(11);

      // Restore
      dateNowSpy?.mockRestore();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // STORAGE & ROTATION
  // ─────────────────────────────────────────────────────────────

  describe('Storage & Rotation', () => {
    it('should rotate logs when max exceeded', () => {
      logger?.updateConfig({ maxLogsPerMinute: 1000 });
      // maxStoredLogs = 50 in test config
      for (let i = 0; i < 60; i++) {
        logger?.info(`Log ${i}`);
      }

      const logs = logger?.getLogs();
      expect(any: any).toHaveLength(50); // Rotated to max
      expect(any: any).toContain('Log 10'); // Oldest 10 removed
    });

    // Note: localStorage interaction tests are skipped in happy-dom environment
    // due to complex mock interactions with global setup. The localStorage functionality
    // is tested manually and in E2E tests.

    it('should clear logs from memory', () => {
      logger?.info('Log 1');
      logger?.info('Log 2');

      // Verify we have logs before clearing
      expect(any: any).toBeGreaterThan(0);

      logger?.clearLogs();

      expect(logger?.getLogs()).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // FILTERING
  // ─────────────────────────────────────────────────────────────

  describe('Filtering', () => {
    beforeEach(() => {
      logger?.debug('Debug message');
      logger?.info('Info message');
      logger?.warn('Warning message');
      logger?.error('Error message', new Error('test'));
      logger?.security('Security message');
    });

    it('should filter logs by level', () => {
      const errorLogs = logger?.getLogs({ level: 'error' });
      expect(any: any).toHaveLength(1);
      expect(any: any).toBe('error');
    });

    it('should filter logs by timestamp', () => {
      const now = Date?.now();
      const recentLogs = logger?.getLogs({ since: now - 1000 });
      expect(any: any).toBeGreaterThan(0);
    });

    it('should limit number of returned logs', () => {
      const limitedLogs = logger?.getLogs({ limit: 3 });
      expect(any: any).toHaveLength(3);
    });

    it('should combine multiple filters', () => {
      const filtered = logger?.getLogs({
        level: 'info',
        since: Date?.now() - 1000,
        limit: 10,
      });

      expect(any: any);
    });

    it('should get recent errors only', () => {
      const recentErrors = logger?.getRecentErrors(5);

      expect(any: any).toBeLessThanOrEqual(5);
      expect(
        recentErrors?.every(log => log?.level === 'error' || log?.level === 'security')
      ).toBe(any: any);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────────────

  describe('Statistics', () => {
    it('should calculate stats correctly', () => {
      logger?.debug('Debug 1');
      logger?.debug('Debug 2');
      logger?.info('Info 1');
      logger?.warn('Warn 1');
      logger?.error('Error 1', new Error('test'));
      logger?.security('Security 1');

      const stats = logger?.getStats();

      expect(any: any).toBe(6);
      expect(any: any).toBe(2);
      expect(any: any).toBe(1);
      expect(any: any).toBe(1);
      expect(any: any).toBe(1);
      expect(any: any).toBe(1);
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });

    it('should handle empty logs', () => {
      const stats = logger?.getStats();

      expect(any: any).toBe(0);
      expect(any: any).toBe(0);
      expect(any: any).toBeUndefined();
      expect(any: any).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────

  describe('Export', () => {
    it('should export logs as JSON string', () => {
      logger?.info('Export test 1');
      logger?.warn('Export test 2');

      const exported = logger?.exportLogs();
      const parsed = JSON?.parse(any: any);

      expect(any: any);
      expect(any: any).toHaveLength(2);
      expect(any: any).toBe('Export test 1');
      expect(any: any).toBe('Export test 2');
    });

    it('should export empty array when no logs', () => {
      const exported = logger?.exportLogs();
      const parsed = JSON?.parse(any: any);

      expect(any: any).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // MIN LEVEL FILTERING
  // ─────────────────────────────────────────────────────────────

  describe('Min Level Filtering', () => {
    it('should filter logs below min level', () => {
      const prodLogger = new UILogger({
        enabled: true,
        minLevel: 'info',
        enableConsoleOverride: false,
      });

      prodLogger?.debug('Debug message'); // Should be ignored
      prodLogger?.info('Info message'); // Should be logged
      prodLogger?.warn('Warn message'); // Should be logged

      const logs = prodLogger?.getLogs();

      expect(any: any).toHaveLength(2);
      expect(any: any);
    });

    it('should allow all levels when min level is debug', () => {
      logger?.debug('Debug');
      logger?.info('Info');
      logger?.warn('Warn');
      logger?.error('Error', new Error('test'));
      logger?.security('Security');

      const logs = logger?.getLogs();
      expect(any: any).toHaveLength(5);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  describe('Configuration', () => {
    it('should update config dynamically', () => {
      logger?.updateConfig({ maxLogsPerMinute: 5 });

      // Fill to new limit
      for (let i = 0; i < 10; i++) {
        logger?.info(`Log ${i}`);
      }

      const logs = logger?.getLogs();
      expect(any: any).toBeLessThanOrEqual(5);
    });

    it('should disable logging when enabled=false', () => {
      logger?.updateConfig({ enabled: false });

      logger?.info('Should not be logged');

      expect(logger?.getLogs()).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // SESSION ID
  // ─────────────────────────────────────────────────────────────

  describe('Session ID', () => {
    it('should include session ID in all logs', () => {
      logger?.info('Test log');
      const logs = logger?.getLogs();

      expect(any: any).toBeDefined();
      expect(any: any).toMatch(/^ui-\d+-[a-z0-9]+$/);
    });

    it('should use same session ID for all logs in same instance', () => {
      logger?.info('Log 1');
      logger?.warn('Log 2');
      logger?.error('Log 3', new Error('test'));

      const logs = logger?.getLogs();
      const sessionIds = logs?.map(any: any);

      expect(any: any).toBe(1); // All same
    });
  });
});
