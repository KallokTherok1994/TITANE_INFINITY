/**
 * TITANE∞ — Tests RetryStrategy (Phase F1)
 * Services critiques AI — withRetry, withRetryAndTimeout, isRetriableError
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

// Logger mock
const mockLogger = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  logger: mockLogger,
  createLogger: () => mockLogger,
}));

import {
  isRetriableError,
  withRetry,
  withRetryAndTimeout,
  DEFAULT_RETRY_CONFIG,
  getRetryConfig,
  PROVIDER_RETRY_CONFIGS,
} from '@/services/ai/retryStrategy';

describe('RetryStrategy', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // ── isRetriableError ──────────────────────────────────────────
  describe('isRetriableError()', () => {
    it('retourne true pour rate limit', () => {
      expect(isRetriableError(new Error('rate limit exceeded'))).toBe(true);
    });

    it('retourne true pour erreur 429', () => {
      expect(isRetriableError(new Error('HTTP 429'))).toBe(true);
    });

    it('retourne true pour timeout', () => {
      expect(isRetriableError(new Error('Request timed out'))).toBe(true);
    });

    it('retourne true pour erreur réseau ECONNREFUSED', () => {
      expect(isRetriableError(new Error('ECONNREFUSED: connection refused'))).toBe(true);
    });

    it('retourne true pour 503 Service Unavailable', () => {
      expect(isRetriableError(new Error('503 Service Unavailable'))).toBe(true);
    });

    it('retourne false pour 401 Unauthorized (non retriable)', () => {
      expect(isRetriableError(new Error('401 Unauthorized'))).toBe(false);
    });

    it('retourne false pour invalid API key (non retriable)', () => {
      expect(isRetriableError(new Error('Invalid API key'))).toBe(false);
    });

    it('retourne false pour AbortError (non retriable)', () => {
      expect(isRetriableError(new Error('AbortError: request aborted'))).toBe(false);
    });

    it('retourne false pour 400 Bad Request (non retriable)', () => {
      expect(isRetriableError(new Error('400 Bad Request'))).toBe(false);
    });

    it('retourne false pour erreur générique inconnue', () => {
      // Erreur qui ne matche ni retriable ni non-retriable → false (par défaut)
      // En réalité: seules les erreurs qui matchent retriable patterns retournent true
      expect(isRetriableError(new Error('unknown internal error'))).toBe(false);
    });
  });

  // ── DEFAULT_RETRY_CONFIG ──────────────────────────────────────
  describe('DEFAULT_RETRY_CONFIG', () => {
    it('a maxAttempts = 3', () => {
      expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
    });

    it('a backoffMultiplier = 2', () => {
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
    });

    it('maxDelayMs >= initialDelayMs', () => {
      expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBeGreaterThanOrEqual(
        DEFAULT_RETRY_CONFIG.initialDelayMs
      );
    });
  });

  // ── withRetry — succès immédiat ───────────────────────────────
  describe('withRetry() — succès immédiat', () => {
    it('retourne le résultat dès la première tentative', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 0 });
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ── withRetry — retry sur erreur retriable ────────────────────
  describe('withRetry() — retry sur erreur retriable', () => {
    it('réessaie N fois sur erreur retriable et réussit', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('rate limit exceeded'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 0 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throw après maxAttempts si toujours en erreur', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('503 Service Unavailable'));

      await expect(withRetry(fn, { maxAttempts: 3, initialDelayMs: 0 })).rejects.toThrow(
        '503 Service Unavailable'
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  // ── withRetry — erreur non retriable ─────────────────────────
  describe('withRetry() — erreur non retriable', () => {
    it('ne réessaie pas sur erreur non retriable', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('401 Unauthorized'));
      await expect(withRetry(fn, { maxAttempts: 3, initialDelayMs: 0 })).rejects.toThrow(
        '401 Unauthorized'
      );
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ── withRetry — shouldRetry override ─────────────────────────
  describe('withRetry() — shouldRetry override', () => {
    it('utilise la fonction shouldRetry custom', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('custom-error'))
        .mockResolvedValue('ok');

      const shouldRetry = vi.fn().mockReturnValue(true);
      const result = await withRetry(fn, {
        maxAttempts: 3,
        initialDelayMs: 0,
        shouldRetry,
      });
      expect(result).toBe('ok');
      expect(shouldRetry).toHaveBeenCalled();
    });
  });

  // ── withRetryAndTimeout ───────────────────────────────────────
  describe('withRetryAndTimeout()', () => {
    it('retourne le résultat si fn réussit avant timeout', async () => {
      const fn = vi.fn().mockResolvedValue('fast');
      const result = await withRetryAndTimeout(
        fn,
        { maxAttempts: 1, initialDelayMs: 0 },
        5000
      );
      expect(result).toBe('fast');
    });

    it('lance une erreur timeout si fn est trop lente', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: false });
      let settled = false;
      const fn = vi.fn().mockImplementation(
        () =>
          new Promise<string>(resolve => {
            setTimeout(() => {
              settled = true;
              resolve('late');
            }, 10000);
          })
      );

      const promise = withRetryAndTimeout(fn, { maxAttempts: 1, initialDelayMs: 0 }, 500);
      // Avancer exactement au-delà du timeout (500ms)
      vi.advanceTimersByTime(600);
      vi.useRealTimers();

      await expect(promise).rejects.toThrow(/timeout/i);
      expect(settled).toBe(false);
    });
  });

  // ── getRetryConfig ────────────────────────────────────────────
  describe('getRetryConfig()', () => {
    it('retourne la config DEFAULT pour provider inconnu', () => {
      const cfg = getRetryConfig('unknown-provider');
      expect(cfg.maxAttempts).toBe(DEFAULT_RETRY_CONFIG.maxAttempts);
    });

    it('retourne une config spécifique pour provider connu', () => {
      // Vérifier que PROVIDER_RETRY_CONFIGS a au moins un entry
      const providers = Object.keys(PROVIDER_RETRY_CONFIGS);
      if (providers.length === 0) return; // skip si vide
      const cfg = getRetryConfig(providers[0]);
      expect(cfg.maxAttempts).toBeGreaterThan(0);
    });
  });
});
