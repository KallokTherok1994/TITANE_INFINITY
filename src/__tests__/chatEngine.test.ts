/**
 * TITANE∞ v22Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22Ω — CHAT ENGINE TESTS
 *   Tests unitaires pour chatEngine.ts
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { chatEngine } from '@/services/ai/chatEngine';

describe('ChatEngine — calculateImportance', () => {
  test('reflection mode returns high importance (0.8)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('reflection', 'Test message');
    expect(importance).toBe(0.8);
  });

  test('creation mode returns 0.7', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('creation', 'Test message');
    expect(importance).toBe(0.7);
  });

  test('strategy mode returns 0.7', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('strategy', 'Test message');
    expect(importance).toBe(0.7);
  });

  test('emergency mode returns highest importance (0.9)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('emergency', 'Test message');
    expect(importance).toBe(0.9);
  });

  test('quick mode returns low importance (0.2)', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('quick', 'Test message');
    expect(importance).toBe(0.2);
  });

  test('standard mode returns 0.4', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Test message');
    expect(importance).toBe(0.4);
  });

  test('default mode returns 0.3', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('default', 'Test message');
    expect(importance).toBe(0.3);
  });

  test('omega mode returns 0.5', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('omega', 'Test message');
    expect(importance).toBe(0.5);
  });

  test('debug_cognitive mode returns 0.6', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('debug_cognitive', 'Test message');
    expect(importance).toBe(0.6);
  });
});

describe('ChatEngine — importance boosting keywords', () => {
  test('keyword "décision" boosts importance by 0.1', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Prise de décision importante'
    );
    expect(importance).toBe(0.5); // 0.4 + 0.1
  });

  test('keyword "important" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Message important');
    expect(importance).toBe(0.5); // 0.4 + 0.1
  });

  test('keyword "urgent" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Action urgente requise'
    );
    expect(importance).toBe(0.5);
  });

  test('keyword "critique" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Situation critique');
    expect(importance).toBe(0.5);
  });

  test('keyword "projet" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Avancement du projet');
    expect(importance).toBe(0.5);
  });

  test('keyword "objectif" boosts importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Atteinte des objectifs'
    );
    expect(importance).toBe(0.5);
  });

  test('multiple keywords boost importance only once', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'standard',
      'Décision importante et urgente pour le projet'
    );
    expect(importance).toBe(0.5); // 0.4 + 0.1 (not +0.3)
  });
});

describe('ChatEngine — length-based importance boost', () => {
  test('short message (<200 chars) does not boost importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', 'Short message');
    expect(importance).toBe(0.4); // Base only
  });

  test('long message (>200 chars) boosts importance by 0.05', () => {
    const longMessage = 'A'.repeat(201);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', longMessage);
    expect(importance).toBe(0.45); // 0.4 + 0.05
  });

  test('long message with keyword gets both boosts', () => {
    const longMessage = 'Décision importante. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', longMessage);
    expect(importance).toBe(0.55); // 0.4 + 0.1 (keyword) + 0.05 (length)
  });
});

describe('ChatEngine — importance capping', () => {
  test('importance never exceeds 1.0', () => {
    const longMessageWithKeywords =
      'Décision importante urgente critique projet objectif. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance(
      'emergency',
      longMessageWithKeywords
    );
    expect(importance).toBe(1.0); // Capped at 1.0, not 0.9 + 0.1 + 0.05 = 1.05
  });

  test('reflection mode with all boosts caps at 1.0', () => {
    const maxMessage = 'Décision importante. ' + 'A'.repeat(200);
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('reflection', maxMessage);
    expect(importance).toBeCloseTo(0.95, 2); // 0.8 + 0.1 + 0.05, < 1.0
  });

  test('emergency mode with keyword reaches exactly 1.0', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('emergency', 'Décision critique');
    expect(importance).toBe(1.0); // 0.9 + 0.1 = 1.0
  });
});

describe('ChatEngine — edge cases', () => {
  test('empty message returns mode base importance', () => {
    // @ts-expect-error: accessing private method for testing
    const importance = chatEngine.calculateImportance('standard', '');
    expect(importance).toBe(0.4);
  });

  test('case-insensitive keyword matching', () => {
    // @ts-expect-error: accessing private method for testing
    const importanceUpper = chatEngine.calculateImportance(
      'standard',
      'DÉCISION IMPORTANTE'
    );
    // @ts-expect-error: accessing private method for testing
    const importanceLower = chatEngine.calculateImportance(
      'standard',
      'décision importante'
    );
    expect(importanceUpper).toBe(importanceLower);
    expect(importanceUpper).toBe(0.5);
  });

  test('unknown mode defaults to 0.3', () => {
    // @ts-expect-error: accessing private method for testing with invalid mode
    const importance = chatEngine.calculateImportance('unknown_mode', 'Test');
    expect(importance).toBe(0.3); // Fallback
  });
});
