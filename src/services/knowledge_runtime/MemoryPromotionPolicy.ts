import type {
  MemoryCandidate,
  PromotionDecision,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function addDays(isoDate: string, days: number): string {
  const value = new Date(isoDate);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString();
}

export function decideMemoryPromotion(candidate: MemoryCandidate): PromotionDecision {
  if (candidate.contradictionFlag) {
    return {
      action: 'reject',
      reason: 'Conflicted candidates cannot be promoted.',
    };
  }

  if (candidate.structureType === 'temporal_fact') {
    if (candidate.usageCount >= 3 && candidate.stabilityScore >= 0.85) {
      return {
        action: 'enter_probation',
        reason: 'Temporal facts require probation before any promotion.',
        nextReviewAt: addDays(candidate.lastSeenAt, 7),
      };
    }
    return {
      action: 'keep_trace',
      reason: 'Temporal facts stay trace-level until repeated and stable.',
      nextReviewAt: addDays(candidate.lastSeenAt, 3),
    };
  }

  if (
    (candidate.structureType === 'rule' ||
      candidate.structureType === 'heuristic' ||
      candidate.structureType === 'preference') &&
    candidate.usageCount >= 2 &&
    candidate.stabilityScore >= 0.8
  ) {
    return {
      action: 'promote',
      reason: 'Reusable structural candidate met stability threshold.',
      nextReviewAt: addDays(candidate.lastSeenAt, 30),
    };
  }

  if (candidate.usageCount >= 2 && candidate.stabilityScore >= 0.65) {
    return {
      action: 'enter_probation',
      reason: 'Candidate is useful but requires more repeated evidence.',
      nextReviewAt: addDays(candidate.lastSeenAt, 14),
    };
  }

  if (candidate.structureType === 'content' && candidate.usageCount <= 1) {
    return {
      action: 'keep_trace',
      reason: 'Single-use content should not consolidate yet.',
      nextReviewAt: addDays(candidate.lastSeenAt, 7),
    };
  }

  return {
    action: 'defer',
    reason: 'Candidate did not reach a clear promotion threshold yet.',
    nextReviewAt: addDays(candidate.lastSeenAt, 10),
  };
}
