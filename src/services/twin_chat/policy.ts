import {
  canAffectBehavior,
  canAffectIdentity,
  canAffectMemory,
  normalizeAutoDetectedObservation,
  requiresKevinValidation,
  type TwinIdentityObservationEntry,
} from '@/services/twin_consent/TwinConsentLedgerContract';

import type { TwinChatPolicyDecision } from './types';

export function evaluateTwinChatShadowPolicy(
  entry: TwinIdentityObservationEntry
): TwinChatPolicyDecision {
  const normalizedEntry = normalizeAutoDetectedObservation(entry);
  const reviewRequired = requiresKevinValidation(normalizedEntry);
  const hasBehaviorAuthority = canAffectBehavior(normalizedEntry);
  const hasMemoryAuthority = canAffectMemory(normalizedEntry);
  const hasIdentityAuthority = canAffectIdentity(normalizedEntry);
  const wasDowngraded =
    typeof normalizedEntry.notes === 'string' &&
    normalizedEntry.notes.includes('mapped_from:');

  let verdict: TwinChatPolicyDecision['verdict'];

  if (
    normalizedEntry.validation_status === 'blocked' ||
    normalizedEntry.validation_status === 'rejected' ||
    normalizedEntry.validation_status === 'unknown'
  ) {
    verdict = 'blocked';
  } else if (reviewRequired) {
    verdict = 'review_required';
  } else if (wasDowngraded) {
    verdict = 'downgraded';
  } else if (
    typeof normalizedEntry.confidence === 'number' &&
    normalizedEntry.confidence < 0.5
  ) {
    verdict = 'downgraded';
  } else {
    verdict = 'allowed';
  }

  return {
    candidateId: normalizedEntry.observation_id,
    verdict,
    observationType: normalizedEntry.observation_type,
    validationStatus: normalizedEntry.validation_status,
    riskLevel: normalizedEntry.risk_level,
    canWriteTwin: false,
    requiresKevinValidation: reviewRequired,
  };
}
