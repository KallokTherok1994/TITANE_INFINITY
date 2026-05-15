import type {
  TwinIdentityObservationEntry,
  TwinObservationType,
} from '@/services/twin_consent/TwinConsentLedgerContract';

import type { TwinChatObservationCandidate } from './types';

function mapObservationType(
  candidate: TwinChatObservationCandidate
): TwinObservationType {
  switch (candidate.kind) {
    case 'value':
      return 'value';
    case 'emotional':
      return 'emotional_pattern';
    case 'cognitive':
    case 'style':
      return 'preference';
    default:
      return 'unknown';
  }
}

export function createTwinConsentShadowEntry(
  candidate: TwinChatObservationCandidate,
  options?: {
    now?: string;
    subjectId?: string;
  }
): TwinIdentityObservationEntry {
  const now = options?.now ?? new Date().toISOString();
  const subjectId = options?.subjectId ?? 'twin_chat_shadow_subject';

  return {
    observation_id: candidate.id,
    subject_id: subjectId,
    observation_type: mapObservationType(candidate),
    content: candidate.contentCompact,
    source: 'chat_turn_shadow',
    source_ref: candidate.route ?? undefined,
    confidence: candidate.confidence,
    auto_detected: true,
    requires_validation: candidate.consentRisk !== 'low',
    validation_status: 'system_observed',
    validated_by: null,
    validated_at: null,
    can_affect_behavior: false,
    can_affect_memory: false,
    can_affect_identity: false,
    expires_at: null,
    rejected_reason: null,
    risk_level: candidate.consentRisk,
    linked_memory_node_ids: [],
    notes:
      candidate.kind === 'cognitive' || candidate.kind === 'style'
        ? `mapped_from:${candidate.kind}`
        : undefined,
    created_at: now,
    updated_at: now,
  };
}