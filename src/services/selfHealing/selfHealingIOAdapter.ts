/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING IO ADAPTER (Ring 3 — Services)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Couche I/O du pipeline self-healing.
 * Contient toutes les fonctions qui utilisent safeInvoke/queryOllama (I/O).
 * Le Ring2 (selfHealingEngine.ts) reste pur : pas d'imports I/O.
 *
 * FIX: RV-001 — déplace l'I/O de Ring2 vers Ring3.
 */

import { queryOllama } from '@/utils/ollama';
import { safeInvoke } from '@/utils/invoke';
import { singularityEngine } from '@/core/engines/SINGULARITY_ENGINE';
import {
  evaluateRemediationInstructionPermission,
  type RemediationPermissionDecision,
} from '@/engines/selfHealing/remediationPermissionsEngine';
import {
  selectPlaybook,
  buildPrompt,
  parseLocalResponse,
  clampConfidence,
  isEscalationChannel,
  normalizePatch,
} from '@/engines/selfHealing/selfHealingEngine';
import type {
  SelfHealingLogEntry,
  SelfHealingContext,
  SelfHealingRunResult,
  SelfHealingStructuredResult,
  ApplyPatchResult,
  EscalationResult,
  EscalationChannel,
  PlaybookPlan,
} from '@/engines/selfHealing/selfHealingEngine';

export type {
  SelfHealingLogEntry,
  SelfHealingContext,
  SelfHealingRunResult,
  SelfHealingStructuredResult,
  ApplyPatchResult,
  EscalationResult,
  EscalationChannel,
  PlaybookPlan,
};

// ─────────────────────────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────────────────────────

type EngineSingularityState = ReturnType<typeof singularityEngine.getState>;
type EngineSingularityPartial = Parameters<typeof singularityEngine.setState>[0];

interface MinimalInvokePatch {
  action: 'invoke';
  command: string;
  payload?: Record<string, unknown>;
}

interface MinimalStatePatch {
  action: 'state-update';
  path: string;
  value: unknown;
}

interface MinimalStoreResetPatch {
  action: 'store-reset';
  store: string;
}

type MinimalPatchInstruction =
  | MinimalInvokePatch
  | MinimalStatePatch
  | MinimalStoreResetPatch;

interface PatchExecutionOptions {
  playbookId?: string;
}

const CONFIDENCE_THRESHOLD = 0.65;

// ─────────────────────────────────────────────────────────────────
// DATA COLLECTION (I/O Ring 3)
// ─────────────────────────────────────────────────────────────────

export async function collectLogs(): Promise<SelfHealingLogEntry[]> {
  try {
    const rawLogs = await safeInvoke<unknown[]>('get_logs');

    if (!Array.isArray(rawLogs)) {
      return [];
    }

    const normalized: SelfHealingLogEntry[] = [];

    for (const entry of rawLogs) {
      if (typeof entry !== 'object' || entry === null) {
        continue;
      }

      const item = entry as Record<string, unknown>;
      const timestamp = typeof item.timestamp === 'number' ? item.timestamp : Date.now();
      const level = typeof item.level === 'string' ? item.level : 'INFO';
      const message =
        typeof item.message === 'string' ? item.message : JSON.stringify(item);
      const target = typeof item.target === 'string' ? item.target : undefined;
      const scope = typeof item.scope === 'string' ? item.scope : undefined;

      normalized.push({ timestamp, level, message, target, scope });
    }

    return normalized;
  } catch (error) {
    console.error('[SelfHealing] collectLogs failed:', error);
    return [];
  }
}

export async function collectState(): Promise<EngineSingularityState | null> {
  try {
    const remoteState = await safeInvoke<EngineSingularityState>('singularity_get_state');

    if (remoteState) {
      return remoteState;
    }
  } catch (error) {
    console.warn('[SelfHealing] collectState invoke fallback:', error);
  }

  try {
    if (typeof singularityEngine.getState === 'function') {
      return singularityEngine.getState();
    }
  } catch (error) {
    console.error('[SelfHealing] collectState engine fallback failed:', error);
  }

  return null;
}

async function fetchRecentInvocations(): Promise<string[]> {
  try {
    const logs = await safeInvoke<unknown[]>('read_logs', { count: 10 });
    if (!Array.isArray(logs)) {
      return [];
    }

    return logs
      .map(entry => {
        if (typeof entry !== 'object' || entry === null) {
          return null;
        }

        const item = entry as Record<string, unknown>;
        return typeof item.message === 'string' ? item.message : null;
      })
      .filter((message): message is string => Boolean(message));
  } catch (error) {
    console.warn('[SelfHealing] fetchRecentInvocations failed:', error);
    return [];
  }
}

async function fetchUiAnomalies(): Promise<string[]> {
  try {
    const health = await safeInvoke<Record<string, unknown>>('get_system_health');
    if (!health) {
      return [];
    }

    const anomalies: string[] = [];

    if (typeof health.health === 'string' && health.health !== 'healthy') {
      anomalies.push(`health-status:${health.health}`);
    }

    if (typeof health.error_count === 'number' && health.error_count > 0) {
      anomalies.push(`errors:${health.error_count}`);
    }

    if (typeof health.modules === 'object' && health.modules !== null) {
      const modules = health.modules as Record<string, unknown>;
      for (const [module, status] of Object.entries(modules)) {
        if (status === false) {
          anomalies.push(`module:${module}:offline`);
        }
      }
    }

    return anomalies;
  } catch (_error) {
    return [];
  }
}

async function fetchSelfHealingMetadata(): Promise<Record<string, unknown>> {
  try {
    const info = await safeInvoke<Record<string, unknown>>('get_system_info');
    return info ?? {};
  } catch (_error) {
    return {};
  }
}

export async function collectContext(symptoms: string): Promise<SelfHealingContext> {
  const recentInvocations = await fetchRecentInvocations();
  const uiAnomalies = await fetchUiAnomalies();
  const metadata = await fetchSelfHealingMetadata();
  const lastMessage = recentInvocations[0];

  return {
    symptoms,
    logs: [],
    state: null,
    recentInvocations,
    uiAnomalies,
    metadata,
    lastMessage,
  };
}

// ─────────────────────────────────────────────────────────────────
// OLLAMA (I/O Ring 3)
// ─────────────────────────────────────────────────────────────────

export async function callTitaneLocal(prompt: string): Promise<string> {
  try {
    const response = await queryOllama(prompt);
    return response.trim();
  } catch (error) {
    console.error('[SelfHealing] callTitaneLocal failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────
// PATCH EXECUTION (I/O Ring 3)
// ─────────────────────────────────────────────────────────────────

async function emitRemediationPermissionAudit(
  instruction: MinimalPatchInstruction,
  decision: RemediationPermissionDecision,
  playbookId?: string
): Promise<void> {
  const kind = decision.allowed
    ? 'remediation_permission_granted'
    : 'remediation_permission_denied';

  const payload = {
    kind,
    timestamp: Date.now(),
    playbookId: playbookId ?? 'default',
    action: instruction.action,
    reason: decision.reason,
    allowed: decision.allowed,
  };

  await Promise.allSettled([
    safeInvoke('write_log', { log: payload }),
    safeInvoke('add_timeline_event', {
      event: {
        id: `remediation-perm-${payload.timestamp}`,
        timestamp: payload.timestamp,
        event_type: kind,
        description: `${payload.action} ${payload.allowed ? 'granted' : 'denied'} (${payload.reason})`,
      },
    }),
  ]);
}

function buildPartialFromPath(
  segments: string[],
  value: unknown
): EngineSingularityPartial {
  const root: Record<string, unknown> = {};
  let cursor = root;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    const existing = cursor[segment];
    if (typeof existing === 'object' && existing !== null) {
      cursor = existing as Record<string, unknown>;
    } else {
      const nested: Record<string, unknown> = {};
      cursor[segment] = nested;
      cursor = nested;
    }
  });

  return root as EngineSingularityPartial;
}

function applyStateUpdate(path: string, value: unknown): void {
  const segments = path
    .split('.')
    .map(segment => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    throw new Error('Chemin de mise à jour vide.');
  }

  const partial = buildPartialFromPath(segments, value);
  singularityEngine.setState(partial);
}

async function resetStore(storeName: string): Promise<void> {
  const supportedStores: Record<string, () => Promise<unknown>> = {
    ui: () => safeInvoke('system_optimize'),
    memory: () => safeInvoke('reset_memory'),
  };

  const resetFn = supportedStores[storeName];

  if (!resetFn) {
    throw new Error(`Store inconnu ou non supported: ${storeName}`);
  }

  await resetFn();
}

export async function applyMinimalPatch(
  patch: unknown,
  options?: PatchExecutionOptions
): Promise<ApplyPatchResult> {
  const steps: string[] = [];
  const errors: string[] = [];

  const instructions = normalizePatch(patch) as MinimalPatchInstruction[];

  for (const instruction of instructions) {
    const permission = evaluateRemediationInstructionPermission(
      instruction as Parameters<typeof evaluateRemediationInstructionPermission>[0],
      options?.playbookId
    );
    await emitRemediationPermissionAudit(instruction, permission, options?.playbookId);

    if (!permission.allowed) {
      errors.push(`PERMISSION_DENIED:${permission.reason}`);
      continue;
    }

    try {
      switch (instruction.action) {
        case 'invoke': {
          await safeInvoke(instruction.command, instruction.payload ?? {});
          steps.push(`invoke:${instruction.command}`);
          break;
        }
        case 'state-update': {
          applyStateUpdate(instruction.path, instruction.value);
          steps.push(`state-update:${instruction.path}`);
          break;
        }
        case 'store-reset': {
          await resetStore(instruction.store);
          steps.push(`store-reset:${instruction.store}`);
          break;
        }
        default: {
          errors.push(
            `Action inconnue: ${(instruction as MinimalPatchInstruction).action}`
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  return {
    applied: steps.length > 0 && errors.length === 0,
    steps,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────
// ESCALATION & LEARNING (I/O Ring 3)
// ─────────────────────────────────────────────────────────────────

export async function escalateIfNeeded(
  result: SelfHealingStructuredResult
): Promise<EscalationResult> {
  const confidence = clampConfidence(result.confidence);

  if (confidence >= CONFIDENCE_THRESHOLD && result.escalade === 'aucune') {
    return {
      triggered: false,
      channel: 'aucune',
      reason: "Confiance suffisante, pas d'escalade.",
    };
  }

  const channel: EscalationChannel =
    result.escalade === 'aucune' && confidence < CONFIDENCE_THRESHOLD
      ? 'codex'
      : result.escalade;

  console.warn('[SelfHealing] Escalation triggered:', {
    channel,
    confidence,
    diagnostic: result.diagnostic,
  });

  await safeInvoke('write_log', {
    log: {
      kind: 'self-healing-escalation',
      channel,
      confidence,
      diagnostic: result.diagnostic,
      timestamp: Date.now(),
    },
  });

  return {
    triggered: true,
    channel,
    reason:
      confidence < CONFIDENCE_THRESHOLD
        ? 'Confiance insuffisante (< 0.65).'
        : `Escalade demandée par TITANE Local (${channel}).`,
  };
}

async function syncSingularityLearning(result: SelfHealingRunResult): Promise<void> {
  try {
    const current = singularityEngine.getState();
    const interpretations = [
      {
        type: 'self-healing-trace',
        confidence: result.parsed.confidence,
        description: result.parsed.diagnostic,
        timestamp: Date.now(),
      },
      ...current.overmind.interpretations,
    ].slice(0, 16);

    singularityEngine.setState({
      overmind: {
        ...current.overmind,
        interpretations,
      },
    } as EngineSingularityPartial);
  } catch (error) {
    console.warn('[SelfHealing] syncSingularityLearning failed:', error);
  }
}

export async function storeLearning(result: SelfHealingRunResult): Promise<void> {
  const data = result;

  const record = {
    kind: 'self-healing-cycle',
    timestamp: Date.now(),
    symptoms: data.context.symptoms,
    playbookId: data.playbook.id,
    diagnostic: data.parsed.diagnostic,
    confidence: data.parsed.confidence,
    escalation: data.escalation,
    patchApplied: data.patchResult,
  };

  await Promise.allSettled([
    safeInvoke('write_log', { log: record }),
    safeInvoke('add_timeline_event', {
      event: {
        id: `self-healing-${record.timestamp}`,
        timestamp: record.timestamp,
        event_type: 'SelfHealingCycle',
        description: `Playbook ${data.playbook.id} appliqué (confiance ${(record.confidence * 100).toFixed(0)}%).`,
      },
    }),
    syncSingularityLearning(data),
  ]);
}

// ─────────────────────────────────────────────────────────────────
// PIPELINE ORCHESTRATION (Ring 3 — I/O entry point)
// ─────────────────────────────────────────────────────────────────

/**
 * Point d'entrée principal du pipeline self-healing.
 * Collecte les données (I/O), délègue la logique pure au Ring2,
 * puis exécute les actions correctives (I/O).
 */
export async function runSelfHealing(symptoms: string): Promise<SelfHealingRunResult> {
  const logs = await collectLogs();
  const state = await collectState();
  const baseContext = await collectContext(symptoms);

  const context: SelfHealingContext = {
    ...baseContext,
    logs,
    state,
    lastMessage: baseContext.lastMessage ?? logs[logs.length - 1]?.message,
  };

  const playbook = await selectPlaybook(symptoms);
  const prompt = await buildPrompt(context, JSON.stringify(playbook, null, 2));
  const rawResponse = await callTitaneLocal(prompt);
  const parsed = await parseLocalResponse(rawResponse);
  const patchResult = await applyMinimalPatch(parsed.patch, {
    playbookId: playbook.id,
  });
  const escalation = await escalateIfNeeded(parsed);

  const finalResult: SelfHealingRunResult = {
    context,
    playbook,
    prompt,
    rawResponse,
    parsed,
    patchResult,
    escalation,
  };

  await storeLearning(finalResult);

  return finalResult;
}
