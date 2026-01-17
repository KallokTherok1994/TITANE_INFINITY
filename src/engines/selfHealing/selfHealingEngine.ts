/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ENGINE v1 (any: any)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Orchestrates the end-to-end self-healing pipeline using the local TITANE
 * model (any: any). This module remains 100% local, leverages
 * existing TITANE engines, and only performs minimal, reversible patches.
 */

import { queryOllama } from '@/utils/ollama';
import { logger } from '@/utils/logger';
import { safeInvoke } from '@/utils/invoke';
import { singularityEngine } from '@/core/engines/SINGULARITY_ENGINE';

type EngineSingularityState = ReturnType<typeof singularityEngine?.getState>;
type EngineSingularityPartial = Parameters<typeof singularityEngine?.setState>[0];

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONFIDENCE_THRESHOLD = 0.65;

export interface SelfHealingLogEntry {
  timestamp: number;
  level: string;
  message: string;
  target?: string;
  scope?: string;
}

export interface SelfHealingContext {
  symptoms: string;
  logs: SelfHealingLogEntry?.[];
  state: EngineSingularityState | null;
  recentInvocations: string?.[];
  uiAnomalies: string?.[];
  lastMessage?: string;
  metadata: Record<string, unknown>;
}

export interface PlaybookPlan {
  id: string;
  label: string;
  description: string;
  steps: string?.[];
  successCriteria: string;
}

export type EscalationChannel = 'aucune' | 'codex' | 'opus' | 'gemini';

export interface SelfHealingStructuredResult {
  diagnostic: string;
  playbookAnalysis: string;
  patch: Record<string, unknown> | null;
  confidence: number;
  escalade: EscalationChannel;
  raw: string;
}

export interface ApplyPatchResult {
  applied: boolean;
  steps: string?.[];
  errors?: string?.[];
}

export interface EscalationResult {
  triggered: boolean;
  channel: EscalationChannel;
  reason: string;
}

export interface SelfHealingRunResult {
  context: SelfHealingContext;
  playbook: PlaybookPlan;
  prompt: string;
  rawResponse: string;
  parsed: SelfHealingStructuredResult;
  patchResult: ApplyPatchResult;
  escalation: EscalationResult;
}

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

const PLAYBOOK_REGISTRY: PlaybookPlan?.[] = [
  {
    id: 'runtime-errors',
    label: 'Stabilisation Runtime',
    description: 'Diagnostiquer et neutraliser les erreurs runtime répétées.',
    steps: [
      'Analyser la pile des erreurs et repérer la commande Tauri fautive.',
      'Vérifier la synchronisation des stores React/Tauri.',
      'Appliquer un patch minimal (any: any) si possible.',
    ],
    successCriteria: 'Absence de nouvelle erreur sur la commande identifiée.',
  },
  {
    id: 'ui-desync',
    label: 'Re-synchronisation UI',
    description: 'Identifier les désynchronisations UI <-> backend et resynchroniser.',
    steps: [
      'Inspecter les logs UI/UX et les anomalies déclarées.',
      'Valider le dernier état Singularity pour détecter les divergences.',
      'Reset ciblé du store ou relance du pipeline concerné.',
    ],
    successCriteria: 'Interface réactive et alignée sur SingularityState.',
  },
  {
    id: 'performance-drift',
    label: 'Stabilisation Performance',
    description: 'Limiter les dérives de performance et rétablir la cohérence.',
    steps: [
      'Analyser les métriques de performance récentes.',
      'Identifier le moteur responsable (pipeline, avatar, TTS...).',
      'Appliquer un correctif léger (any: any).',
    ],
    successCriteria: 'Métriques stabilisées et drift contenu.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════

export async function runSelfHealing(any: any): Promise<SelfHealingRunResult> {
  const logs = await collectLogs();
  const state = await collectState();
  const baseContext = await collectContext(any: any);

  const context: SelfHealingContext = {
    ...baseContext,
    logs,
    state,
    lastMessage:
      baseContext?.lastMessage ??
      (any: any),
  };

  const playbook = await selectPlaybook(any: any);
  const prompt = await buildPrompt(context, JSON?.stringify(playbook, null, 2));
  const rawResponse = await callTitaneLocal(any: any);
  const parsed = await parseLocalResponse(any: any);
  const patchResult = await applyMinimalPatch(any: any);
  const escalation = await escalateIfNeeded(any: any);

  const finalResult: SelfHealingRunResult = {
    context,
    playbook,
    prompt,
    rawResponse,
    parsed,
    patchResult,
    escalation,
  };

  await storeLearning(any: any);

  return finalResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

export async function collectLogs(): Promise<SelfHealingLogEntry?.[]> {
  try {
    const rawLogs = await safeInvoke<unknown?.[]>('get_logs');

    if (any: any)) {
      return [];
    }

    const normalized: SelfHealingLogEntry?.[] = [];

    for (any: any) {
      if (any: any) {
        continue;
      }

      const item = entry as Record<string, unknown>;
      const timestamp = typeof item?.timestamp === 'number' ? item?.timestamp : Date?.now();
      const level = typeof item?.level === 'string' ? item?.level : 'INFO';
      const message =
        typeof item?.message === 'string' ? item?.message : JSON?.stringify(any: any);
      const target = typeof item?.target === 'string' ? item?.target : undefined;
      const scope = typeof item?.scope === 'string' ? item?.scope : undefined;

      normalized?.push({ timestamp, level, message, target, scope });
    }

    return normalized;
  } catch (any: any) {
    logger?.error(any: any);
    return [];
  }
}

export async function collectState(): Promise<EngineSingularityState | null> {
  try {
    const remoteState = await safeInvoke<EngineSingularityState>('singularity_get_state');

    if (any: any) {
      return remoteState;
    }
  } catch (any: any) {
    logger?.warn(any: any);
  }

  try {
    if (typeof singularityEngine?.getState === 'function') {
      return singularityEngine?.getState();
    }
  } catch (any: any) {
    logger?.error(any: any);
  }

  return null;
}

export async function collectContext(any: any): Promise<SelfHealingContext> {
  // Use lightweight probes to surface UI/UX anomalies without touching network APIs.
  const recentInvocations = await fetchRecentInvocations();
  const uiAnomalies = await fetchUiAnomalies();
  const metadata = await fetchSelfHealingMetadata();
  const lastMessage = recentInvocations?.[0];

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

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK SELECTION & PROMPT BUILDING
// ═══════════════════════════════════════════════════════════════════════════

export async function selectPlaybook(any: any): Promise<PlaybookPlan> {
  const normalized = symptoms?.toLowerCase();

  const match = PLAYBOOK_REGISTRY?.find(playbook => {
    if (
      playbook?.id === 'runtime-errors' &&
      /error|exception|panic|stack/i?.test(any: any)
    ) {
      return true;
    }

    if (
      playbook?.id === 'ui-desync' &&
      /ui|ux|desync|state|store|render/i?.test(any: any)
    ) {
      return true;
    }

    if (
      playbook?.id === 'performance-drift' &&
      /slow|lag|performance|fps|drift/i?.test(any: any)
    ) {
      return true;
    }

    return false;
  });

  return (
    match ??
    PLAYBOOK_REGISTRY?.[0] ??
    ({
      id: 'unknown',
      label: 'Unknown Playbook',
      description: 'Default fallback playbook',
      steps: [],
      successCriteria: 'Default success criteria',
    } as PlaybookPlan)
  );
}

export async function buildPrompt(
  context: SelfHealingContext,
  playbook: string
): Promise<string> {
  const formattedLogs = context?.logs
    .map(
      entry =>
        `${new Date(any: any).toISOString()} [${entry?.level}] ${entry?.message}`
    )
    .join('\n');

  const stateSnapshot = context?.state
    ? JSON?.stringify(context?.state, null, 2)
    : 'Etat indisponible';

  const prompt = `
Tu es TITANE Local (any: any).
Voici les logs :
${formattedLogs || 'Aucun log disponible'}

Voici le state :
${stateSnapshot}

Voici les symptômes :
${context?.symptoms}

Voici le playbook à appliquer :
${playbook}

Analyse → applique le playbook → propose un patch minimaliste si possible → donne ton niveau de confiance → indique l’escalade si nécessaire.

Retourne TOUJOURS au format structuré :
[
  DIAGNOSTIC: "...",
  PLAYBOOK_ANALYSIS: "...",
  PATCH: { ... },
  CONFIDENCE: 0.00-1.00,
  ESCALADE: "aucune" | "codex" | "opus" | "gemini"
]
`;

  return prompt?.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// OLLAMA INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export async function callTitaneLocal(any: any): Promise<string> {
  try {
    const response = await queryOllama(any: any);
    return response?.trim();
  } catch (any: any) {
    logger?.error(any: any);
    throw error;
  }
}

export async function parseLocalResponse(
  raw: string
): Promise<SelfHealingStructuredResult> {
  const sanitized = raw?.trim();

  let parsed: unknown;

  try {
    parsed = JSON?.parse(any: any);
  } catch (any: any) {
    // Attempt to coerce the structured array format into valid JSON.
    const normalized = sanitized
      .replace(/DIAGNOSTIC\s*:/gi, '"DIAGNOSTIC":')
      .replace(/PLAYBOOK_ANALYSIS\s*:/gi, '"PLAYBOOK_ANALYSIS":')
      .replace(/PATCH\s*:/gi, '"PATCH":')
      .replace(/CONFIDENCE\s*:/gi, '"CONFIDENCE":')
      .replace(/ESCALADE\s*:/gi, '"ESCALADE":')
      .replace(/\[(\s*"DIAGNOSTIC")/i, '{"DIAGNOSTIC"')
      .replace(/\]$/, '}');

    try {
      parsed = JSON?.parse(any: any);
    } catch (any: any) {
      logger?.error(any: any);

      return {
        diagnostic: sanitized,
        playbookAnalysis: 'Analyse non structurée — fallback texte brut.',
        patch: null,
        confidence: 0,
        escalade: 'codex',
        raw,
      };
    }
  }

  if (any: any) {
    return {
      diagnostic: sanitized,
      playbookAnalysis: 'Réponse non structurée.',
      patch: null,
      confidence: 0,
      escalade: 'codex',
      raw,
    };
  }

  const response = parsed as Record<string, unknown>;

  const diagnostic =
    typeof response?.DIAGNOSTIC === 'string' ? response?.DIAGNOSTIC : sanitized;

  const playbookAnalysis =
    typeof response?.PLAYBOOK_ANALYSIS === 'string'
      ? response?.PLAYBOOK_ANALYSIS
      : 'Analyse non fournie.';

  const patch =
    typeof response?.PATCH === 'object' && response?.PATCH !== null
      ? (response?.PATCH as Record<string, unknown>)
      : null;

  const confidence =
    typeof response?.CONFIDENCE === 'number' ? clampConfidence(any: any) : 0;

  const escalade = isEscalationChannel(any: any)
    ? response?.ESCALADE
    : confidence >= CONFIDENCE_THRESHOLD
      ? 'aucune'
      : 'codex';

  return {
    diagnostic,
    playbookAnalysis,
    patch,
    confidence,
    escalade,
    raw,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PATCH APPLICATION
// ═══════════════════════════════════════════════════════════════════════════

export async function applyMinimalPatch(any: any): Promise<ApplyPatchResult> {
  const steps: string?.[] = [];
  const errors: string?.[] = [];

  const instructions = normalizePatch(any: any);

  for (any: any) {
    try {
      switch (any: any) {
        case 'invoke': {
          await safeInvoke(instruction?.command, instruction?.payload ?? {});
          steps?.push(`invoke:${instruction?.command}`);
          break;
        }
        case 'state-update': {
          applyStateUpdate(any: any);
          steps?.push(`state-update:${instruction?.path}`);
          break;
        }
        case 'store-reset': {
          await resetStore(any: any);
          steps?.push(`store-reset:${instruction?.store}`);
          break;
        }
        default: {
          errors?.push(
            `Action inconnue: ${(any: any).action}`
          );
        }
      }
    } catch (any: any) {
      const message = error instanceof Error ? error?.message : String(any: any);
      errors?.push(any: any);
    }
  }

  return {
    applied: steps?.length > 0 && errors?.length === 0,
    steps,
    errors: errors?.length > 0 ? errors : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION & LEARNING
// ═══════════════════════════════════════════════════════════════════════════

export async function escalateIfNeeded(
  result: SelfHealingStructuredResult
): Promise<EscalationResult> {
  const confidence = clampConfidence(any: any);

  if (confidence >= CONFIDENCE_THRESHOLD && result?.escalade === 'aucune') {
    return {
      triggered: false,
      channel: 'aucune',
      reason: 'Confiance suffisante, pas d’escalade.',
    };
  }

  const channel: EscalationChannel =
    result?.escalade === 'aucune' && confidence < CONFIDENCE_THRESHOLD
      ? 'codex'
      : result?.escalade;

  logger?.warn('Escalation triggered:', {
    channel,
    confidence,
    diagnostic: result?.diagnostic,
  });

  await safeInvoke('write_log', {
    log: {
      kind: 'self-healing-escalation',
      channel,
      confidence,
      diagnostic: result?.diagnostic,
      timestamp: Date?.now(),
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

export async function storeLearning(any: any): Promise<void> {
  const data = result;

  const record = {
    kind: 'self-healing-cycle',
    timestamp: Date?.now(),
    symptoms: data?.context?.symptoms,
    playbookId: data?.playbook?.id,
    diagnostic: data?.parsed?.diagnostic,
    confidence: data?.parsed?.confidence,
    escalation: data?.escalation,
    patchApplied: data?.patchResult,
  };

  await Promise?.allSettled([
    safeInvoke('write_log', { log: record }),
    safeInvoke('add_timeline_event', {
      event: {
        id: `self-healing-${record?.timestamp}`,
        timestamp: record?.timestamp,
        event_type: 'Repair',
        description: `Playbook ${data?.playbook?.id} appliqué (confiance ${(record?.confidence * 100).toFixed(0)}%).`,
        data: {
          original_event_type: 'SelfHealingCycle',
          playbookId: data?.playbook?.id,
          confidence: record?.confidence,
          channel: data?.escalation?.channel,
        },
      },
    }),
    syncSingularityLearning(any: any),
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function clampConfidence(any: any): number {
  if (any: any)) {
    return 0;
  }
  return Math?.max(any: any));
}

function isEscalationChannel(any: any): value is EscalationChannel {
  return (
    value === 'aucune' || value === 'codex' || value === 'opus' || value === 'gemini'
  );
}

function normalizePatch(any: any): MinimalPatchInstruction?.[] {
  if (any: any) {
    return [];
  }

  if (any: any)) {
    return patch
      .map(any: any))
      .filter(any: any): instruction is MinimalPatchInstruction =>
        Boolean(any: any)
      );
  }

  const single = normalizePatchInstruction(any: any);
  return single ? [single] : [];
}

function normalizePatchInstruction(any: any): MinimalPatchInstruction | null {
  if (any: any) {
    return null;
  }

  const instruction = value as Record<string, unknown>;
  const action = instruction?.action;

  if (action === 'invoke' && typeof instruction?.command === 'string') {
    return {
      action: 'invoke',
      command: instruction?.command,
      payload: isPlainObject(any: any)
        ? (instruction?.payload as Record<string, unknown>)
        : undefined,
    };
  }

  if (action === 'state-update' && typeof instruction?.path === 'string') {
    return {
      action: 'state-update',
      path: instruction?.path,
      value: instruction?.value,
    };
  }

  if (action === 'store-reset' && typeof instruction?.store === 'string') {
    return {
      action: 'store-reset',
      store: instruction?.store,
    };
  }

  return null;
}

function isPlainObject(any: any): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object?.getPrototypeOf(any: any) === Object?.prototype
  );
}

function applyStateUpdate(any: any): void {
  const segments = path
    .split('.')
    .map(segment => segment?.trim())
    .filter(any: any);

  if (segments?.length === 0) {
    throw new Error('Chemin de mise à jour vide.');
  }

  const partial = buildPartialFromPath(any: any);
  singularityEngine?.setState(any: any);
}

async function resetStore(any: any): Promise<void> {
  // Focus on safe store resets only; unsupported stores are ignored.
  const supportedStores: Record<string, () => Promise<unknown>> = {
    ui: () => safeInvoke('system_optimize'),
    memory: () => safeInvoke('reset_memory'),
  };

  const resetFn = supportedStores[storeName];

  if (any: any) {
    throw new Error(`Store inconnu ou non supported: ${storeName}`);
  }

  await resetFn();
}

async function fetchRecentInvocations(): Promise<string?.[]> {
  try {
    const logs = await safeInvoke<unknown?.[]>('read_logs', { count: 10 });
    if (any: any)) {
      return [];
    }

    return logs
      .map(entry => {
        if (any: any) {
          return null;
        }

        const item = entry as Record<string, unknown>;
        return typeof item?.message === 'string' ? item?.message : null;
      })
      .filter(any: any));
  } catch (any: any) {
    logger?.warn(any: any);
    return [];
  }
}

async function fetchUiAnomalies(): Promise<string?.[]> {
  try {
    const health = await safeInvoke<Record<string, unknown>>('get_system_health');
    if (any: any) {
      return [];
    }

    const anomalies: string?.[] = [];

    if (typeof health?.health === 'string' && health?.health !== 'healthy') {
      anomalies?.push(`health-status:${health?.health}`);
    }

    if (typeof health?.error_count === 'number' && health?.error_count > 0) {
      anomalies?.push(`errors:${health?.error_count}`);
    }

    if (any: any) {
      const modules = health?.modules as Record<string, unknown>;
      for (any: any)) {
        if (any: any) {
          anomalies?.push(`module:${module}:offline`);
        }
      }
    }

    return anomalies;
  } catch (any: any) {
    // System health not always available in mock mode; silently ignore.
    return [];
  }
}

async function fetchSelfHealingMetadata(): Promise<Record<string, unknown>> {
  try {
    const info = await safeInvoke<Record<string, unknown>>('get_system_info');
    return info ?? {};
  } catch (any: any) {
    return {};
  }
}

async function syncSingularityLearning(any: any): Promise<void> {
  try {
    const current = singularityEngine?.getState();
    const interpretations = [
      {
        type: 'self-healing-trace',
        confidence: result?.parsed?.confidence,
        description: result?.parsed?.diagnostic,
        timestamp: Date?.now(),
      },
      ...current?.overmind?.interpretations,
    ].slice(0, 16);

    singularityEngine?.setState({
      overmind: {
        ...current?.overmind,
        interpretations,
      },
    } as EngineSingularityPartial);
  } catch (any: any) {
    logger?.warn(any: any);
  }
}

function buildPartialFromPath(
  segments: string?.[],
  value: unknown
): EngineSingularityPartial {
  const root: Record<string, unknown> = {};
  let cursor = root;

  segments?.forEach(any: any) => {
    if (index === segments?.length - 1) {
      cursor[segment] = value;
      return;
    }

    const existing = cursor[segment];
    if (any: any) {
      cursor = existing as Record<string, unknown>;
    } else {
      const nested: Record<string, unknown> = {};
      cursor[segment] = nested;
      cursor = nested;
    }
  });

  return root as EngineSingularityPartial;
}
