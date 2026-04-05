import {
  RESPONSE_PROFILES,
  type ResponseProfileId,
  type InferenceState,
} from '@/services/ai/responsePolicy';

export type TaskType = 'question' | 'instruction' | 'multi-step' | 'code' | 'data';
export type SafetyMode = 'normal' | 'high';
export type AskActHold = 'ask' | 'act' | 'hold';
export type InitiativeLevel = 'low' | 'medium' | 'high';
export type TruthLabel =
  | 'PROVEN_RUNTIME'
  | 'STABLE_PARTIAL'
  | 'WIRED_BUT_UNPROVEN'
  | 'DECORATIVE';

export type ReasonCode =
  | 'RC_OK_INFER'
  | 'RC_CLARIFY'
  | 'RC_BLOCKED_FACT'
  | 'RC_PROVIDER_DEGRADED'
  | 'RC_MEMORY_UNAVAILABLE'
  | 'RC_WEB_UNAVAILABLE'
  | 'RC_TOOL_UNAVAILABLE'
  | 'RC_SAFETY_CAP'
  | 'RC_HOLD_NO_PROVIDER'
  | 'RC_TRUTH_UNPROVEN';

export interface DiscernmentDecision {
  profileId: ResponseProfileId;
  initiativeLevel: InitiativeLevel;
  memoryAction: 'none' | 'stm' | 'ltm' | 'stm_ltm' | 'targeted';
  webAction: 'none' | 'search';
  toolAction: 'none' | 'tool';
  providerChoice: string | null;
  askActHold: AskActHold;
  truthLabel: TruthLabel;
  reasonCodes: ReasonCode[];
}

export interface DiscernmentInputs {
  profileId: ResponseProfileId;
  inferenceState: InferenceState;
  taskType: TaskType;
  memoryAvailable: boolean;
  webAvailable: boolean;
  toolAvailable: boolean;
  providerAvailable: boolean;
  safetyMode?: SafetyMode;
}

const initiativeByProfile: Record<ResponseProfileId, InitiativeLevel> = {
  DIRECT: 'low',
  BALANCED: 'medium',
  DEVELOPED: 'high',
  DEEP: 'high',
  ARCHITECT: 'high',
  OMEGA: 'high',
};

export function buildDiscernmentDecision(inputs: DiscernmentInputs): DiscernmentDecision {
  const {
    profileId,
    inferenceState,
    taskType,
    memoryAvailable,
    webAvailable,
    toolAvailable,
    providerAvailable,
    safetyMode = 'normal',
  } = inputs;

  const reasons: ReasonCode[] = [];

  // Early ask cases
  if (inferenceState === 'CLARIFY_REQUIRED') {
    reasons.push('RC_CLARIFY');
    return {
      profileId,
      initiativeLevel: initiativeByProfile[profileId],
      memoryAction: 'none',
      webAction: 'none',
      toolAction: 'none',
      providerChoice: null,
      askActHold: 'ask',
      truthLabel: 'WIRED_BUT_UNPROVEN',
      reasonCodes: reasons,
    };
  }

  if (inferenceState === 'BLOCKED_BY_MISSING_FACT') {
    reasons.push('RC_BLOCKED_FACT');
    return {
      profileId,
      initiativeLevel: initiativeByProfile[profileId],
      memoryAction: 'none',
      webAction: 'none',
      toolAction: 'none',
      providerChoice: null,
      askActHold: 'ask',
      truthLabel: 'WIRED_BUT_UNPROVEN',
      reasonCodes: reasons,
    };
  }

  // Initiative with safety cap
  let initiative: InitiativeLevel = initiativeByProfile[profileId];
  if (safetyMode === 'high' && initiative === 'high') {
    initiative = 'medium';
    reasons.push('RC_SAFETY_CAP');
  }

  // Memory decision
  const profile = RESPONSE_PROFILES[profileId];
  let memoryAction: DiscernmentDecision['memoryAction'] = 'none';
  if (
    profile.memory.injectSTM ||
    profile.memory.injectLTM ||
    profile.memory.targetedRetrievalOnly
  ) {
    if (memoryAvailable) {
      if (profile.memory.targetedRetrievalOnly) {
        memoryAction = 'targeted';
      } else if (profile.memory.injectSTM && profile.memory.injectLTM) {
        memoryAction = 'stm_ltm';
      } else if (profile.memory.injectLTM) {
        memoryAction = 'ltm';
      } else if (profile.memory.injectSTM) {
        memoryAction = 'stm';
      }
    } else {
      reasons.push('RC_MEMORY_UNAVAILABLE');
      memoryAction = 'none';
    }
  }

  // Provider
  const providerChoice = providerAvailable
    ? (profile.preferredProviders[0] ?? 'auto')
    : null;
  if (!providerAvailable) {
    reasons.push('RC_HOLD_NO_PROVIDER');
  } else {
    reasons.push('RC_OK_INFER');
  }

  // Web
  let webAction: DiscernmentDecision['webAction'] = 'none';
  if (
    inferenceState === 'SAFE_TO_INFER' &&
    webAvailable &&
    (taskType === 'question' || taskType === 'data')
  ) {
    webAction = 'search';
  } else if (!webAvailable && (taskType === 'question' || taskType === 'data')) {
    reasons.push('RC_WEB_UNAVAILABLE');
  }

  // Tool
  let toolAction: DiscernmentDecision['toolAction'] = 'none';
  if (taskType === 'code' && toolAvailable) {
    toolAction = 'tool';
  } else if (taskType === 'code' && !toolAvailable) {
    reasons.push('RC_TOOL_UNAVAILABLE');
  }

  // ask/act/hold
  let askActHold: AskActHold = 'act';
  if (!providerAvailable) {
    askActHold = 'hold';
  }

  // Truth label (no runtime proof yet)
  const truthLabel: TruthLabel = 'WIRED_BUT_UNPROVEN';

  return {
    profileId,
    initiativeLevel: initiative,
    memoryAction,
    webAction,
    toolAction,
    providerChoice,
    askActHold,
    truthLabel,
    reasonCodes: reasons,
  };
}
