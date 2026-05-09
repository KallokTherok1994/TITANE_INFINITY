import type { CognitiveRuntimeVerdict } from './cognitiveRuntimeTrace';

export type MemoryWriteTarget =
  | 'none'
  | 'stm'
  | 'mtm'
  | 'ltm'
  | 'preferences'
  | 'project_memory'
  | 'knowledge';

export type MemoryWriteDurability = 'ephemeral' | 'session' | 'medium' | 'long_term';

export interface MemoryWriteDecision {
  shouldWrite: boolean;
  target: MemoryWriteTarget;
  durability: MemoryWriteDurability;
  reasonCode: string;
  confidence: number;
  requiresUserConfirmation: boolean;
  blockedBy?: string[];
}

export interface MemoryWritePolicyInput {
  safeToRemember: boolean;
  verdict: CognitiveRuntimeVerdict;
  factualClaimsVerified?: boolean;
  confidence?: number;
  memoryConflict?: boolean;
  explicitPreference?: boolean;
  temporaryEmotion?: boolean;
  durableProjectDecision?: boolean;
  stablePersonalFact?: boolean;
  creativeOneOff?: boolean;
  userConfirmation?: boolean;
}

function blockedDecision(
  reasonCode: string,
  blockedBy: string[] = []
): MemoryWriteDecision {
  return {
    shouldWrite: false,
    target: 'none',
    durability: 'ephemeral',
    reasonCode,
    confidence: 0,
    requiresUserConfirmation: false,
    blockedBy,
  };
}

function isNonDurableVerdict(verdict: CognitiveRuntimeVerdict): boolean {
  return verdict === 'UNCERTAIN' || verdict === 'BLOCKED' || verdict === 'FAIL';
}

export function decideMemoryWrite(input: MemoryWritePolicyInput): MemoryWriteDecision {
  const confidence = input.confidence ?? 0;

  if (!input.safeToRemember) {
    return blockedDecision('safe_to_remember_false', [
      'trace.final.safeToRemember=false',
    ]);
  }

  if (isNonDurableVerdict(input.verdict)) {
    return blockedDecision('non_durable_verdict', [`verdict=${input.verdict}`]);
  }

  if (input.memoryConflict) {
    return blockedDecision('memory_conflict', ['memory_conflict']);
  }

  if (input.factualClaimsVerified === false) {
    return blockedDecision('factual_claims_unverified', ['factual_claims_unverified']);
  }

  if (input.creativeOneOff && !input.userConfirmation) {
    return blockedDecision('creative_one_off', ['creative_one_off']);
  }

  if (input.explicitPreference) {
    return {
      shouldWrite: true,
      target: 'preferences',
      durability: 'long_term',
      reasonCode: 'explicit_preference',
      confidence: Math.max(confidence, 0.75),
      requiresUserConfirmation: false,
    };
  }

  if (input.temporaryEmotion) {
    return {
      shouldWrite: true,
      target: 'stm',
      durability: 'session',
      reasonCode: 'temporary_emotion',
      confidence: Math.max(confidence, 0.55),
      requiresUserConfirmation: false,
    };
  }

  if (input.durableProjectDecision) {
    const target: MemoryWriteTarget = confidence >= 0.8 ? 'project_memory' : 'mtm';
    return {
      shouldWrite: true,
      target,
      durability: confidence >= 0.8 ? 'long_term' : 'medium',
      reasonCode: 'durable_project_decision',
      confidence: Math.max(confidence, 0.7),
      requiresUserConfirmation: confidence < 0.75,
    };
  }

  if (input.stablePersonalFact) {
    if (confidence < 0.85) {
      return blockedDecision('stable_personal_fact_low_confidence', [
        'stable_personal_fact_requires_higher_confidence',
      ]);
    }

    return {
      shouldWrite: true,
      target: 'ltm',
      durability: 'long_term',
      reasonCode: 'stable_personal_fact',
      confidence,
      requiresUserConfirmation: false,
    };
  }

  if (confidence < 0.7) {
    return blockedDecision('confidence_too_low', ['confidence_below_durable_threshold']);
  }

  return blockedDecision('no_write_signal');
}
