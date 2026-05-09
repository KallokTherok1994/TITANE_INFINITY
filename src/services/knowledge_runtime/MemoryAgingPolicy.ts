import type {
  AgingDecision,
  MemoryCandidate,
} from '@/services/knowledge_runtime/KnowledgeRuntimeTypes';

function ageDays(candidate: MemoryCandidate, nowIso: string): number {
  const now = new Date(nowIso).getTime();
  const lastSeen = new Date(candidate.lastSeenAt).getTime();
  return Math.max(0, (now - lastSeen) / (24 * 60 * 60 * 1000));
}

export function decideMemoryAging(
  candidate: MemoryCandidate,
  nowIso: string
): AgingDecision {
  if (
    candidate.expiresAt &&
    new Date(candidate.expiresAt).getTime() <= new Date(nowIso).getTime()
  ) {
    return {
      status: 'expire_now',
      reason: 'Candidate reached its explicit expiration date.',
    };
  }

  const age = ageDays(candidate, nowIso);

  if (candidate.contradictionFlag) {
    return {
      status: 'stale',
      reason: 'Conflicted candidates are considered stale until resolved.',
    };
  }

  if (candidate.structureType === 'temporal_fact') {
    if (age >= 14) {
      return {
        status: 'expire_now',
        reason: 'Temporal candidate aged out of safe reuse window.',
      };
    }
    if (age >= 7) {
      return {
        status: 'aging',
        reason: 'Temporal candidate requires near-term revalidation.',
      };
    }
  }

  if (age >= 90) {
    return {
      status: 'stale',
      reason: 'Long inactivity pushes candidate into stale state.',
    };
  }

  if (age >= 30) {
    return {
      status: 'aging',
      reason: 'Candidate has not been reinforced recently.',
    };
  }

  return {
    status: 'stable',
    reason: 'Candidate remains within freshness window.',
  };
}
