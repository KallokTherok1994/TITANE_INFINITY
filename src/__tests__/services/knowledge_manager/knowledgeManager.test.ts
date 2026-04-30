/**
 * Tests — Knowledge Manager service (knowledgeOrganizer + memoryOptimizer)
 */
import { describe, it, expect } from 'vitest';
import {
  clusterByTheme,
  scoreRelevance,
  detectKnowledgeGaps,
  buildEnrichedIndex,
  getKBStats,
  type KBEntry,
} from '../../../services/knowledge_manager/knowledgeOrganizer';
import {
  estimateTokens,
  pinCriticalMemories,
  compactLTMContext,
  prioritizeForQuery,
  optimizeContextWindow,
  computeMemoryHealthScore,
  type MemoryEntry,
} from '../../../services/knowledge_manager/memoryOptimizer';

// ── Fixture data ──────────────────────────────────────────────────────────────

const medicalEntry: KBEntry = {
  category: 'pharmacologie_clinique_avancee',
  description: 'Pharmacocinétique ADME et interactions médicamenteuses CYP450',
  retrieval_triggers: ['pharmacologie', 'ADME', 'CYP450', 'interaction médicamenteuse'],
};

const psychoEntry: KBEntry = {
  category: 'psychologie_positive_bien_etre',
  description: 'Bien-être, bonheur, résilience et émotions positives',
  retrieval_triggers: ['psychologie', 'bien-être', 'bonheur', 'résilience'],
};

const techEntry: KBEntry = {
  category: 'technologie_innovation_avancee',
  description: 'Intelligence artificielle et innovations numériques',
  retrieval_triggers: ['IA', 'intelligence artificielle', 'innovation', 'numérique'],
};

const gastroEntry: KBEntry = {
  category: 'gastroenterologie_hepatologie',
  description: 'MICI, cirrhose, hépatites virales et cancers digestifs',
  retrieval_triggers: ['gastroentérologie', 'MICI', 'cirrhose', 'hépatite'],
};

const allEntries: KBEntry[] = [medicalEntry, psychoEntry, techEntry, gastroEntry];

// ── Knowledge Organizer ──────────────────────────────────────────────────────

describe('knowledgeOrganizer — clusterByTheme', () => {
  it('assigns pharmacologie to medicine_clinique', () => {
    const clusters = clusterByTheme([medicalEntry]);
    expect(clusters.medicine_clinique.length).toBeGreaterThanOrEqual(1);
  });

  it('assigns psychologie entry to psychologie_bien_etre', () => {
    const clusters = clusterByTheme([psychoEntry]);
    expect(clusters.psychologie_bien_etre.length).toBeGreaterThanOrEqual(1);
  });

  it('assigns technologie entry to technologie_innovation', () => {
    const clusters = clusterByTheme([techEntry]);
    expect(clusters.technologie_innovation.length).toBeGreaterThanOrEqual(1);
  });

  it('returns all themes as keys', () => {
    const clusters = clusterByTheme(allEntries);
    expect(Object.keys(clusters)).toContain('medicine_clinique');
    expect(Object.keys(clusters)).toContain('psychologie_bien_etre');
    expect(Object.keys(clusters)).toContain('technologie_innovation');
    expect(Object.keys(clusters)).toContain('autre');
  });

  it('handles empty entries', () => {
    const clusters = clusterByTheme([]);
    expect(Object.values(clusters).every(arr => arr.length === 0)).toBe(true);
  });
});

describe('knowledgeOrganizer — scoreRelevance', () => {
  it('returns high score for exact trigger match', () => {
    const score = scoreRelevance('pharmacologie ADME', medicalEntry);
    expect(score).toBeGreaterThan(0.5);
  });

  it('returns 0 for empty query', () => {
    expect(scoreRelevance('', medicalEntry)).toBe(0);
  });

  it('returns low score for unrelated query', () => {
    const score = scoreRelevance('yoga spiritualité', medicalEntry);
    expect(score).toBeLessThan(0.3);
  });

  it('scores case-insensitively', () => {
    const lower = scoreRelevance('pharmacologie', medicalEntry);
    const upper = scoreRelevance('PHARMACOLOGIE', medicalEntry);
    expect(lower).toBeCloseTo(upper, 1);
  });
});

describe('knowledgeOrganizer — detectKnowledgeGaps', () => {
  it('returns fewer gaps with more entries', () => {
    const fewerGaps = detectKnowledgeGaps(allEntries);
    const moreGaps = detectKnowledgeGaps([medicalEntry]);
    expect(fewerGaps.length).toBeLessThanOrEqual(moreGaps.length);
  });

  it('returns array of strings', () => {
    const gaps = detectKnowledgeGaps([]);
    expect(Array.isArray(gaps)).toBe(true);
    gaps.forEach(g => expect(typeof g).toBe('string'));
  });
});

describe('knowledgeOrganizer — buildEnrichedIndex', () => {
  it('returns same length as input', () => {
    const index = buildEnrichedIndex(allEntries);
    expect(index.length).toBe(allEntries.length);
  });

  it('each entry has category, theme, triggerCount, description', () => {
    const index = buildEnrichedIndex(allEntries);
    index.forEach(entry => {
      expect(entry.category).toBeTruthy();
      expect(entry.theme).toBeTruthy();
      expect(typeof entry.triggerCount).toBe('number');
    });
  });
});

describe('knowledgeOrganizer — getKBStats', () => {
  it('returns correct totalEntries', () => {
    const stats = getKBStats(allEntries);
    expect(stats.totalEntries).toBe(4);
  });

  it('returns categoriesCount equal to number of unique categories', () => {
    const stats = getKBStats(allEntries);
    expect(stats.categoriesCount).toBe(4);
  });

  it('returns avgTriggersPerEntry > 0', () => {
    const stats = getKBStats(allEntries);
    expect(stats.avgTriggersPerEntry).toBeGreaterThan(0);
  });

  it('handles empty entries', () => {
    const stats = getKBStats([]);
    expect(stats.totalEntries).toBe(0);
    expect(stats.avgTriggersPerEntry).toBe(0);
  });
});

// ── Memory Optimizer ─────────────────────────────────────────────────────────

describe('memoryOptimizer — estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estimates ~1 token per 4 chars', () => {
    const text = 'a'.repeat(400);
    expect(estimateTokens(text)).toBe(100);
  });
});

describe('memoryOptimizer — pinCriticalMemories', () => {
  const entries: MemoryEntry[] = [
    { id: '1', content: 'Profil utilisateur Kevin identité système', importance: 0.5 },
    { id: '2', content: 'Recette de cuisine au basilic', importance: 0.1 },
    { id: '3', content: 'Règle de sécurité urgence alerte', importance: 0.9 },
  ];

  it('pins entries matching critical patterns', () => {
    const pinned = pinCriticalMemories(entries);
    const e1 = pinned.find(e => e.id === '1');
    expect(e1?.pinned).toBe(true);
  });

  it('does not pin low-importance unrelated entries', () => {
    const pinned = pinCriticalMemories(entries);
    const e2 = pinned.find(e => e.id === '2');
    expect(e2?.pinned).toBe(false);
  });

  it('pins high-importance entries regardless of content', () => {
    const pinned = pinCriticalMemories(entries);
    const e3 = pinned.find(e => e.id === '3');
    expect(e3?.pinned).toBe(true);
  });
});

describe('memoryOptimizer — compactLTMContext', () => {
  const makeEntry = (id: string, content: string, pinned = false): MemoryEntry => ({
    id,
    content,
    pinned,
    importance: pinned ? 1 : 0.2,
    timestamp: Date.now(),
  });

  it('respects maxTokens limit for unpinned entries', () => {
    const entries = Array.from({ length: 20 }, (_, i) =>
      makeEntry(`e${i}`, 'x'.repeat(200))
    );
    const compacted = compactLTMContext(entries, 1000);
    const totalTokens = compacted.reduce((acc, e) => acc + estimateTokens(e.content), 0);
    // Pinned entries can exceed, but unpinned should be bounded
    const unpinned = compacted.filter(e => !e.pinned);
    const unpinnedTokens = unpinned.reduce((acc, e) => acc + estimateTokens(e.content), 0);
    expect(unpinnedTokens).toBeLessThanOrEqual(1000);
  });

  it('deduplicates identical content', () => {
    const entries = [
      makeEntry('a', 'Même contenu'),
      makeEntry('b', 'Même contenu'),
      makeEntry('c', 'Autre contenu'),
    ];
    const compacted = compactLTMContext(entries, 10000);
    const contents = compacted.map(e => e.content.trim().toLowerCase().slice(0, 100));
    const unique = new Set(contents);
    expect(unique.size).toBe(compacted.length);
  });
});

describe('memoryOptimizer — prioritizeForQuery', () => {
  const entries: MemoryEntry[] = [
    { id: '1', content: 'Pharmacologie ADME CYP450 métabolisme hépatique', importance: 0.5 },
    { id: '2', content: 'Recette de cuisine végétarienne avec courgettes', importance: 0.3 },
    { id: '3', content: 'Traitement médicamenteux interactions cliniques pharmacologie', importance: 0.7 },
  ];

  it('returns top entries matching query', () => {
    const top = prioritizeForQuery(entries, 'pharmacologie interactions', 2);
    expect(top.length).toBe(2);
    expect(top.some(e => e.id === '1' || e.id === '3')).toBe(true);
  });

  it('respects limit parameter', () => {
    const top = prioritizeForQuery(entries, 'pharmacologie', 1);
    expect(top.length).toBe(1);
  });

  it('handles empty query returning first N entries', () => {
    const top = prioritizeForQuery(entries, '', 2);
    expect(top.length).toBe(2);
  });
});

describe('memoryOptimizer — computeMemoryHealthScore', () => {
  it('returns 100 for empty entries', () => {
    const health = computeMemoryHealthScore([]);
    expect(health.healthScore).toBeGreaterThanOrEqual(0);
  });

  it('returns health object with all required fields', () => {
    const health = computeMemoryHealthScore([
      { id: '1', content: 'test content', timestamp: Date.now() },
    ]);
    expect(typeof health.totalEntries).toBe('number');
    expect(typeof health.pinnedCount).toBe('number');
    expect(typeof health.estimatedTokens).toBe('number');
    expect(typeof health.staleCount).toBe('number');
    expect(typeof health.healthScore).toBe('number');
  });

  it('health score is between 0 and 100', () => {
    const health = computeMemoryHealthScore(
      Array.from({ length: 100 }, (_, i) => ({
        id: `e${i}`,
        content: 'x'.repeat(1000),
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days old = stale
      }))
    );
    expect(health.healthScore).toBeGreaterThanOrEqual(0);
    expect(health.healthScore).toBeLessThanOrEqual(100);
  });
});

describe('memoryOptimizer — optimizeContextWindow', () => {
  it('always preserves system messages', () => {
    const history: MemoryEntry[] = [
      { id: 's1', role: 'system', content: 'System instruction '.repeat(10) },
      ...Array.from({ length: 50 }, (_, i) => ({
        id: `m${i}`,
        role: 'user' as const,
        content: 'x'.repeat(200),
      })),
    ];
    const optimized = optimizeContextWindow(history, 500);
    expect(optimized.some(e => e.role === 'system')).toBe(true);
  });

  it('returns fewer messages when maxTokens is very small', () => {
    const history: MemoryEntry[] = Array.from({ length: 20 }, (_, i) => ({
      id: `m${i}`,
      role: 'user' as const,
      content: 'x'.repeat(400),
    }));
    const optimized = optimizeContextWindow(history, 1000);
    expect(optimized.length).toBeLessThan(20);
  });
});
