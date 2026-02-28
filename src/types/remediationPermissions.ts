export type RemediationInstructionAction = 'invoke' | 'state-update' | 'store-reset';

export interface RemediationInvokeInstruction {
  action: 'invoke';
  command: string;
  payload?: Record<string, unknown>;
}

export interface RemediationStateUpdateInstruction {
  action: 'state-update';
  path: string;
  value: unknown;
}

export interface RemediationStoreResetInstruction {
  action: 'store-reset';
  store: string;
}

export type RemediationInstruction =
  | RemediationInvokeInstruction
  | RemediationStateUpdateInstruction
  | RemediationStoreResetInstruction;

export interface RemediationPermissionSet {
  playbookId: string;
  allowedCommands: string[];
  allowedStores: string[];
  allowedStatePathPrefixes: string[];
  sandboxPathPrefixes: string[];
}

export const DEFAULT_REMEDIATION_PERMISSION_SET: RemediationPermissionSet = {
  playbookId: 'default',
  allowedCommands: ['system_optimize', 'reset_memory', 'write_log', 'add_timeline_event'],
  allowedStores: ['ui', 'memory'],
  allowedStatePathPrefixes: ['overmind.interpretations', 'monitoring', 'status'],
  sandboxPathPrefixes: ['runtime/', 'memory/', 'logs/'],
};

export const REMEDIATION_PERMISSION_MODEL: Record<string, RemediationPermissionSet> = {
  default: DEFAULT_REMEDIATION_PERMISSION_SET,
  'runtime-errors': {
    ...DEFAULT_REMEDIATION_PERMISSION_SET,
    playbookId: 'runtime-errors',
  },
  'ui-desync': {
    ...DEFAULT_REMEDIATION_PERMISSION_SET,
    playbookId: 'ui-desync',
  },
  'performance-drift': {
    ...DEFAULT_REMEDIATION_PERMISSION_SET,
    playbookId: 'performance-drift',
  },
};
