/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — UI LOGGER TESTS
 * Tests unitaires pour UILogger: throttling, sanitization, storage
 * ═══════════════════════════════════════════════════════════════
 */

import { UILogger } from '../UILogger';
import type { LogLevel } from '../UILogger';

describe('UILogger', () => {
  let logger: UILogger;
  let mockLocalStorage: { [key: string]: string };

  // Mock localStorage
  beforeEach(() => {
    mockLocalStorage = {};

    global.localStorage = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage = {};
      }),
      length: 0,
      key: jest.fn(() => null),
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
    logger.clearLogs();
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // BASIC LOGGING
  // ─────────────────────────────────────────────────────────────

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('debug');
      expect(logs[0].message).toBe('Test debug message');
    });

    it('should log info messages', () => {
      logger.info('Test info message', { userId: 123 });
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test info message');
      expect(logs[0].context).toEqual({ userId: 123 });
    });

    it('should log warn messages', () => {
      logger.warn('Test warning');
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
    });

    it('should log error messages with stack', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toContain('Test error');
      expect(logs[0].stack).toBeDefined();
    });

    it('should log security messages', () => {
      logger.security('Security violation', { type: 'XSS' });
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('security');
      expect(logs[0].context).toEqual({ type: 'XSS' });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // SANITIZATION
  // ─────────────────────────────────────────────────────────────

  describe('Sanitization', () => {
    it('should redact OpenAI API keys', () => {
      logger.info('API call with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('sk-abc123');
    });

    it('should redact Google API keys', () => {
      logger.info('Using Google key AIzaSyD1234567890abcdefghijklmnopqrs');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('AIzaSy');
    });

    it('should redact JWT tokens', () => {
      logger.info('Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should redact email addresses', () => {
      logger.info('User email: user@example.com');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('user@example.com');
    });

    it('should redact SSN (US format)', () => {
      logger.info('SSN: 123-45-6789');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('123-45-6789');
    });

    it('should redact credit card numbers', () => {
      logger.info('Card: 1234567890123456');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('1234567890123456');
    });

    it('should redact password fields', () => {
      logger.info('Login with password=secret123');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('secret123');
    });

    it('should redact token fields', () => {
      logger.info('Auth token=abc123def456');
      const logs = logger.getLogs();

      expect(logs[0].message).toContain('[REDACTED]');
      expect(logs[0].message).not.toContain('abc123def456');
    });

    it('should handle multiple sensitive patterns in one message', () => {
      logger.info('User user@example.com with key sk-abc123xyz789def456ghi012jkl345mno678pqr901stu234 and token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      const logs = logger.getLogs();

      const message = logs[0].message;
      expect(message).toContain('[REDACTED]');
      expect(message).not.toContain('user@example.com');
      expect(message).not.toContain('sk-abc123');
      expect(message).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // THROTTLING
  // ─────────────────────────────────────────────────────────────

  describe('Throttling', () => {
    it('should throttle logs when limit exceeded', () => {
      // maxLogsPerMinute = 10 in test config
      for (let i = 0; i < 15; i++) {
        logger.info(`Log message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(10);
      expect(logs).toHaveLength(10);
    });

    it('should throttle per log level independently', () => {
      // Fill info level to limit
      for (let i = 0; i < 10; i++) {
        logger.info(`Info ${i}`);
      }

      // Try to add more info (should be throttled)
      logger.info('Extra info');

      // Error level should still work
      logger.error('Error message', new Error('test'));

      const logs = logger.getLogs();
      const infoLogs = logs.filter(l => l.level === 'info');
      const errorLogs = logs.filter(l => l.level === 'error');

      expect(infoLogs).toHaveLength(10); // Throttled at 10
      expect(errorLogs).toHaveLength(1); // Error not affected
    });

    it('should reset throttle after time window', async () => {
      // Mock Date.now to control time
      const originalNow = Date.now;
      let currentTime = Date.now();
      Date.now = jest.fn(() => currentTime);

      // Fill to limit
      for (let i = 0; i < 10; i++) {
        logger.info(`Log ${i}`);
      }

      // Try to add more (should be throttled)
      logger.info('Throttled log');
      expect(logger.getLogs()).toHaveLength(10);

      // Advance time by 61 seconds (past the 60s window)
      currentTime += 61000;

      // Should be able to log again
      logger.info('New window log');
      expect(logger.getLogs()).toHaveLength(11);

      // Restore
      Date.now = originalNow;
    });
  });

  // ─────────────────────────────────────────────────────────────
  // STORAGE & ROTATION
  // ─────────────────────────────────────────────────────────────

  describe('Storage & Rotation', () => {
    it('should rotate logs when max exceeded', () => {
      // maxStoredLogs = 50 in test config
      for (let i = 0; i < 60; i++) {
        logger.info(`Log ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs).toHaveLength(50); // Rotated to max
      expect(logs[0].message).toContain('Log 10'); // Oldest 10 removed
    });

    it('should persist logs to localStorage', () => {
      logger.info('Persisted log');

      // Manually trigger save (normally batched)
      logger['saveLogs']();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'titane_ui_logs',
        expect.any(String)
      );

      const saved = JSON.parse(mockLocalStorage['titane_ui_logs']);
      expect(saved).toHaveLength(1);
      expect(saved[0].message).toBe('Persisted log');
    });

    it('should load logs from localStorage on init', () => {
      // Manually set logs in localStorage
      const existingLogs = [
        {
          timestamp: Date.now(),
          level: 'info' as LogLevel,
          message: 'Existing log',
          sessionId: 'old-session',
        },
      ];
      mockLocalStorage['titane_ui_logs'] = JSON.stringify(existingLogs);

      // Create new logger instance
      const newLogger = new UILogger({ enableConsoleOverride: false });
      const logs = newLogger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Existing log');
    });

    it('should clear logs from memory and storage', () => {
      logger.info('Log 1');
      logger.info('Log 2');
      logger['saveLogs']();

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
      expect(localStorage.removeItem).toHaveBeenCalledWith('titane_ui_logs');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // FILTERING
  // ─────────────────────────────────────────────────────────────

  describe('Filtering', () => {
    beforeEach(() => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message', new Error('test'));
      logger.security('Security message');
    });

    it('should filter logs by level', () => {
      const errorLogs = logger.getLogs({ level: 'error' });
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe('error');
    });

    it('should filter logs by timestamp', () => {
      const now = Date.now();
      const recentLogs = logger.getLogs({ since: now - 1000 });
      expect(recentLogs.length).toBeGreaterThan(0);
    });

    it('should limit number of returned logs', () => {
      const limitedLogs = logger.getLogs({ limit: 3 });
      expect(limitedLogs).toHaveLength(3);
    });

    it('should combine multiple filters', () => {
      const filtered = logger.getLogs({
        level: 'info',
        since: Date.now() - 1000,
        limit: 10,
      });

      expect(filtered.every(log => log.level === 'info')).toBe(true);
    });

    it('should get recent errors only', () => {
      const recentErrors = logger.getRecentErrors(5);

      expect(recentErrors.length).toBeLessThanOrEqual(5);
      expect(recentErrors.every(log =>
        log.level === 'error' || log.level === 'security'
      )).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────────────

  describe('Statistics', () => {
    it('should calculate stats correctly', () => {
      logger.debug('Debug 1');
      logger.debug('Debug 2');
      logger.info('Info 1');
      logger.warn('Warn 1');
      logger.error('Error 1', new Error('test'));
      logger.security('Security 1');

      const stats = logger.getStats();

      expect(stats.totalLogs).toBe(6);
      expect(stats.byLevel.debug).toBe(2);
      expect(stats.byLevel.info).toBe(1);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byLevel.security).toBe(1);
      expect(stats.oldestLog).toBeDefined();
      expect(stats.newestLog).toBeDefined();
    });

    it('should handle empty logs', () => {
      const stats = logger.getStats();

      expect(stats.totalLogs).toBe(0);
      expect(stats.byLevel.debug).toBe(0);
      expect(stats.oldestLog).toBeUndefined();
      expect(stats.newestLog).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────

  describe('Export', () => {
    it('should export logs as JSON string', () => {
      logger.info('Export test 1');
      logger.warn('Export test 2');

      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].message).toBe('Export test 1');
      expect(parsed[1].message).toBe('Export test 2');
    });

    it('should export empty array when no logs', () => {
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);

      expect(parsed).toEqual([]);
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

      prodLogger.debug('Debug message'); // Should be ignored
      prodLogger.info('Info message');   // Should be logged
      prodLogger.warn('Warn message');   // Should be logged

      const logs = prodLogger.getLogs();

      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.level !== 'debug')).toBe(true);
    });

    it('should allow all levels when min level is debug', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error', new Error('test'));
      logger.security('Security');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(5);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  describe('Configuration', () => {
    it('should update config dynamically', () => {
      logger.updateConfig({ maxLogsPerMinute: 5 });

      // Fill to new limit
      for (let i = 0; i < 10; i++) {
        logger.info(`Log ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(5);
    });

    it('should disable logging when enabled=false', () => {
      logger.updateConfig({ enabled: false });

      logger.info('Should not be logged');

      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // SESSION ID
  // ─────────────────────────────────────────────────────────────

  describe('Session ID', () => {
    it('should include session ID in all logs', () => {
      logger.info('Test log');
      const logs = logger.getLogs();

      expect(logs[0].sessionId).toBeDefined();
      expect(logs[0].sessionId).toMatch(/^ui-\d+-[a-z0-9]+$/);
    });

    it('should use same session ID for all logs in same instance', () => {
      logger.info('Log 1');
      logger.warn('Log 2');
      logger.error('Log 3', new Error('test'));

      const logs = logger.getLogs();
      const sessionIds = logs.map(log => log.sessionId);

      expect(new Set(sessionIds).size).toBe(1); // All same
    });
  });
});
