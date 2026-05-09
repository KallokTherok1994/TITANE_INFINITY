import { QUALITY_THRESHOLD } from '@/services/ai/qualityVerifier';

export type QualityAction = 'none' | 'enhance' | 'clarify' | 'ask_followup' | 'block';

export interface QualityActionPolicyInput {
  score?: number;
  evaluated: boolean;
  shouldEnhance?: boolean;
  inferenceState?: string;
}

export interface QualityActionPolicyDecision {
  action: QualityAction;
  minimumVerdict: 'PASS' | 'QUALIFIED' | 'UNCERTAIN' | 'BLOCKED';
  reasonCode:
    | 'not_evaluated'
    | 'quality_pass'
    | 'quality_enhance'
    | 'quality_uncertain'
    | 'quality_blocked'
    | 'clarify_required';
  warnUser: boolean;
}

const QUALITY_UNCERTAIN_THRESHOLD = 0.45;

export function evaluateQualityActionPolicy(
  input: QualityActionPolicyInput
): QualityActionPolicyDecision {
  const inferenceState = input.inferenceState ?? '';
  const score = input.score;

  if (inferenceState === 'CLARIFY_REQUIRED') {
    return {
      action: 'clarify',
      minimumVerdict: 'BLOCKED',
      reasonCode: 'clarify_required',
      warnUser: true,
    };
  }

  if (!input.evaluated || score === undefined) {
    return {
      action: 'enhance',
      minimumVerdict: 'QUALIFIED',
      reasonCode: 'not_evaluated',
      warnUser: false,
    };
  }

  if (score < QUALITY_UNCERTAIN_THRESHOLD) {
    return {
      action: 'block',
      minimumVerdict: 'UNCERTAIN',
      reasonCode: 'quality_blocked',
      warnUser: true,
    };
  }

  if (score < QUALITY_THRESHOLD) {
    return {
      action: input.shouldEnhance ? 'enhance' : 'ask_followup',
      minimumVerdict: 'QUALIFIED',
      reasonCode: 'quality_enhance',
      warnUser: true,
    };
  }

  return {
    action: 'none',
    minimumVerdict: 'PASS',
    reasonCode: 'quality_pass',
    warnUser: false,
  };
}
