export type UserCoreModelDecisionKey =
  | 'ucmCore'
  | 'ucmEvidenceCapture'
  | 'ucmEventReplay'
  | 'ucmGovernedRecall'
  | 'ucmPromptProjection'
  | 'ucmConsentFeedbackLoop'
  | 'ucmSubsystemConvergence'
  | 'ucmChannelUnification'
  | 'ucmRuntimeObservability';

export interface UserCoreModelDecisionDefinition {
  key: UserCoreModelDecisionKey;
  owner: string;
  stage: 'release' | 'permission' | 'observability';
  defaultValue: boolean;
  description: string;
  envVar: string;
  runtimeKey: string;
}

export interface UserCoreModelDecisionActor {
  internalUser?: boolean;
  consentGranted?: boolean;
  canUsePersonalData?: boolean;
}

export interface ResolveUserCoreModelDecisionInput {
  env?: Record<string, string | undefined>;
  runtime?: Partial<Record<UserCoreModelDecisionKey, boolean>>;
  actor?: UserCoreModelDecisionActor;
}

export interface ResolvedUserCoreModelDecisions {
  values: Record<UserCoreModelDecisionKey, boolean>;
  sources: Record<UserCoreModelDecisionKey, 'runtime' | 'env' | 'default' | 'policy'>;
}

export const USER_CORE_MODEL_DECISIONS: Record<
  UserCoreModelDecisionKey,
  UserCoreModelDecisionDefinition
> = {
  ucmCore: {
    key: 'ucmCore',
    owner: 'identity-runtime',
    stage: 'release',
    defaultValue: false,
    description: 'Master switch for User Core Model runtime.',
    envVar: 'VITE_UCM_CORE',
    runtimeKey: 'titane.ucm.core',
  },
  ucmEvidenceCapture: {
    key: 'ucmEvidenceCapture',
    owner: 'identity-runtime',
    stage: 'permission',
    defaultValue: false,
    description: 'Capture durable evidence events for user modeling.',
    envVar: 'VITE_UCM_EVIDENCE_CAPTURE',
    runtimeKey: 'titane.ucm.evidenceCapture',
  },
  ucmEventReplay: {
    key: 'ucmEventReplay',
    owner: 'identity-runtime',
    stage: 'release',
    defaultValue: false,
    description: 'Enable append-only event replay for UCM timelines.',
    envVar: 'VITE_UCM_EVENT_REPLAY',
    runtimeKey: 'titane.ucm.eventReplay',
  },
  ucmGovernedRecall: {
    key: 'ucmGovernedRecall',
    owner: 'identity-runtime',
    stage: 'permission',
    defaultValue: false,
    description: 'Allow governed recall from UCM evidence snapshots.',
    envVar: 'VITE_UCM_GOVERNED_RECALL',
    runtimeKey: 'titane.ucm.governedRecall',
  },
  ucmPromptProjection: {
    key: 'ucmPromptProjection',
    owner: 'identity-runtime',
    stage: 'permission',
    defaultValue: false,
    description: 'Project UCM profile into conversational prompts.',
    envVar: 'VITE_UCM_PROMPT_PROJECTION',
    runtimeKey: 'titane.ucm.promptProjection',
  },
  ucmConsentFeedbackLoop: {
    key: 'ucmConsentFeedbackLoop',
    owner: 'identity-runtime',
    stage: 'permission',
    defaultValue: false,
    description: 'Allow user-facing consent and correction feedback loops.',
    envVar: 'VITE_UCM_CONSENT_FEEDBACK_LOOP',
    runtimeKey: 'titane.ucm.consentFeedbackLoop',
  },
  ucmSubsystemConvergence: {
    key: 'ucmSubsystemConvergence',
    owner: 'identity-runtime',
    stage: 'release',
    defaultValue: false,
    description: 'Enable subsystem convergence on a shared UCM profile.',
    envVar: 'VITE_UCM_SUBSYSTEM_CONVERGENCE',
    runtimeKey: 'titane.ucm.subsystemConvergence',
  },
  ucmChannelUnification: {
    key: 'ucmChannelUnification',
    owner: 'identity-runtime',
    stage: 'release',
    defaultValue: false,
    description: 'Unify multi-channel identity decisions behind UCM.',
    envVar: 'VITE_UCM_CHANNEL_UNIFICATION',
    runtimeKey: 'titane.ucm.channelUnification',
  },
  ucmRuntimeObservability: {
    key: 'ucmRuntimeObservability',
    owner: 'identity-runtime',
    stage: 'observability',
    defaultValue: false,
    description: 'Enable runtime observability for UCM decisions.',
    envVar: 'VITE_UCM_RUNTIME_OBSERVABILITY',
    runtimeKey: 'titane.ucm.runtimeObservability',
  },
};

const ALL_DECISION_KEYS = Object.keys(
  USER_CORE_MODEL_DECISIONS
) as UserCoreModelDecisionKey[];

const PERSONAL_DATA_KEYS: UserCoreModelDecisionKey[] = [
  'ucmEvidenceCapture',
  'ucmGovernedRecall',
  'ucmPromptProjection',
  'ucmConsentFeedbackLoop',
];

const INTERNAL_USER_KEYS: UserCoreModelDecisionKey[] = [
  'ucmSubsystemConvergence',
  'ucmChannelUnification',
];

function parseBooleanFlag(value: string | undefined): boolean | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) {
    return false;
  }

  return undefined;
}

function resolveFlag(
  decision: UserCoreModelDecisionDefinition,
  input: ResolveUserCoreModelDecisionInput
): { value: boolean; source: 'runtime' | 'env' | 'default' } {
  const runtimeValue = input.runtime?.[decision.key];
  if (typeof runtimeValue === 'boolean') {
    return { value: runtimeValue, source: 'runtime' };
  }

  const envFlag = parseBooleanFlag(input.env?.[decision.envVar]);
  if (typeof envFlag === 'boolean') {
    return { value: envFlag, source: 'env' };
  }

  return { value: decision.defaultValue, source: 'default' };
}

export function resolveUserCoreModelDecisions(
  input: ResolveUserCoreModelDecisionInput = {}
): ResolvedUserCoreModelDecisions {
  const values = {} as Record<UserCoreModelDecisionKey, boolean>;
  const sources = {} as Record<
    UserCoreModelDecisionKey,
    'runtime' | 'env' | 'default' | 'policy'
  >;

  for (const key of ALL_DECISION_KEYS) {
    const result = resolveFlag(USER_CORE_MODEL_DECISIONS[key], input);
    values[key] = result.value;
    sources[key] = result.source;
  }

  if (!values.ucmCore) {
    for (const key of ALL_DECISION_KEYS) {
      if (key !== 'ucmCore') {
        values[key] = false;
        sources[key] = 'policy';
      }
    }

    return { values, sources };
  }

  const actor = input.actor ?? {};
  const canUsePersonalData = Boolean(
    actor.canUsePersonalData ?? actor.consentGranted ?? false
  );
  if (!canUsePersonalData) {
    for (const key of PERSONAL_DATA_KEYS) {
      values[key] = false;
      sources[key] = 'policy';
    }
  }

  const internalUser = Boolean(actor.internalUser);
  if (!internalUser) {
    for (const key of INTERNAL_USER_KEYS) {
      values[key] = false;
      sources[key] = 'policy';
    }
  }

  return { values, sources };
}

export function isUserCoreModelDecisionEnabled(
  key: UserCoreModelDecisionKey,
  input: ResolveUserCoreModelDecisionInput = {}
): boolean {
  return resolveUserCoreModelDecisions(input).values[key];
}
