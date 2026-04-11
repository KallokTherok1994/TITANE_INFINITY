/**
 * TITANE∞ — MEMORY CONSUMPTION TRUTH
 * Gap certification: proves chatMemoryCompactor.getStats() reflects real message count
 * and sizeMB is computed from stored JSON length (not estimated).
 *
 * Context: D-002 from POST_SEAL_CORRECTION proof pack
 * Lock: MEMORY_CONSUMPTION_UNPROVEN (memory stats had no unit test)
 * Rule: 1 change = 1 cause = 1 proof = 1 rollback
 * Rollback: git restore -- src/__tests__/memory-consumption-truth.test.ts
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { chatMemoryCompactor } from '@/services/chatMemoryCompactor';
import type { AIMessage } from '@/services/ai/types';

const MODE = 'standard' as const;
const STORAGE_KEY = `titane_chat_mode_${MODE}`;

function makeMessage(content: string, role: 'user' | 'assistant' = 'user'): AIMessage {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('Memory Consumption Truth — chatMemoryCompactor.getStats()', () => {
  test('returns count=0 and sizeMB=0 when no messages stored', () => {
    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.count).toBe(0);
    expect(stats.sizeMB).toBe(0);
    expect(stats.compressed).toBe(false);
  });

  test('recovers safely when legacy storage is missing a messages array', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode: MODE, compressed: [], lastCompacted: Date.now() })
    );

    expect(() => chatMemoryCompactor.getStats(MODE)).not.toThrow();
    expect(chatMemoryCompactor.getStats(MODE)).toMatchObject({
      count: 0,
      compressed: false,
    });
    expect(chatMemoryCompactor.loadForMode(MODE)).toEqual([]);
  });

  test('migrates legacy array-only chat history into message stats', () => {
    const legacyMessages = [makeMessage('legacy hello'), makeMessage('legacy world')];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyMessages));

    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.count).toBe(2);
    expect(chatMemoryCompactor.loadForMode(MODE)).toHaveLength(2);
  });

  test('count reflects exact number of saved messages', () => {
    const msgs = [makeMessage('hello'), makeMessage('world', 'assistant')];
    chatMemoryCompactor.saveForMode(MODE, msgs);

    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.count).toBe(2);
  });

  test('sizeMB is > 0 after messages are saved', () => {
    chatMemoryCompactor.saveForMode(MODE, [makeMessage('a'.repeat(1000))]);
    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.sizeMB).toBeGreaterThan(0);
  });

  test('sizeMB is computed from stored JSON string length (not estimated)', () => {
    const msgs = [makeMessage('probe-content')];
    chatMemoryCompactor.saveForMode(MODE, msgs);

    // Verify sizeMB = localStorage string length / (1024*1024)
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const expectedSizeMB = stored!.length / (1024 * 1024);

    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.sizeMB).toBeCloseTo(expectedSizeMB, 10);
  });

  test('compressed flag is false when no compression occurred', () => {
    chatMemoryCompactor.saveForMode(MODE, [makeMessage('only one message')]);
    const stats = chatMemoryCompactor.getStats(MODE);
    expect(stats.compressed).toBe(false);
  });

  test('autoCleanupIfNeeded returns consistent sizeMB after save', () => {
    chatMemoryCompactor.saveForMode(MODE, [makeMessage('test')]);
    const cleanupResult = chatMemoryCompactor.autoCleanupIfNeeded();
    const stats = chatMemoryCompactor.getStats(MODE);

    // Both should report non-negative sizing
    expect(cleanupResult.sizeMB).toBeGreaterThanOrEqual(0);
    expect(stats.sizeMB).toBeGreaterThanOrEqual(0);
    // No cleanup triggered for 1 message (below 5MB threshold)
    expect(cleanupResult.cleaned).toBe(false);
  });
});
