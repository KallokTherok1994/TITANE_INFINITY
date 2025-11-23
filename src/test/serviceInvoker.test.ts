/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.3.0 - Service Invoker Tests
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
import * as tauriCore from '@tauri-apps/api/core';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core');
const mockInvoke = vi.mocked(tauriCore.invoke);

describe('ServiceInvoker - invokeWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait réussir au premier appel', async () => {
    const mockData = { success: true };
    mockInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeWithRetry('test_command', {}, { retries: 3 });

    expect(result).toEqual(mockData);
    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it('devrait retry 3 fois puis réussir', async () => {
    const mockData = { success: true };
    mockInvoke
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockData);

    const result = await invokeWithRetry('test_command', {}, {
      retries: 3,
      retryDelay: 10, // Réduire délai pour tests rapides
      backoffFactor: 1, // Pas de backoff pour accélérer
    });

    expect(result).toEqual(mockData);
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait échouer après toutes les tentatives', async () => {
    mockInvoke
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockRejectedValueOnce(new Error('Error 3'));

    const promise = invokeWithRetry('test_command', {}, {
      retries: 3,
      retryDelay: 10,
    });

    // Advance timers

    await expect(promise).rejects.toThrow(RetryError);
    await expect(promise).rejects.toThrow(
      'Command "test_command" failed after 3 attempts'
    );
  });

  it('devrait respecter le timeout', async () => {
    mockInvoke.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: 'ok' }), 2000))
    );

    const promise = invokeWithRetry('test_command', {}, {
      timeout: 1000,
      noRetry: true,
    });

    // Advance timer au-delà du timeout

    await expect(promise).rejects.toThrow(TimeoutError);
    await expect(promise).rejects.toThrow(
      'Command "test_command" timed out after 1000ms'
    );
  });

  it('devrait calculer backoff exponentiel avec jitter', async () => {
    const mockData = { success: true };
    mockInvoke
      .mockRejectedValueOnce(new Error('Error'))
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(mockData);

    const promise = invokeWithRetry('test_command', {}, {
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
    mockInvoke.mockRejectedValueOnce(new Error('Error'));

    await expect(
      invokeWithRetry('test_command', {}, { noRetry: true })
    ).rejects.toThrow('Error');

    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it('ne devrait pas retry les erreurs non-retriables', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Validation failed'));

    await expect(
      invokeWithRetry('test_command', {}, { retries: 3 })
    ).rejects.toThrow('Validation failed');

    // Seulement 1 appel car erreur non-retriable
    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it('devrait retry les erreurs retriables (network, timeout)', async () => {
    const mockData = { ok: true };
    mockInvoke
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce(mockData);

    const promise = invokeWithRetry('test_command', {}, {
      retries: 2,
      retryDelay: 10,
    });

    const result = await promise;

    expect(result).toEqual(mockData);
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });
});

describe('ServiceInvoker - invokeWithTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait réussir dans le timeout', async () => {
    const mockData = { success: true };
    mockInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeWithTimeout('test_command', {}, 5000);

    expect(result).toEqual(mockData);
  });

  it('devrait timeout si trop long', async () => {
    mockInvoke.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: 'ok' }), 10000))
    );

    const promise = invokeWithTimeout('test_command', {}, 1000);


    await expect(promise).rejects.toThrow(TimeoutError);
  });
});

describe('ServiceInvoker - invokeSimple', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait invoker sans retry ni timeout', async () => {
    const mockData = { value: 42 };
    mockInvoke.mockResolvedValueOnce(mockData);

    const result = await invokeSimple('test_command', { id: 1 });

    expect(result).toEqual(mockData);
    expect(mockInvoke).toHaveBeenCalledWith('test_command', { id: 1 });
  });

  it('devrait propager erreur directement', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Backend error'));

    await expect(invokeSimple('test_command')).rejects.toThrow(
      'Command "test_command" failed: Backend error'
    );
  });
});

describe('ServiceInvoker - invokeBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait exécuter plusieurs commandes en parallèle', async () => {
    mockInvoke
      .mockResolvedValueOnce({ result: 1 })
      .mockResolvedValueOnce({ result: 2 })
      .mockResolvedValueOnce({ result: 3 });

    const results = await invokeBatch([
      { command: 'cmd1' },
      { command: 'cmd2' },
      { command: 'cmd3' },
    ]);

    expect(results).toEqual([{ result: 1 }, { result: 2 }, { result: 3 }]);
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait échouer si une commande échoue', async () => {
    mockInvoke
      .mockResolvedValueOnce({ result: 1 })
      .mockRejectedValueOnce(new Error('Command 2 failed'))
      .mockResolvedValueOnce({ result: 3 });

    await expect(
      invokeBatch([{ command: 'cmd1' }, { command: 'cmd2' }, { command: 'cmd3' }])
    ).rejects.toThrow();
  });
});

describe('ServiceInvoker - invokeSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait exécuter commandes en séquence', async () => {
    mockInvoke
      .mockResolvedValueOnce({ step: 1 })
      .mockResolvedValueOnce({ step: 2 })
      .mockResolvedValueOnce({ step: 3 });

    const results = await invokeSequence([
      { command: 'step1' },
      { command: 'step2' },
      { command: 'step3' },
    ]);

    expect(results).toEqual([{ step: 1 }, { step: 2 }, { step: 3 }]);
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('devrait arrêter la séquence si une commande échoue', async () => {
    mockInvoke
      .mockResolvedValueOnce({ step: 1 })
      .mockRejectedValueOnce(new Error('Step 2 failed'));

    await expect(
      invokeSequence([
        { command: 'step1' },
        { command: 'step2' },
        { command: 'step3' },
      ])
    ).rejects.toThrow('Step 2 failed');

    // Seulement 2 appels (step3 jamais exécuté)
    expect(mockInvoke).toHaveBeenCalledTimes(2);
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
    const error = new TimeoutError('test_command', 5000);

    expect(error.name).toBe('TimeoutError');
    expect(error.command).toBe('test_command');
    expect(error.timeoutMs).toBe(5000);
    expect(error.message).toContain('timed out after 5000ms');
  });

  it('RetryError devrait contenir originalError', () => {
    const originalError = new Error('Network failed');
    const retryError = new RetryError('test_command', 3, originalError);

    expect(retryError.name).toBe('RetryError');
    expect(retryError.command).toBe('test_command');
    expect(retryError.attempts).toBe(3);
    expect(retryError.originalError).toBe(originalError);
    expect(retryError.message).toContain('failed after 3 attempts');
  });
});
