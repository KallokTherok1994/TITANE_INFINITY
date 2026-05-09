import { describe, expect, it } from 'vitest';
import { decideMemoryAging } from '@/services/knowledge_runtime/MemoryAgingPolicy';
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

describe('MemoryAgingPolicy', () => {
  it('keeps fresh candidates stable', () => {
    const decision = decideMemoryAging(makeCandidate(), '2026-05-15T00:00:00.000Z');
    expect(decision.status).toBe('stable');
  });

  it('marks long-inactive candidates as aging', () => {
    const decision = decideMemoryAging(makeCandidate(), '2026-06-20T00:00:00.000Z');
    expect(decision.status).toBe('aging');
  });

  it('expires temporal facts after the safe window', () => {
    const decision = decideMemoryAging(
      makeCandidate({
        structureType: 'temporal_fact',
        expiresAt: '2026-05-20T00:00:00.000Z',
      }),
      '2026-05-21T00:00:00.000Z'
    );
    expect(decision.status).toBe('expire_now');
  });
});
