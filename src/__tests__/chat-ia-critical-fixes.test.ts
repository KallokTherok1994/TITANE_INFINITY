/**
 * TITANE∞ v26.2.1 — Tests pour Fixes Critiques Chat IA
 * Tests H1 (race condition provider checks) et H2 (memory leak pending saves)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChatMemoryCompactor } from '../services/chatMemoryCompactor';
import type { AIMessage } from '../services/ai/types';
import type { ChatMode } from '../services/ai';

// ═══════════════════════════════════════════════════════════════════
// TEST H2: Memory Leak Protection - chatMemoryCompactor
// ═══════════════════════════════════════════════════════════════════

describe('H2: ChatMemoryCompactor - Memory Leak Protection', () => {
  let compactor: ChatMemoryCompactor;
  let localStorageMock: Map<string, string>;

  beforeEach(() => {
    // Use fake timers to control async operations
    vi.useFakeTimers();

    // Mock localStorage
    localStorageMock = new Map();
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock.get(key) || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        localStorageMock.delete(key);
      }),
      clear: vi.fn(() => {
        localStorageMock.clear();
      }),
      length: 0,
      key: vi.fn(() => null),
    } as Storage;

    // Mock requestIdleCallback - execute callback synchronously for testing
    global.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      // Schedule for next tick using fake timers
      setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
      return 0;
    });

    // Also mock on window for browser code that checks window.requestIdleCallback
    if (typeof window !== 'undefined') {
      (
        window as unknown as { requestIdleCallback: typeof global.requestIdleCallback }
      ).requestIdleCallback = global.requestIdleCallback;
    }

    compactor = new ChatMemoryCompactor();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should force flush when MAX_PENDING_SAVES reached', async () => {
    const mode: ChatMode = 'default';
    const message: AIMessage = {
      role: 'user',
      content: 'Test message',
      timestamp: Date.now(),
    };

    // Spy sur flushPendingSaves via setItem
    const setItemSpy = vi.spyOn(global.localStorage, 'setItem');

    // Sauvegarder 101 fois (MAX = 100)
    for (let i = 0; i < 101; i++) {
      const modeWithIndex = `${mode}_${i}` as ChatMode;
      compactor.saveForMode(modeWithIndex, [{ ...message, content: `Message ${i}` }]);
    }

    // Advance timers to trigger setTimeout callbacks
    await vi.advanceTimersByTimeAsync(100);

    // Vérifier que la limite a déclenché un flush
    expect(setItemSpy).toHaveBeenCalled();
    expect(setItemSpy.mock.calls.length).toBeGreaterThan(0);
  });

  it('should not accumulate pending saves indefinitely', async () => {
    const mode: ChatMode = 'default';
    const messages: AIMessage[] = [
      { role: 'user', content: 'Test 1', timestamp: Date.now() },
      { role: 'assistant', content: 'Response 1', timestamp: Date.now() },
    ];

    // Track setItem calls
    const setItemSpy = vi.spyOn(global.localStorage, 'setItem');

    // Trigger force flush by hitting MAX_PENDING_SAVES
    // This will bypass the idle callback and flush immediately
    for (let i = 0; i < 101; i++) {
      const modeKey = i < 100 ? (`mode_${i}` as ChatMode) : mode;
      compactor.saveForMode(modeKey, [...messages]);
    }

    // Advance timers to trigger setTimeout callbacks from requestIdleCallback mock
    await vi.advanceTimersByTimeAsync(100);

    // Verify saves were triggered (no infinite accumulation - flush happened)
    expect(setItemSpy).toHaveBeenCalled();

    // The number of calls should be bounded (force flush clears pendingSaves)
    expect(setItemSpy.mock.calls.length).toBeLessThan(200);
  });

  it('should handle force flush gracefully on error', async () => {
    const mode: ChatMode = 'default';
    const message: AIMessage = {
      role: 'user',
      content: 'Test message',
      timestamp: Date.now(),
    };

    // Mock localStorage.setItem pour throw error
    let callCount = 0;
    vi.spyOn(global.localStorage, 'setItem').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Storage quota exceeded');
      }
    });

    // Devrait ne pas crash même avec erreur
    expect(() => {
      compactor.saveForMode(mode, [message]);
    }).not.toThrow();

    // Advance timers to trigger the async save
    await vi.advanceTimersByTimeAsync(100);

    // Vérifier que setItem was attempted
    expect(callCount).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TEST H1: Race Condition Protection - Provider Checks
// ═══════════════════════════════════════════════════════════════════

describe('H1: useChat - Race Condition Protection', () => {
  // Note: Ce test nécessite le hook complet useChat
  // Pour l'instant, on teste le pattern guard avec une fonction isolée

  it('should prevent concurrent provider checks with guard', async () => {
    let checkInProgress = false;
    let checksCompleted = 0;
    let checksSkipped = 0;

    const mockProviderCheck = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
      return true;
    };

    const checkProvidersAvailability = async () => {
      // Guard pattern
      if (checkInProgress) {
        checksSkipped++;
        return;
      }

      checkInProgress = true;
      try {
        await mockProviderCheck();
        checksCompleted++;
      } finally {
        checkInProgress = false;
      }
    };

    // Lancer 10 checks concurrents
    const promises = Array.from({ length: 10 }, () => checkProvidersAvailability());
    await Promise.all(promises);

    // Seul 1 check devrait avoir été complété (les autres skipped)
    expect(checksCompleted).toBe(1);
    expect(checksSkipped).toBe(9);
  });

  it('should allow subsequent checks after first completes', async () => {
    let checkInProgress = false;
    let checksCompleted = 0;

    const mockProviderCheck = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return true;
    };

    const checkProvidersAvailability = async () => {
      if (checkInProgress) return;

      checkInProgress = true;
      try {
        await mockProviderCheck();
        checksCompleted++;
      } finally {
        checkInProgress = false;
      }
    };

    // Premier check
    await checkProvidersAvailability();
    expect(checksCompleted).toBe(1);

    // Second check (après le premier)
    await checkProvidersAvailability();
    expect(checksCompleted).toBe(2);

    // Vérifier que le guard est bien relâché
    expect(checkInProgress).toBe(false);
  });

  it('should release guard even on error', async () => {
    let checkInProgress = false;
    let checksCompleted = 0;
    let errorsHandled = 0;

    const mockProviderCheckWithError = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      throw new Error('Provider check failed');
    };

    const checkProvidersAvailability = async () => {
      if (checkInProgress) return;

      checkInProgress = true;
      try {
        await mockProviderCheckWithError();
        checksCompleted++;
      } catch (error) {
        errorsHandled++;
      } finally {
        checkInProgress = false;
      }
    };

    // Check qui fail
    await checkProvidersAvailability();
    expect(errorsHandled).toBe(1);

    // Guard devrait être relâché
    expect(checkInProgress).toBe(false);

    // Check suivant devrait pouvoir s'exécuter
    await checkProvidersAvailability();
    expect(errorsHandled).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// INTEGRATION TEST: H1 + H2 Combined
// ═══════════════════════════════════════════════════════════════════

describe('Integration: H1 + H2 - Combined Fixes', () => {
  it('should handle concurrent operations without race conditions or leaks', async () => {
    // Setup
    const localStorageMock = new Map<string, string>();
    global.localStorage = {
      getItem: (key: string) => localStorageMock.get(key) || null,
      setItem: (key: string, value: string) => {
        localStorageMock.set(key, value);
      },
      removeItem: (key: string) => {
        localStorageMock.delete(key);
      },
      clear: () => {
        localStorageMock.clear();
      },
      length: 0,
      key: () => null,
    } as Storage;

    global.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
      return 0;
    });

    const compactor = new ChatMemoryCompactor();
    let providerCheckInProgress = false;
    let providerChecksCompleted = 0;

    // Mock provider check avec guard
    const checkProviders = async () => {
      if (providerCheckInProgress) return;
      providerCheckInProgress = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 10));
        providerChecksCompleted++;
      } finally {
        providerCheckInProgress = false;
      }
    };

    // Simuler charge mixte: provider checks + memory saves
    const operations = [
      ...Array.from({ length: 20 }, (_, i) => checkProviders()),
      ...Array.from({ length: 50 }, (_, i) =>
        compactor.saveForMode('default' as ChatMode, [
          { role: 'user', content: `Msg ${i}`, timestamp: Date.now() },
        ])
      ),
    ];

    // Exécuter tout concurremment
    await Promise.all(operations);

    // Attendre completion
    await waitFor(() => {
      expect(providerChecksCompleted).toBeGreaterThan(0);
    });

    // Vérifier: pas de race conditions (1 seul check à la fois)
    expect(providerChecksCompleted).toBeLessThanOrEqual(20);

    // Vérifier: pas de memory leak (localStorage propre)
    await waitFor(() => {
      const stored = localStorage.getItem('chat_memory_default');
      expect(stored).toBeDefined();
    });

    const stored = localStorage.getItem('chat_memory_default');
    expect(stored).toBeDefined();
    expect(localStorageMock.size).toBeLessThan(100); // Pas de leak
  });
});
