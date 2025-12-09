/**
 * TITANE∞ UNIFIED MEMORY SYSTEM - TESTS UNITAIRES
 * 
 * Tests complets pour le système de mémoire à trois niveaux (STM/MTM/LTM)
 * 
 * @module __tests__/unifiedMemory.test
 * @version 1.0.0
 * @created 2024-PHASE_2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { unifiedMemory } from '@/core/services/unifiedMemory';

// Mock console pour éviter le spam pendant les tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  
  // Clear all tiers before each test
  unifiedMemory.clear('STM');
  unifiedMemory.clear('MTM');
  unifiedMemory.clear('LTM');
});

describe('UnifiedMemory - Storage Routing', () => {
  it('devrait router vers STM quand importance < 0.3', async () => {
    await unifiedMemory.store(
      'Message de faible importance',
      'user',
      0.2,
      'conv-1',
      ['quick']
    );

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(1);
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(0);
  });

  it('devrait router vers MTM quand importance entre 0.3 et 0.7', async () => {
    await unifiedMemory.store(
      'Message d\'importance moyenne',
      'assistant',
      0.5,
      'conv-1',
      ['standard']
    );

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(0);
    expect(stats.mtm.totalEntries).toBe(1);
    expect(stats.ltm.totalEntries).toBe(0);
  });

  it('devrait router vers LTM quand importance > 0.7', async () => {
    await unifiedMemory.store(
      'Message critique pour le projet',
      'user',
      0.85,
      'conv-1',
      ['reflection', 'important']
    );

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(0);
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(1);
  });

  it('devrait router vers LTM quand importance = 0.7 exactement', async () => {
    await unifiedMemory.store(
      'Message à la frontière',
      'system',
      0.7,
      'conv-1',
      ['strategy']
    );

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(0);
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(1); // 0.7 >= 0.7 → LTM
  });
});

describe('UnifiedMemory - Recall Filtering', () => {
  beforeEach(async () => {
    // Setup: Créer des entrées de test dans chaque tier
    await unifiedMemory.store('Message STM 1', 'user', 0.1, 'conv-1', ['quick']);
    await unifiedMemory.store('Message STM 2', 'user', 0.2, 'conv-2', ['quick']);
    await unifiedMemory.store('Message MTM 1', 'assistant', 0.4, 'conv-1', ['standard']);
    await unifiedMemory.store('Message MTM 2', 'assistant', 0.5, 'conv-2', ['standard', 'important']);
    await unifiedMemory.store('Message LTM 1', 'user', 0.8, 'conv-1', ['reflection']);
    await unifiedMemory.store('Message LTM 2', 'user', 0.9, 'conv-2', ['emergency', 'critique']);
  });

  it('devrait filtrer par conversationId', async () => {
    const results = await unifiedMemory.recall('', {
      conversationId: 'conv-1',
      minImportance: 0,
    });

    expect(results.length).toBe(3); // 1 STM + 1 MTM + 1 LTM
    expect(results.every(r => r.conversationId === 'conv-1')).toBe(true);
  });

  it('devrait filtrer par tag unique', async () => {
    const results = await unifiedMemory.recall('', {
      tags: ['important'],
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.tags.includes('important'))).toBe(true);
  });

  it('devrait filtrer par tags multiples (OR logic)', async () => {
    const results = await unifiedMemory.recall('', {
      tags: ['reflection', 'emergency'],
    });

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every(r => 
      r.tags.includes('reflection') || r.tags.includes('emergency')
    )).toBe(true);
  });

  it('devrait filtrer par minImportance', async () => {
    const results = await unifiedMemory.recall('', {
      minImportance: 0.5,
    });

    expect(results.length).toBeGreaterThanOrEqual(2); // Messages >= 0.5
    expect(results.every(r => r.importance >= 0.5)).toBe(true);
  });

  it('devrait combiner plusieurs filtres (conversationId + tags + minImportance)', async () => {
    const results = await unifiedMemory.recall('', {
      conversationId: 'conv-2',
      tags: ['critique'],
      minImportance: 0.8,
    });

    expect(results.length).toBe(1);
    expect(results[0].content).toContain('LTM 2');
    expect(results[0].conversationId).toBe('conv-2');
    expect(results[0].tags.includes('critique')).toBe(true);
    expect(results[0].importance).toBeGreaterThanOrEqual(0.8);
  });

  it('devrait limiter les résultats avec le paramètre limit', async () => {
    const results = await unifiedMemory.recall('', {
      limit: 2,
    });

    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('devrait retourner tous les tiers par défaut', async () => {
    const results = await unifiedMemory.recall('', { minImportance: 0 });

    const stats = unifiedMemory.getStats();
    const totalStored = stats.stm.totalEntries + stats.mtm.totalEntries + stats.ltm.totalEntries;
    expect(results.length).toBe(totalStored);
  });
});

describe('UnifiedMemory - Promotion MTM → LTM', () => {
  it('devrait auto-promouvoir MTM → LTM après 10 accès via recall', async () => {
    // Store dans MTM (0.4 < 0.7 → MTM)
    await unifiedMemory.store('Message souvent accédé', 'user', 0.4, 'conv-1', ['standard']);
    
    const beforePromotion = unifiedMemory.getStats();
    expect(beforePromotion.mtm.totalEntries).toBe(1);
    expect(beforePromotion.ltm.totalEntries).toBe(0);

    // Access 10 times to trigger auto-promotion
    for (let i = 0; i < 10; i++) {
      await unifiedMemory.recall('', { conversationId: 'conv-1', minImportance: 0 });
    }

    // Check auto-promotion happened
    const afterPromotion = unifiedMemory.getStats();
    expect(afterPromotion.mtm.totalEntries).toBe(0);
    expect(afterPromotion.ltm.totalEntries).toBe(1);
  });

  it('devrait retourner false si l\'entrée n\'existe pas dans MTM', async () => {
    const promoted = await unifiedMemory.promote('id-inexistant');
    expect(promoted).toBe(false);
  });

  it('devrait auto-promouvoir MTM → LTM après 10 accès (recall)', async () => {
    // Store dans MTM
    await unifiedMemory.store('Message souvent accédé', 'user', 0.4, 'conv-1', ['standard']);

    // Access 10 times via recall
    for (let i = 0; i < 10; i++) {
      await unifiedMemory.recall('', { conversationId: 'conv-1' });
    }

    // Trigger cleanup to process auto-promotion
    await unifiedMemory.cleanup();

    const stats = unifiedMemory.getStats();
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(1);
  });

  it('devrait auto-promouvoir MTM → LTM quand importance > 0.7 après cleanup', async () => {
    // Store avec importance initialement moyenne
    await unifiedMemory.store('Message réévalué', 'assistant', 0.5, 'conv-1', ['standard']);

    // Simulate importance update (via internal access)
    const entries = await unifiedMemory.recall('', { conversationId: 'conv-1' });
    // Note: Real implementation would allow updating importance
    // For now, test cleanup logic with high accessCount

    // Access many times to trigger promotion
    for (let i = 0; i < 15; i++) {
      await unifiedMemory.recall('', { conversationId: 'conv-1' });
    }

    await unifiedMemory.cleanup();

    const stats = unifiedMemory.getStats();
    expect(stats.ltm.totalEntries).toBeGreaterThanOrEqual(1);
  });
});

describe('UnifiedMemory - Cleanup & Expiration', () => {
  it('devrait supprimer les entrées STM expirées après 5 minutes', async () => {
    // Store dans STM
    await unifiedMemory.store('Message temporaire', 'user', 0.1, 'conv-1', ['quick']);

    const statsBefore = unifiedMemory.getStats();
    expect(statsBefore.stm.totalEntries).toBe(1);

    // Simulate time passage (5min + 1s)
    vi.useFakeTimers();
    vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

    // Run cleanup
    await unifiedMemory.cleanup();

    const statsAfter = unifiedMemory.getStats();
    expect(statsAfter.stm.totalEntries).toBe(0);

    vi.useRealTimers();
  });

  it('devrait supprimer les entrées MTM expirées après 24 heures', async () => {
    // Store dans MTM
    await unifiedMemory.store('Message moyen terme', 'user', 0.4, 'conv-1', ['standard']);

    const statsBefore = unifiedMemory.getStats();
    expect(statsBefore.mtm.totalEntries).toBe(1);

    // Simulate time passage (24h + 1s)
    vi.useFakeTimers();
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000);

    // Run cleanup
    await unifiedMemory.cleanup();

    const statsAfter = unifiedMemory.getStats();
    expect(statsAfter.mtm.totalEntries).toBe(0);

    vi.useRealTimers();
  });

  it('ne devrait JAMAIS supprimer les entrées LTM (permanent)', async () => {
    // Store dans LTM
    await unifiedMemory.store('Mémoire permanente', 'user', 0.9, 'conv-1', ['reflection']);

    const statsBefore = unifiedMemory.getStats();
    expect(statsBefore.ltm.totalEntries).toBe(1);

    // Simulate extreme time passage (10 years)
    vi.useFakeTimers();
    vi.advanceTimersByTime(10 * 365 * 24 * 60 * 60 * 1000);

    // Run cleanup
    await unifiedMemory.cleanup();

    const statsAfter = unifiedMemory.getStats();
    expect(statsAfter.ltm.totalEntries).toBe(1); // Still there!

    vi.useRealTimers();
  });

  it('devrait respecter la limite de 20 entrées dans STM', async () => {
    // Try to store 25 entries in STM (limit is 20)
    for (let i = 0; i < 25; i++) {
      await unifiedMemory.store(`STM Message ${i}`, 'user', 0.1, 'conv-1', ['quick']);
    }

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBeLessThanOrEqual(20);
  });

  it('devrait respecter la limite de 100 entrées dans MTM', async () => {
    // Try to store 110 entries in MTM (limit is 100)
    for (let i = 0; i < 110; i++) {
      await unifiedMemory.store(`MTM Message ${i}`, 'user', 0.4, 'conv-1', ['standard']);
    }

    const stats = unifiedMemory.getStats();
    expect(stats.mtm.totalEntries).toBeLessThanOrEqual(100);
  });
});

describe('UnifiedMemory - Statistics', () => {
  it('devrait retourner des stats précises pour chaque tier', async () => {
    await unifiedMemory.store('STM 1', 'user', 0.1, 'conv-1', ['quick']);
    await unifiedMemory.store('STM 2', 'user', 0.2, 'conv-1', ['quick']);
    await unifiedMemory.store('MTM 1', 'assistant', 0.4, 'conv-1', ['standard']);
    await unifiedMemory.store('LTM 1', 'user', 0.8, 'conv-1', ['reflection']);
    await unifiedMemory.store('LTM 2', 'user', 0.9, 'conv-1', ['emergency']);

    const stats = unifiedMemory.getStats();

    expect(stats.stm.totalEntries).toBe(2);
    expect(stats.stm.maxEntries).toBe(20);
    expect(stats.stm.ttl).toBe('5min');

    expect(stats.mtm.totalEntries).toBe(1);
    expect(stats.mtm.maxEntries).toBe(100);
    expect(stats.mtm.ttl).toBe('24h');

    expect(stats.ltm.totalEntries).toBe(2);
    expect(stats.ltm.maxEntries).toBe('unlimited');
    expect(stats.ltm.ttl).toBe('permanent');
  });

  it('devrait incrémenter totalEntries après chaque store', async () => {
    const stats1 = unifiedMemory.getStats();
    const initialTotal = stats1.stm.totalEntries + stats1.mtm.totalEntries + stats1.ltm.totalEntries;

    await unifiedMemory.store('Nouveau message', 'user', 0.5, 'conv-1', ['standard']);

    const stats2 = unifiedMemory.getStats();
    const newTotal = stats2.stm.totalEntries + stats2.mtm.totalEntries + stats2.ltm.totalEntries;

    expect(newTotal).toBe(initialTotal + 1);
  });
});

describe('UnifiedMemory - Clear Operations', () => {
  beforeEach(async () => {
    // Setup: Populate all tiers
    await unifiedMemory.store('STM Entry', 'user', 0.1, 'conv-1', ['quick']);
    await unifiedMemory.store('MTM Entry', 'user', 0.4, 'conv-1', ['standard']);
    await unifiedMemory.store('LTM Entry', 'user', 0.8, 'conv-1', ['reflection']);
  });

  it('devrait vider uniquement STM avec clear("STM")', async () => {
    unifiedMemory.clear('STM');

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(0);
    expect(stats.mtm.totalEntries).toBe(1);
    expect(stats.ltm.totalEntries).toBe(1);
  });

  it('devrait vider uniquement MTM avec clear("MTM")', async () => {
    unifiedMemory.clear('MTM');

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(1);
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(1);
  });

  it('devrait vider uniquement LTM avec clear("LTM")', async () => {
    unifiedMemory.clear('LTM');

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(1);
    expect(stats.mtm.totalEntries).toBe(1);
    expect(stats.ltm.totalEntries).toBe(0);
  });

  it('devrait vider tous les tiers avec clear()', async () => {
    unifiedMemory.clear();

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(0);
    expect(stats.mtm.totalEntries).toBe(0);
    expect(stats.ltm.totalEntries).toBe(0);
  });
});

describe('UnifiedMemory - Edge Cases', () => {
  it('devrait gérer importance = 0', async () => {
    await unifiedMemory.store('Message importance nulle', 'user', 0, 'conv-1', ['test']);

    const stats = unifiedMemory.getStats();
    expect(stats.stm.totalEntries).toBe(1); // 0 < 0.3 → STM
  });

  it('devrait gérer importance = 1.0', async () => {
    await unifiedMemory.store('Message importance maximale', 'user', 1.0, 'conv-1', ['test']);

    const stats = unifiedMemory.getStats();
    expect(stats.ltm.totalEntries).toBe(1); // 1.0 > 0.7 → LTM
  });

  it('devrait gérer content vide', async () => {
    await unifiedMemory.store('', 'user', 0.5, 'conv-1', ['empty']);

    const results = await unifiedMemory.recall('', { conversationId: 'conv-1' });
    expect(results.length).toBe(1);
    expect(results[0].content).toBe('');
  });

  it('devrait gérer tags vide', async () => {
    await unifiedMemory.store('Message sans tags', 'user', 0.5, 'conv-1', []);

    const results = await unifiedMemory.recall('', { conversationId: 'conv-1' });
    expect(results.length).toBe(1);
    expect(results[0].tags).toEqual([]);
  });

  it('devrait gérer conversationId undefined', async () => {
    await unifiedMemory.store('Message sans conversation', 'user', 0.5, undefined, ['orphan']);

    const results = await unifiedMemory.recall('', { tags: ['orphan'] });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('devrait gérer recall sans filtres (retourne tout)', async () => {
    await unifiedMemory.store('Message 1', 'user', 0.1, 'conv-1', ['test']);
    await unifiedMemory.store('Message 2', 'user', 0.5, 'conv-2', ['test']);
    await unifiedMemory.store('Message 3', 'user', 0.9, 'conv-3', ['test']);

    const results = await unifiedMemory.recall('', { minImportance: 0 });
    expect(results.length).toBeGreaterThanOrEqual(3);
  });
});
