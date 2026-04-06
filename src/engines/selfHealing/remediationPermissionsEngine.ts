import {
  REMEDIATION_PERMISSION_MODEL,
  type RemediationInstruction,
  type RemediationPermissionSet,
} from '@/types';

export interface RemediationPermissionDecision {
  allowed: boolean;
  reason: string;
  permissionSet: RemediationPermissionSet;
}

export function resolveRemediationPermissionSet(
  playbookId?: string
): RemediationPermissionSet {
  const playbookPermissionSet = playbookId
    ? REMEDIATION_PERMISSION_MODEL[playbookId]
    : undefined;
  if (playbookPermissionSet) {
    return playbookPermissionSet;
  }

  const defaultPermissionSet = REMEDIATION_PERMISSION_MODEL.default;
  if (defaultPermissionSet) {
    return defaultPermissionSet;
  }

  return {
    playbookId: 'default-fallback',
    allowedCommands: [],
    allowedStores: [],
    allowedStatePathPrefixes: [],
    sandboxPathPrefixes: [],
  };
}

export function evaluateRemediationInstructionPermission(
  instruction: RemediationInstruction,
  playbookId?: string
): RemediationPermissionDecision {
  const permissionSet = resolveRemediationPermissionSet(playbookId);

  if (instruction.action === 'invoke') {
    const allowed = permissionSet.allowedCommands.includes(instruction.command);
    return {
      allowed,
      reason: allowed ? 'INVOKE_ALLOWED' : `INVOKE_DENIED:${instruction.command}`,
      permissionSet,
    };
  }

  if (instruction.action === 'store-reset') {
    const allowed = permissionSet.allowedStores.includes(instruction.store);
    return {
      allowed,
      reason: allowed ? 'STORE_RESET_ALLOWED' : `STORE_RESET_DENIED:${instruction.store}`,
      permissionSet,
    };
  }

  const allowed = permissionSet.allowedStatePathPrefixes.some(prefix =>
    instruction.path.startsWith(prefix)
  );

  return {
    allowed,
    reason: allowed ? 'STATE_UPDATE_ALLOWED' : `STATE_UPDATE_DENIED:${instruction.path}`,
    permissionSet,
  };
}
