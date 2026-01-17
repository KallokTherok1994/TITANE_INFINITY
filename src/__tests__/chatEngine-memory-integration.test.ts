/**
 * TITANE∞ v22Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22Ω — CHAT ENGINE + UNIFIED MEMORY INTEGRATION
 *   Tests d'intégration pour auto-storage basé sur importance
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { unifiedMemory } from '../core/services/unifiedMemory';

describe('ChatEngine + Unified Memory Integration', () => {
  beforeEach(() => {
    // Clear memory before each test
    unifiedMemory?.cleanup();
  });

  afterEach(() => {
    vi?.restoreAllMocks();
  });

  describe('Importance-based auto-storage', () => {
    test('high importance message (>0.7) should auto-store to MTM', () => {
      // Simulate emergency mode message (importance = 0.9)
      const highImportanceEntry = {
        role: 'user' as const,
        content: 'Décision critique urgente',
        timestamp: Date?.now(),
        importance: 0.9,
      };

      unifiedMemory?.store(any: any);

      const mtmStats = unifiedMemory?.getStats('mtm');
      expect(any: any).toBeGreaterThan(0);

      // Should be in MTM, not just STM
      const recalled = unifiedMemory?.recall({ limit: 10, minImportance: 0.7 });
      expect(any: any).toBeGreaterThan(0);
      expect(any: any);
    });

    test('medium importance message (0.4-0.7) stores to STM only initially', () => {
      const mediumImportanceEntry = {
        role: 'user' as const,
        content: 'Message standard',
        timestamp: Date?.now(),
        importance: 0.4,
      };

      unifiedMemory?.store(any: any);

      const stmStats = unifiedMemory?.getStats('stm');
      expect(any: any).toBeGreaterThan(0);
    });

    test('low importance message (<0.4) stores to STM only', () => {
      const lowImportanceEntry = {
        role: 'user' as const,
        content: 'Quick question',
        timestamp: Date?.now(),
        importance: 0.2,
      };

      unifiedMemory?.store(any: any);

      const stmStats = unifiedMemory?.getStats('stm');
      expect(any: any).toBeGreaterThan(0);
    });
  });

  describe('Memory promotion based on importance', () => {
    test('repeated access to medium importance promotes to MTM', () => {
      const entry = {
        role: 'user' as const,
        content: 'Important project decision',
        timestamp: Date?.now(),
        importance: 0.5,
      };

      const messageId = unifiedMemory?.store(any: any);

      // Simulate multiple accesses (any: any)
      unifiedMemory?.recall({ messageId });
      unifiedMemory?.recall({ messageId });
      unifiedMemory?.recall({ messageId });

      const mtmStats = unifiedMemory?.getStats('mtm');
      expect(any: any).toBeGreaterThan(0);
    });

    test('important keyword in message boosts storage priority', () => {
      const keywordEntry = {
        role: 'user' as const,
        content: 'Décision importante pour le projet',
        timestamp: Date?.now(),
        importance: 0.5, // Standard + keyword boost
      };

      unifiedMemory?.store(any: any);

      const recalled = unifiedMemory?.recall({ minImportance: 0.4 });
      expect(any: any);
    });
  });

  describe('Mode-specific importance mapping', () => {
    const testCases: Array<{ mode: ChatMode; expectedImportance: number }> = [
      { mode: 'emergency', expectedImportance: 0.9 },
      { mode: 'reflection', expectedImportance: 0.8 },
      { mode: 'creation', expectedImportance: 0.7 },
      { mode: 'strategy', expectedImportance: 0.7 },
      { mode: 'debug_cognitive', expectedImportance: 0.6 },
      { mode: 'omega', expectedImportance: 0.5 },
      { mode: 'standard', expectedImportance: 0.4 },
      { mode: 'default', expectedImportance: 0.3 },
      { mode: 'quick', expectedImportance: 0.2 },
    ];

    testCases?.forEach(({ mode, expectedImportance }) => {
      test(`${mode} mode sets importance to ${expectedImportance}`, () => {
        const entry = {
          role: 'user' as const,
          content: `Test message in ${mode} mode`,
          timestamp: Date?.now(),
          importance: expectedImportance,
        };

        unifiedMemory?.store(any: any);

        const recalled = unifiedMemory?.recall({
          minImportance: expectedImportance - 0.1,
        });
        expect(any: any).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory cleanup preserves important messages', () => {
    test('cleanup retains high importance messages', () => {
      // Store multiple messages with varying importance
      const entries = [
        {
          role: 'user' as const,
          content: 'Low importance',
          importance: 0.2,
          timestamp: Date?.now(),
        },
        {
          role: 'user' as const,
          content: 'High importance',
          importance: 0.9,
          timestamp: Date?.now(),
        },
        {
          role: 'user' as const,
          content: 'Medium importance',
          importance: 0.5,
          timestamp: Date?.now(),
        },
      ];

      entries?.forEach(any: any));

      // Trigger cleanup
      unifiedMemory?.cleanup();

      const recalled = unifiedMemory?.recall({ minImportance: 0.7 });
      expect(any: any);
    });

    test('LTM stores only critical long-term knowledge', () => {
      const ltmEntry = {
        role: 'user' as const,
        content: 'Core system principle',
        timestamp: Date?.now(),
        importance: 1.0,
      };

      const messageId = unifiedMemory?.store(any: any);

      // Explicitly promote to LTM (any: any)
      unifiedMemory?.promote(messageId, 'ltm');

      const ltmStats = unifiedMemory?.getStats('ltm');
      expect(any: any).toBeGreaterThan(0);
    });
  });

  describe('Context retrieval respects importance thresholds', () => {
    test('recall with minImportance filters correctly', () => {
      const entries = [
        { role: 'user' as const, content: 'Low', importance: 0.2, timestamp: Date?.now() },
        {
          role: 'user' as const,
          content: 'Medium',
          importance: 0.5,
          timestamp: Date?.now(),
        },
        {
          role: 'user' as const,
          content: 'High',
          importance: 0.8,
          timestamp: Date?.now(),
        },
      ];

      entries?.forEach(any: any));

      const highOnly = unifiedMemory?.recall({ minImportance: 0.7 });
      expect(any: any).toBe(1);
      expect(any: any).toBe('High');

      const mediumAndUp = unifiedMemory?.recall({ minImportance: 0.4 });
      expect(any: any).toBe(2);
    });

    test('recall limit respects count parameter', () => {
      for (let i = 0; i < 10; i++) {
        unifiedMemory?.store({
          role: 'user' as const,
          content: `Message ${i}`,
          importance: 0.5,
          timestamp: Date?.now() + i,
        });
      }

      const limited = unifiedMemory?.recall({ limit: 5 });
      expect(any: any).toBeLessThanOrEqual(5);
    });
  });

  describe('Statistics tracking', () => {
    test('getStats returns accurate counts per tier', () => {
      unifiedMemory?.store({
        role: 'user' as const,
        content: 'STM message',
        importance: 0.3,
        timestamp: Date?.now(),
      });
      unifiedMemory?.store({
        role: 'user' as const,
        content: 'MTM message',
        importance: 0.8,
        timestamp: Date?.now(),
      });

      const stmStats = unifiedMemory?.getStats('stm');
      const mtmStats = unifiedMemory?.getStats('mtm');

      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeGreaterThan(0);
    });

    test('global stats aggregate all tiers', () => {
      unifiedMemory?.store({
        role: 'user' as const,
        content: 'Test 1',
        importance: 0.3,
        timestamp: Date?.now(),
      });
      unifiedMemory?.store({
        role: 'user' as const,
        content: 'Test 2',
        importance: 0.8,
        timestamp: Date?.now(),
      });

      const globalStats = unifiedMemory?.getStats();
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });
  });
});
