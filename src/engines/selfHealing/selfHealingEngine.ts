/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ SELF-HEALING ENGINE v1 (Local) — RING 2 (PURE)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pure engine: types + pure logic only. No I/O (no safeInvoke, no queryOllama).
 * I/O orchestration lives in Ring 3: src/services/selfHealing/selfHealingIOAdapter.ts
 */

import { AutoRcaEngine, type AutoRcaCategory } from './autoRcaEngine';

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

interface PatchExecutionOptions {
  playbookId?: string;
}

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

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBOOK SELECTION & PROMPT BUILDING
// ═══════════════════════════════════════════════════════════════════════════

export async function selectPlaybook(symptoms: string): Promise<PlaybookPlan> {
  const normalized = symptoms.toLowerCase();
  const autoRcaEngine = new AutoRcaEngine();
  const autoRca = autoRcaEngine.classify({
    incidentId: `auto-rca-${normalized.slice(0, 24).replace(/\s+/g, '-') || 'incident'}`,
    symptoms: normalized,
    timeline: [],
  });

  const mappedPlaybookId = mapAutoRcaCategoryToPlaybookId(autoRca.category);
  if (mappedPlaybookId) {
    const mappedPlaybook = PLAYBOOK_REGISTRY.find(
      playbook => playbook.id === mappedPlaybookId
    );
    if (mappedPlaybook) {
      return mappedPlaybook;
    }
  }

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

function mapAutoRcaCategoryToPlaybookId(category: AutoRcaCategory): string | null {
  switch (category) {
    case 'runtime-errors':
      return 'runtime-errors';
    case 'ui-desync':
      return 'ui-desync';
    case 'performance-drift':
      return 'performance-drift';
    default:
      return null;
  }
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



export function clampConfidence(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function isEscalationChannel(value: unknown): value is EscalationChannel {
  return (
    value === 'aucune' || value === 'codex' || value === 'opus' || value === 'gemini'
  );
}

export function normalizePatch(patch: unknown): MinimalPatchInstruction[] {
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

