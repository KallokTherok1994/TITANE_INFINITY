import type { ResponseProfileId } from './responsePolicy';

export type ReasoningDepth = 'minimal' | 'balanced' | 'deep' | 'architectural' | 'omega';

export type OutputCompression = 'short' | 'normal' | 'structured' | 'deep_structured';

export type VisibleRationale = 'none' | 'brief' | 'decision_trace';

export interface ReasoningContract {
  internalDepth: ReasoningDepth;
  outputCompression: OutputCompression;
  visibleRationale: VisibleRationale;
  forbiddenOutputPatterns: string[];
  maxSections: number;
  proofMode: boolean;
  reasonCode: string;
}

const FORBIDDEN_PATTERNS = [
  'hiddenThoughts',
  'chainOfThought',
  'internalReasoningSteps',
  'rawReasoning',
  'privateReasoning',
  'private scratchpad',
];

function normalizeProfileId(profileId?: string): string {
  return (profileId ?? '').trim().toUpperCase();
}

function resolveFromStyle(style?: string): ResponseProfileId | null {
  switch ((style ?? '').trim().toLowerCase()) {
    case 'simple':
      return 'DIRECT';
    case 'balanced':
      return 'BALANCED';
    case 'deep':
      return 'DEVELOPED';
    case 'architectural':
      return 'ARCHITECT';
    case 'omega':
      return 'OMEGA';
    case 'creative':
      return 'BALANCED';
    default:
      return null;
  }
}

export function resolveReasoningContract(input: {
  profileId?: ResponseProfileId | string;
  requestStyle?: string;
  proofMode?: boolean;
}): ReasoningContract {
  const profileId = normalizeProfileId(input.profileId ?? undefined);
  const styleProfile = resolveFromStyle(input.requestStyle);
  const effectiveProfile = profileId || styleProfile || 'BALANCED';

  switch (effectiveProfile) {
    case 'DIRECT':
      return {
        internalDepth: 'minimal',
        outputCompression: 'short',
        visibleRationale: 'none',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 2,
        proofMode: Boolean(input.proofMode),
        reasonCode: 'direct_minimal',
      };
    case 'BALANCED':
      return {
        internalDepth: 'balanced',
        outputCompression: 'normal',
        visibleRationale: 'brief',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 3,
        proofMode: Boolean(input.proofMode),
        reasonCode: 'balanced_normal',
      };
    case 'DEEP':
    case 'DEVELOPED':
      return {
        internalDepth: 'deep',
        outputCompression: 'structured',
        visibleRationale: 'brief',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 4,
        proofMode: Boolean(input.proofMode),
        reasonCode: 'developed_structured',
      };
    case 'ARCHITECT':
      return {
        internalDepth: 'architectural',
        outputCompression: 'structured',
        visibleRationale: 'decision_trace',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 5,
        proofMode: Boolean(input.proofMode),
        reasonCode: 'architectural_decision_trace',
      };
    case 'OMEGA':
      return {
        internalDepth: 'omega',
        outputCompression: 'deep_structured',
        visibleRationale: 'decision_trace',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 5,
        proofMode: true,
        reasonCode: 'omega_proof_driven',
      };
    default:
      return {
        internalDepth: 'balanced',
        outputCompression: 'normal',
        visibleRationale: 'brief',
        forbiddenOutputPatterns: FORBIDDEN_PATTERNS,
        maxSections: 3,
        proofMode: Boolean(input.proofMode),
        reasonCode: 'balanced_normal',
      };
  }
}

export function hasForbiddenReasoningOutput(
  text: string,
  contract: ReasoningContract
): boolean {
  const normalized = text.toLowerCase();
  return contract.forbiddenOutputPatterns.some(pattern =>
    normalized.includes(pattern.toLowerCase())
  );
}
