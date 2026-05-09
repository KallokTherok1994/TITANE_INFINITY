export type SkillActivationMode =
  | 'none'
  | 'suggest'
  | 'inject_context'
  | 'primary_route'
  | 'blocked';

export type SkillRoutingSource =
  | 'manual_active'
  | 'tool_invocation'
  | 'kernel_intent'
  | 'mode_mapping';

export type SkillInjectionRisk = 'low' | 'medium' | 'high';

export type SkillExpiry = 'one_turn' | 'session' | 'manual';

export interface SkillRoutingDecision {
  skillId: string | null;
  activationMode: SkillActivationMode;
  source: SkillRoutingSource;
  confidence: number;
  reasonCode: string;
  expiry: SkillExpiry;
  safety: {
    packageHealthy: boolean;
    allowedForIntent: boolean;
    promptTooLong: boolean;
    injectionRisk: SkillInjectionRisk;
  };
}

export interface SkillRoutingInput {
  skillId: string | null;
  source: SkillRoutingSource;
  packageHealthy: boolean;
  packageState?: 'ACTIVE' | 'INSTALLED' | 'FAILED' | 'ARCHIVED';
  allowedForIntent: boolean;
  promptLength: number;
  maxPromptLength?: number;
}

function buildBlockedDecision(
  input: SkillRoutingInput,
  reasonCode: string
): SkillRoutingDecision {
  return {
    skillId: input.skillId,
    activationMode: 'blocked',
    source: input.source,
    confidence: 0.05,
    reasonCode,
    expiry: 'manual',
    safety: {
      packageHealthy: input.packageHealthy,
      allowedForIntent: input.allowedForIntent,
      promptTooLong: input.promptLength > (input.maxPromptLength ?? 2048),
      injectionRisk: 'high',
    },
  };
}

export function routeSkill(input: SkillRoutingInput): SkillRoutingDecision {
  const maxPromptLength = input.maxPromptLength ?? 2048;
  const promptTooLong = input.promptLength > maxPromptLength;
  const packageState = input.packageState ?? (input.packageHealthy ? 'ACTIVE' : 'FAILED');

  if (!input.skillId) {
    return {
      skillId: null,
      activationMode: 'none',
      source: input.source,
      confidence: 0.1,
      reasonCode: 'no_skill_selected',
      expiry: 'session',
      safety: {
        packageHealthy: input.packageHealthy,
        allowedForIntent: input.allowedForIntent,
        promptTooLong,
        injectionRisk: 'low',
      },
    };
  }

  if (!input.packageHealthy || packageState === 'FAILED') {
    return buildBlockedDecision(input, 'skill_unhealthy');
  }

  if (packageState === 'ARCHIVED') {
    return buildBlockedDecision(input, 'skill_archived');
  }

  if (promptTooLong) {
    return buildBlockedDecision(input, 'prompt_too_long');
  }

  if (!input.allowedForIntent) {
    return {
      skillId: input.skillId,
      activationMode: 'suggest',
      source: input.source,
      confidence: 0.35,
      reasonCode: 'intent_mismatch',
      expiry: 'session',
      safety: {
        packageHealthy: true,
        allowedForIntent: false,
        promptTooLong: false,
        injectionRisk: 'medium',
      },
    };
  }

  if (input.source === 'manual_active') {
    return {
      skillId: input.skillId,
      activationMode: 'primary_route',
      source: input.source,
      confidence: 0.95,
      reasonCode: 'manual_active_route',
      expiry: 'manual',
      safety: {
        packageHealthy: true,
        allowedForIntent: true,
        promptTooLong: false,
        injectionRisk: 'low',
      },
    };
  }

  return {
    skillId: input.skillId,
    activationMode: 'inject_context',
    source: input.source,
    confidence: input.source === 'kernel_intent' ? 0.72 : 0.84,
    reasonCode:
      input.source === 'kernel_intent' ? 'kernel_intent_route' : 'tool_invocation_route',
    expiry: input.source === 'tool_invocation' ? 'one_turn' : 'session',
    safety: {
      packageHealthy: true,
      allowedForIntent: true,
      promptTooLong: false,
      injectionRisk: 'low',
    },
  };
}
