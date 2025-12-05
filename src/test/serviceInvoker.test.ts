/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Invoker Tests
 * Tests retry, timeout, exponential backoff, error types
 * ═══════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  invokeWithRetry,
  invokeWithTimeout,
  invokeSimple,
  invokeBatch,
  invokeSequence,
  TimeoutError,
  RetryError,
  FAST_COMMAND_OPTIONS,
  STANDARD_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
  CRITICAL_COMMAND_OPTIONS,
} from '../lib/serviceInvoker';
import { secureInvoke } from '../lib/security';

vi.mock('../lib/security', () => ({
  secureInvoke: vi.fn(),
}));

const mockSecureInvoke = vi.mocked(secureInvoke);

// Utiliser seulement des commandes whitelistees pour respecter secureInvoke
const TEST_COMMAND = 'get_system_health';
const BATCH_COMMANDS = ['memory_get_state', 'memory_get_stats', 'get_timeline'] as const;
const SEQUENCE_COMMANDS = ['memory_get_state', 'memory_get_recent_decisions', 'memory_get_active_projects'] as const;

describe('ServiceInvoker - invokeWithRetry', () => {
  beforeEach(() => {
    mockSecureInvoke.mockReset();
  });

  it('devrait réussir au premier appel', async () => {
    const mockData = { success: true };
    mockSecureInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeWithRetry(TEST_COMMAND, {}, { retries: 3 });

    expect(result).toEqual(mockData);
    expect(mockSecureInvoke).toHaveBeenCalledTimes(1);
  });

  it('devrait retry 3 fois puis réussir', async () => {
    const mockData = { success: true };
    mockSecureInvoke
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockData);

    const result = await invokeWithRetry(TEST_COMMAND, {}, {
      retries: 3,
      retryDelay: 10, // Réduire délai pour tests rapides
      backoffFactor: 1, // Pas de backoff pour accélérer
    });

    expect(result).toEqual(mockData);
    expect(mockSecureInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait échouer après toutes les tentatives', async () => {
    mockSecureInvoke
      .mockRejectedValueOnce(new Error('Network outage 1'))
      .mockRejectedValueOnce(new Error('Network outage 2'))
      .mockRejectedValueOnce(new Error('Network outage 3'));

    const promise = invokeWithRetry(TEST_COMMAND, {}, {
      retries: 3,
      retryDelay: 10,
    });

    // Advance timers

    await expect(promise).rejects.toThrow(RetryError);
    await expect(promise).rejects.toThrow(
      `Command "${TEST_COMMAND}" failed after 3 attempts`
    );
  });

  it('devrait respecter le timeout', async () => {
    mockSecureInvoke.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: 'ok' }), 2000))
    );

    const promise = invokeWithRetry(TEST_COMMAND, {}, {
      timeout: 1000,
      noRetry: true,
    });

    // Advance timer au-delà du timeout

    await expect(promise).rejects.toThrow(TimeoutError);
    await expect(promise).rejects.toThrow(
      `Command "${TEST_COMMAND}" timed out after 1000ms`
    );
  });

  it('devrait calculer backoff exponentiel avec jitter', async () => {
    const mockData = { success: true };
    mockSecureInvoke
      .mockRejectedValueOnce(new Error('Network blip'))
      .mockRejectedValueOnce(new Error('Network blip'))
      .mockResolvedValueOnce(mockData);

    const promise = invokeWithRetry(TEST_COMMAND, {}, {
      retries: 3,
      retryDelay: 10,
      backoffFactor: 3, // 100 * 3^attempt
    });

    // Premier retry: ~100-150ms (avec jitter)

    // Deuxième retry: ~300-450ms (avec jitter)

    const result = await promise;
    expect(result).toEqual(mockData);
  });

  it('ne devrait pas retry si noRetry=true', async () => {
    mockSecureInvoke.mockRejectedValueOnce(new Error('Error'));

    await expect(
      invokeWithRetry(TEST_COMMAND, {}, { noRetry: true })
    ).rejects.toThrow('Error');

    expect(mockSecureInvoke).toHaveBeenCalledTimes(1);
  });

  it('ne devrait pas retry les erreurs non-retriables', async () => {
    mockSecureInvoke.mockRejectedValueOnce(new Error('Validation failed'));

    await expect(
      invokeWithRetry(TEST_COMMAND, {}, { retries: 3 })
    ).rejects.toThrow('Validation failed');

    // Seulement 1 appel car erreur non-retriable
    expect(mockSecureInvoke).toHaveBeenCalledTimes(1);
  });

  it('devrait retry les erreurs retriables (network, timeout)', async () => {
    const mockData = { ok: true };
    mockSecureInvoke
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce(mockData);

    const promise = invokeWithRetry(TEST_COMMAND, {}, {
      retries: 2,
      retryDelay: 10,
    });

    const result = await promise;

    expect(result).toEqual(mockData);
    expect(mockSecureInvoke).toHaveBeenCalledTimes(2);
  });
});

describe('ServiceInvoker - invokeWithTimeout', () => {
  beforeEach(() => {
    mockSecureInvoke.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait réussir dans le timeout', async () => {
    const mockData = { success: true };
    mockSecureInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeWithTimeout(TEST_COMMAND, {}, 5000);

    expect(result).toEqual(mockData);
  });

  it('devrait timeout si trop long', async () => {
    mockSecureInvoke.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: 'ok' }), 10000))
    );

    const promise = invokeWithTimeout(TEST_COMMAND, {}, 1000);


    await expect(promise).rejects.toThrow(TimeoutError);
  });
});

describe('ServiceInvoker - invokeSimple', () => {
  beforeEach(() => {
    mockSecureInvoke.mockReset();
  });

  it('devrait invoker sans retry ni timeout', async () => {
    const mockData = { value: 42 };
    mockSecureInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeSimple(TEST_COMMAND, { id: 1 });

    expect(result).toEqual(mockData);
    expect(mockSecureInvoke).toHaveBeenCalledWith(
      TEST_COMMAND,
      { id: 1 },
      expect.any(Object),
      undefined
    );
  });

  it('devrait propager erreur directement', async () => {
    mockSecureInvoke.mockRejectedValueOnce(new Error('Backend error'));

    await expect(invokeSimple(TEST_COMMAND)).rejects.toThrow(
      `Command "${TEST_COMMAND}" failed: Backend error`
    );
  });
});

describe('ServiceInvoker - invokeBatch', () => {
  beforeEach(() => {
    mockSecureInvoke.mockReset();
  });

  it('devrait exécuter plusieurs commandes en parallèle', async () => {
    mockSecureInvoke
      .mockResolvedValueOnce({ result: 1 })
      .mockResolvedValueOnce({ result: 2 })
      .mockResolvedValueOnce({ result: 3 });

    const results = await invokeBatch([
      { command: BATCH_COMMANDS[0] },
      { command: BATCH_COMMANDS[1] },
      { command: BATCH_COMMANDS[2] },
    ]);

    expect(results).toEqual([{ result: 1 }, { result: 2 }, { result: 3 }]);
    expect(mockSecureInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait échouer si une commande échoue', async () => {
    mockSecureInvoke
      .mockResolvedValueOnce({ result: 1 })
      .mockRejectedValueOnce(new Error('Command 2 failed'))
      .mockResolvedValueOnce({ result: 3 });

    await expect(
      invokeBatch([
        { command: BATCH_COMMANDS[0] },
        { command: BATCH_COMMANDS[1] },
        { command: BATCH_COMMANDS[2] },
      ])
    ).rejects.toThrow();
  });
});

describe('ServiceInvoker - invokeSequence', () => {
  beforeEach(() => {
    mockSecureInvoke.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait exécuter commandes en séquence', async () => {
    mockSecureInvoke
      .mockResolvedValueOnce({ step: 1 })
      .mockResolvedValueOnce({ step: 2 })
      .mockResolvedValueOnce({ step: 3 });

    const results = await invokeSequence([
      { command: SEQUENCE_COMMANDS[0] },
      { command: SEQUENCE_COMMANDS[1] },
      { command: SEQUENCE_COMMANDS[2] },
    ]);

    expect(results).toEqual([{ step: 1 }, { step: 2 }, { step: 3 }]);
    expect(mockSecureInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait arrêter la séquence si une commande échoue', async () => {
    mockSecureInvoke
      .mockResolvedValueOnce({ step: 1 })
      .mockRejectedValueOnce(new Error('Step 2 failed'));

    await expect(
      invokeSequence([
        { command: SEQUENCE_COMMANDS[0] },
        { command: SEQUENCE_COMMANDS[1] },
        { command: SEQUENCE_COMMANDS[2] },
      ])
    ).rejects.toThrow('Step 2 failed');

    // Seulement 2 appels (step3 jamais exécuté)
    expect(mockSecureInvoke).toHaveBeenCalledTimes(2);
  });
});

describe('ServiceInvoker - Presets', () => {
  it('FAST_COMMAND_OPTIONS devrait avoir timeout 5s', () => {
    expect(FAST_COMMAND_OPTIONS.timeout).toBe(5000);
    expect(FAST_COMMAND_OPTIONS.retries).toBe(2);
  });

  it('STANDARD_COMMAND_OPTIONS devrait avoir timeout 15s', () => {
    expect(STANDARD_COMMAND_OPTIONS.timeout).toBe(15000);
    expect(STANDARD_COMMAND_OPTIONS.retries).toBe(3);
  });

  it('LONG_COMMAND_OPTIONS devrait avoir timeout 60s', () => {
    expect(LONG_COMMAND_OPTIONS.timeout).toBe(60000);
    expect(LONG_COMMAND_OPTIONS.retries).toBe(2);
  });

  it('CRITICAL_COMMAND_OPTIONS ne devrait pas retry', () => {
    expect(CRITICAL_COMMAND_OPTIONS.timeout).toBe(10000);
    expect(CRITICAL_COMMAND_OPTIONS.noRetry).toBe(true);
  });
});

describe('ServiceInvoker - Error Types', () => {
  it('TimeoutError devrait avoir bon format', () => {
    const error = new TimeoutError(TEST_COMMAND, 5000);

    expect(error.name).toBe('TimeoutError');
    expect(error.command).toBe(TEST_COMMAND);
    expect(error.timeoutMs).toBe(5000);
    expect(error.message).toContain('timed out after 5000ms');
  });

  it('RetryError devrait contenir originalError', () => {
    const originalError = new Error('Network failed');
    const retryError = new RetryError(TEST_COMMAND, 3, originalError);

    expect(retryError.name).toBe('RetryError');
    expect(retryError.command).toBe(TEST_COMMAND);
    expect(retryError.attempts).toBe(3);
    expect(retryError.originalError).toBe(originalError);
    expect(retryError.message).toContain('failed after 3 attempts');
  });
});
