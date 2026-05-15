import { createTwinConsentShadowEntry } from './createTwinConsentShadowEntry';
import { evaluateTwinChatShadowPolicy } from './policy';
import type {
  TwinChatObservationCandidate,
  TwinChatOrchestrationResult,
  TwinChatPolicyVerdict,
} from './types';

function buildVerdictCounts(
  verdicts: TwinChatPolicyVerdict[]
): Partial<Record<TwinChatPolicyVerdict, number>> {
  return verdicts.reduce<Partial<Record<TwinChatPolicyVerdict, number>>>(
    (counts, verdict) => {
      counts[verdict] = (counts[verdict] ?? 0) + 1;
      return counts;
    },
    {}
  );
}

export function orchestrateTwinChatShadow(
  candidates: TwinChatObservationCandidate[]
): TwinChatOrchestrationResult {
  const decisions = candidates.map(candidate =>
    evaluateTwinChatShadowPolicy(createTwinConsentShadowEntry(candidate))
  );
  const verdictCounts = buildVerdictCounts(decisions.map(decision => decision.verdict));

  return {
    decisions,
    summary: {
      candidateCount: candidates.length,
      kinds: Array.from(new Set(candidates.map(candidate => candidate.kind))),
      verdictCounts,
    },
  };
}