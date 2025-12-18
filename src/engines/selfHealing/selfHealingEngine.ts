/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ENGINE v1 (Local)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Orchestrates the end-to-end self-healing pipeline using the local TITANE
 * model (titane-local via Ollama). This module remains 100% local, leverages
 * existing TITANE engines, and only performs minimal, reversible patches.
 */

import { queryOllama } from '@/utils/ollama';
import { safeInvoke } from '@/utils/invoke';
import { singularityEngine } from '@/core/engines/SINGULARITY_ENGINE';

type EngineSingularityState = ReturnType<typeof singularityEngine.getState>;
type EngineSingularityPartial = Parameters<typeof singularityEngine.setState>[0];

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
  logs: SelfHealingLogEntry[];
  state: EngineSingularityState | null;
  recentInvocations: string[];
  uiAnomalies: string[];
  lastMessage?: string;
  metadata: Record<string, unknown>;
}

export interface PlaybookPlan {
  id: string;
  label: string;
  description: string;
  steps: string[];
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
  steps: string[];
  errors?: string[];
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

const PLAYBOOK_REGISTRY: PlaybookPlan[] = [
  {
    id: 'runtime-errors',
    label: 'Stabilisation Runtime',
    description: 'Diagnostiquer et neutraliser les erreurs runtime répétées.',
    steps: [
      'Analyser la pile des erreurs et repérer la commande Tauri fautive.',
      'Vérifier la synchronisation des stores React/Tauri.',
      'Appliquer un patch minimal (invoke ou reset ciblé) si possible.',
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
      'Appliquer un correctif léger (throttle, reset ciblé).',
    ],
    successCriteria: 'Métriques stabilisées et drift contenu.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════

export async function runSelfHealing(symptoms: string): Promise<SelfHealingRunResult> {
  const logs = await collectLogs();
  const state = await collectState();
  const baseContext = await collectContext(symptoms);

  const context: SelfHealingContext = {
    ...baseContext,
    logs,
    state,
    lastMessage: baseContext.lastMessage ?? logs.at(-1)?.message,
  };

  const playbook = await selectPlaybook(symptoms);
  const prompt = await buildPrompt(context, JSON.stringify(playbook, null, 2));
  const rawResponse = await callTitaneLocal(prompt);
  const parsed = await parseLocalResponse(rawResponse);
  const patchResult = await applyMinimalPatch(parsed.patch);
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

// ═══════════════════════════════════════════════════════════════════════════
// DATA COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

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

export async function collectContext(symptoms: string): Promise<SelfHealingContext> {
  // Use lightweight probes to surface UI/UX anomalies without touching network APIs.
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

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK SELECTION & PROMPT BUILDING
// ═══════════════════════════════════════════════════════════════════════════

export async function selectPlaybook(symptoms: string): Promise<PlaybookPlan> {
  const normalized = symptoms.toLowerCase();

  const match = PLAYBOOK_REGISTRY.find(playbook => {
    if (
      playbook.id === 'runtime-errors' &&
      /error|exception|panic|stack/i.test(normalized)
    ) {
      return true;
    }

    if (
      playbook.id === 'ui-desync' &&
      /ui|ux|desync|state|store|render/i.test(normalized)
    ) {
      return true;
    }

    if (
      playbook.id === 'performance-drift' &&
      /slow|lag|performance|fps|drift/i.test(normalized)
    ) {
      return true;
    }

    return false;
  });

  return (
    match ??
    PLAYBOOK_REGISTRY[0] ??
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
  const formattedLogs = context.logs
    .map(
      entry =>
        `${new Date(entry.timestamp).toISOString()} [${entry.level}] ${entry.message}`
    )
    .join('\n');

  const stateSnapshot = context.state
    ? JSON.stringify(context.state, null, 2)
    : 'Etat indisponible';

  const prompt = `
Tu es TITANE Local (modèle titane-local).
Voici les logs :
${formattedLogs || 'Aucun log disponible'}

Voici le state :
${stateSnapshot}

Voici les symptômes :
${context.symptoms}

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

  return prompt.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// OLLAMA INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export async function callTitaneLocal(prompt: string): Promise<string> {
  try {
    const response = await queryOllama(prompt);
    return response.trim();
  } catch (error) {
    console.error('[SelfHealing] callTitaneLocal failed:', error);
    throw error;
  }
}

export async function parseLocalResponse(
  raw: string
): Promise<SelfHealingStructuredResult> {
  const sanitized = raw.trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(sanitized);
  } catch (initialError) {
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
      parsed = JSON.parse(normalized);
    } catch (secondaryError) {
      console.error('[SelfHealing] parseLocalResponse failed:', secondaryError);

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

  if (typeof parsed !== 'object' || parsed === null) {
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
    typeof response.DIAGNOSTIC === 'string' ? response.DIAGNOSTIC : sanitized;

  const playbookAnalysis =
    typeof response.PLAYBOOK_ANALYSIS === 'string'
      ? response.PLAYBOOK_ANALYSIS
      : 'Analyse non fournie.';

  const patch =
    typeof response.PATCH === 'object' && response.PATCH !== null
      ? (response.PATCH as Record<string, unknown>)
      : null;

  const confidence =
    typeof response.CONFIDENCE === 'number' ? clampConfidence(response.CONFIDENCE) : 0;

  const escalade = isEscalationChannel(response.ESCALADE)
    ? response.ESCALADE
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

export async function applyMinimalPatch(patch: unknown): Promise<ApplyPatchResult> {
  const steps: string[] = [];
  const errors: string[] = [];

  const instructions = normalizePatch(patch);

  for (const instruction of instructions) {
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

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION & LEARNING
// ═══════════════════════════════════════════════════════════════════════════

export async function escalateIfNeeded(
  result: SelfHealingStructuredResult
): Promise<EscalationResult> {
  const confidence = clampConfidence(result.confidence);

  if (confidence >= CONFIDENCE_THRESHOLD && result.escalade === 'aucune') {
    return {
      triggered: false,
      channel: 'aucune',
      reason: 'Confiance suffisante, pas d’escalade.',
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

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function isEscalationChannel(value: unknown): value is EscalationChannel {
  return (
    value === 'aucune' || value === 'codex' || value === 'opus' || value === 'gemini'
  );
}

function normalizePatch(patch: unknown): MinimalPatchInstruction[] {
  if (!patch) {
    return [];
  }

  if (Array.isArray(patch)) {
    return patch
      .map(instruction => normalizePatchInstruction(instruction))
      .filter((instruction): instruction is MinimalPatchInstruction =>
        Boolean(instruction)
      );
  }

  const single = normalizePatchInstruction(patch);
  return single ? [single] : [];
}

function normalizePatchInstruction(value: unknown): MinimalPatchInstruction | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const instruction = value as Record<string, unknown>;
  const action = instruction.action;

  if (action === 'invoke' && typeof instruction.command === 'string') {
    return {
      action: 'invoke',
      command: instruction.command,
      payload: isPlainObject(instruction.payload)
        ? (instruction.payload as Record<string, unknown>)
        : undefined,
    };
  }

  if (action === 'state-update' && typeof instruction.path === 'string') {
    return {
      action: 'state-update',
      path: instruction.path,
      value: instruction.value,
    };
  }

  if (action === 'store-reset' && typeof instruction.store === 'string') {
    return {
      action: 'store-reset',
      store: instruction.store,
    };
  }

  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
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
  // Focus on safe store resets only; unsupported stores are ignored.
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
    // System health not always available in mock mode; silently ignore.
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
