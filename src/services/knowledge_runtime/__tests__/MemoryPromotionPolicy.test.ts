import { describe, expect, it } from 'vitest';
import { decideMemoryPromotion } from '@/services/knowledge_runtime/MemoryPromotionPolicy';
import type { MemoryCandidate } from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function makeCandidate(overrides: Partial<MemoryCandidate> = {}): MemoryCandidate {
  return {
    id: 'cand-1',
    origin: 'kb_selection',
    knowledgeId: 'kb-1',
    category: 'default_rule',
    content: 'Default rule',
    structureType: 'rule',
    confidence: 0.9,
    createdAt: '2026-05-09T00:00:00.000Z',
    lastSeenAt: '2026-05-09T00:00:00.000Z',
    usageCount: 2,
    stabilityScore: 0.82,
    contradictionFlag: false,
    probationStatus: 'candidate',
    expiresAt: null,
    supportingSignals: [],
    ...overrides,
  };
}

describe('MemoryPromotionPolicy', () => {
  it('promotes stable structural candidates', () => {
    const decision = decideMemoryPromotion(makeCandidate());
    expect(decision.action).toBe('promote');
  });

  it('keeps single-use content as trace', () => {
    const decision = decideMemoryPromotion(
      makeCandidate({
        structureType: 'content',
        usageCount: 1,
        stabilityScore: 0.55,
      })
    );
    expect(decision.action).toBe('keep_trace');
  });

  it('rejects conflicted candidates', () => {
    const decision = decideMemoryPromotion(makeCandidate({ contradictionFlag: true }));
    expect(decision.action).toBe('reject');
  });

  it('keeps temporal facts below promotion threshold in trace', () => {
    const decision = decideMemoryPromotion(
      makeCandidate({
        structureType: 'temporal_fact',
        usageCount: 1,
        stabilityScore: 0.7,
      })
    );
    expect(decision.action).toBe('keep_trace');
  });
});
