/**
 * TITANE∞ v30.0.0 — OMEGA DevTools Bridge
 * Pont temps réel entre le pipeline OMEGA et le Journal d'Exécution DevTools.
 *
 * Architecture:
 *   chatEngine.generate() → omegaDevToolsBridge → Tauri emit → DevTools Journal
 *
 * Guard: les appels Tauri emit() sont ignorés silencieusement hors contexte Tauri.
 * @license Proprietary
 */

import { createLogger } from '@/utils/logger';
import type { CanonicalDecision } from './canonicalDiscernmentKernel';

const logger = createLogger('OmegaDevToolsBridge');

// ─────────────────────────────────────────────────────────────────
// TYPES — miroir des types DevTools store (sans import circulaire)
// ─────────────────────────────────────────────────────────────────

export interface DevToolsReasoningStep {
  id: string;
  label: string;
  thought: string;
  decision?: string;
  confidence?: number; // 0-100
  durationMs?: number;
  timestamp: number;
}

export interface DevToolsReasoningTrace {
  requestId: string;
  startedAt: number;
  completedAt?: number;
  steps: DevToolsReasoningStep[];
  finalMode: string;
  selectedProvider: string;
  effortLevel: string;
  singularityCoherence?: number;
  keyConceptsExtracted?: string[];
  reflectionNotes?: string;
}

export interface DevToolsOmegaStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
  engines?: string[];
  error?: string;
  outputSummary?: string;
}

export interface DevToolsJournalEntry {
  id: string;
  timestamp: number;
  requestPreview: string;
  responsePreview: string;
  mode: string;
  provider: string;
  effortLevel: string;
  totalDurationMs: number;
  pipeline: DevToolsOmegaStep[];
  reasoningTrace: DevToolsReasoningTrace;
  success: boolean;
  errorMessage?: string;
}

export interface DevToolsCognitiveStateUpdate {
  currentMode?: string;
  currentProvider?: string;
  effortLevel?: string;
  singularityCoherence?: number;
  processingLoad?: number;
  activeEnginesCount?: number;
  lastRequestAt?: number;
  status?: 'idle' | 'thinking' | 'responding' | 'reflecting';
}

// ─────────────────────────────────────────────────────────────────
// PIPELINE STEP LABELS — Mapping des phases chatEngine
// ─────────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, { name: string; engines?: string[] }> = {
  'cache-check': { name: 'Vérification Cache', engines: ['Cache'] },
  'cache-hit': { name: 'Réponse Cache', engines: ['Cache'] },
  'cache-save': { name: 'Sauvegarde Cache', engines: ['Cache'] },
  'kernel-discernment': { name: 'Discernement Kernel', engines: ['CanonicalKernel'] },
  'context-build': { name: 'Construction Contexte', engines: ['MemoryCore', 'Helios'] },
  'context-loaded': { name: 'Contexte Chargé', engines: ['MemoryCore'] },
  'prompt-build': { name: 'Construction Prompt', engines: ['Harmonia'] },
  'orchestrator-call': { name: 'Appel Orchestrateur', engines: ['Orchestrator', 'Nexus'] },
  'consistency-check': { name: 'Vérification Cohérence', engines: ['Coherence', 'Engine∞'] },
  'auto-correction': { name: 'Auto-Correction', engines: ['Coherence'] },
  'memory-save': { name: 'Sauvegarde Mémoire', engines: ['MemoryCore'] },
  'validation': { name: 'Validation Réponse', engines: ['Sentinel'] },
  'response-building': { name: 'Construction Réponse', engines: ['Harmonia'] },
};

// ─────────────────────────────────────────────────────────────────
// REASONING STEP BUILDERS
// ─────────────────────────────────────────────────────────────────

/**
 * Converts a CanonicalDecision into structured DevToolsReasoningSteps
 * matching what the OMEGA Journal ReasoningTracePanel expects.
 */
export function buildReasoningStepsFromDecision(
  decision: CanonicalDecision,
  requestId: string,
  startedAt: number
): DevToolsReasoningStep[] {
  const steps: DevToolsReasoningStep[] = [];
  let t = startedAt;

  // Step 1: Analyse de l'intention
  const intentSignal = decision.signals.find(
    s => s.source === 'intent' || s.type === 'intent_classification'
  );
  const intentValue = (intentSignal?.value as string) ?? 'information_request';
  const intentLabels: Record<string, string> = {
    information_request: "demande d'information",
    action_request: "demande d'action",
    memory_recall: 'rappel mémoire',
    current_info: 'information courante',
    preference_signal: 'signal de préférence',
    creative: 'demande créative',
    diagnostic: 'diagnostic cognitif',
    conversational: 'échange conversationnel',
  };
  steps.push({
    id: `${requestId}-step-1`,
    label: "Analyse de l'intention",
    thought: `Je détecte une intention de type "${intentLabels[intentValue] ?? intentValue}". Les signaux linguistiques indiquent ${intentSignal ? `une confiance de ${((intentSignal.confidence ?? 0) * 100).toFixed(0)}%` : 'un contexte ambigu'}.`,
    decision: `Intention: ${intentLabels[intentValue] ?? intentValue}`,
    confidence: Math.round((intentSignal?.confidence ?? decision.confidence) * 100),
    durationMs: 8,
    timestamp: t,
  });
  t += 8;

  // Step 2: Classification du mode
  const modeConf = decision.modeClassification;
  const modeLabels: Record<string, string> = {
    OMEGA: 'OMEGA (puissance maximale)',
    ARCHITECT: 'ARCHITECT (clarté stratégique)',
    DEEP_REASONING: 'DEEP_REASONING (analyse approfondie)',
    CERTIFY: 'CERTIFY (certification factuelle)',
    CREATIVE: 'CREATIVE (génération créative)',
    default: 'DEFAULT (conversationnel)',
  };
  if (modeConf) {
    steps.push({
      id: `${requestId}-step-2`,
      label: 'Classification du mode cognitif',
      thought: `Mode classifié: ${modeConf.canonicalMode} avec confiance ${(modeConf.confidence * 100).toFixed(0)}%. Raison: ${modeConf.reasonCode ?? 'classification automatique'}. ${modeConf.signals?.length ? `Signaux détectés: ${modeConf.signals.slice(0, 3).join(', ')}` : ''}`,
      decision: `Mode: ${modeLabels[modeConf.canonicalMode] ?? modeConf.canonicalMode}`,
      confidence: Math.round(modeConf.confidence * 100),
      durationMs: 15,
      timestamp: t,
    });
    t += 15;
  }

  // Step 3: Sélection du profil de réponse
  const profileDescriptions: Record<string, string> = {
    DIRECT: 'réponse courte et directe',
    BALANCED: 'réponse équilibrée et structurée',
    DEVELOPED: 'réflexion approfondie avec détails',
    DEEP: 'analyse complète multi-niveaux',
    ARCHITECT: 'clarté stratégique et vision systémique',
    OMEGA: 'puissance maximale, raisonnement intégral',
  };
  steps.push({
    id: `${requestId}-step-3`,
    label: 'Sélection du profil de réponse',
    thought: `Profil ${decision.profileId} (${decision.profileLabel}) sélectionné: ${profileDescriptions[decision.profileId] ?? 'profil adaptatif'}. Budget: ${decision.provider.maxTokens} tokens. Température: ${decision.provider.temperature}. État inférence: ${decision.inferenceState}.`,
    decision: `Profil: ${decision.profileId} — ${decision.provider.maxTokens} tokens`,
    confidence: Math.round(decision.confidence * 100),
    durationMs: 12,
    timestamp: t,
  });
  t += 12;

  // Step 4: Décision mémoire
  const memInfo = decision.memoryInjection;
  steps.push({
    id: `${requestId}-step-4`,
    label: 'Décision mémoire contextuelle',
    thought: memInfo.use
      ? `Mémoire contextuelle activée (pertinence: ${memInfo.relevance}). Sources: ${memInfo.sources.join(', ') || 'STM'}. Budget mémoire: ${memInfo.maxTokens} tokens.`
      : `Mémoire contextuelle non requise pour cette requête. Réponse basée sur connaissances générales et contexte conversationnel immédiat.`,
    decision: memInfo.use ? `Mémoire active (${memInfo.relevance})` : 'Mémoire: skip',
    confidence: 90,
    durationMs: 18,
    timestamp: t,
  });
  t += 18;

  // Step 5: Sélection du provider
  steps.push({
    id: `${requestId}-step-5`,
    label: 'Sélection du provider IA',
    thought: `Provider sélectionné: ${decision.provider.name}. Effort de raisonnement: ${decision.provider.reasoningEffort}. ${decision.fallbackChain.length > 0 ? `Chaîne de fallback prête: ${decision.fallbackChain.join(' → ')}.` : 'Aucun fallback requis.'}${decision.skillId ? ` Skill: ${decision.skillId}.` : ''}`,
    decision: `Provider: ${decision.provider.name} (effort: ${decision.provider.reasoningEffort})`,
    confidence: 88,
    durationMs: 10,
    timestamp: t,
  });
  t += 10;

  // Step 6: Vérité et fiabilité
  const truthLabels: Record<string, string> = {
    HONEST: 'réponse honnête basée sur les faits disponibles',
    UNCERTAIN: 'incertitude signalée, hypothèses explicites',
    BLOCKED: 'réponse bloquée par contrainte de vérité',
    SYNTHETIC: 'synthèse créative non factuelle',
  };
  steps.push({
    id: `${requestId}-step-6`,
    label: 'Évaluation vérité et fiabilité',
    thought: `Statut vérité: ${decision.truthStatus}. ${truthLabels[decision.truthStatus] ?? decision.truthStatus}. Confiance globale de la décision: ${(decision.confidence * 100).toFixed(0)}%. Temps de traitement kernel: ${decision.processingTimeMs}ms.`,
    decision: `Vérité: ${decision.truthStatus} (${(decision.confidence * 100).toFixed(0)}%)`,
    confidence: Math.round(decision.confidence * 100),
    durationMs: decision.processingTimeMs,
    timestamp: t,
  });

  return steps;
}

/**
 * Maps chatEngine pipelineSteps strings to structured DevToolsOmegaSteps
 */
export function buildPipelineStepsFromEngine(
  pipelineSteps: string[],
  totalDurationMs: number,
  hasError: boolean
): DevToolsOmegaStep[] {
  if (pipelineSteps.length === 0) {
    return [
      {
        id: 'input',
        name: 'Traitement',
        status: hasError ? 'error' : 'complete',
        duration: totalDurationMs,
      },
    ];
  }

  // Distribute duration across steps proportionally
  const stepCount = pipelineSteps.length;
  const baseDuration = Math.floor(totalDurationMs / stepCount);

  return pipelineSteps.map((stepId, index) => {
    const meta = STEP_LABELS[stepId] ?? { name: stepId };
    const isLast = index === stepCount - 1;
    // Last step gets remaining duration
    const duration = isLast
      ? totalDurationMs - baseDuration * (stepCount - 1)
      : baseDuration;

    return {
      id: stepId,
      name: meta.name,
      status: hasError && isLast ? 'error' : 'complete',
      duration: Math.max(1, duration),
      engines: meta.engines,
      outputSummary: undefined,
    };
  });
}

// ─────────────────────────────────────────────────────────────────
// BRIDGE SINGLETON
// ─────────────────────────────────────────────────────────────────

class OmegaDevToolsBridge {
  private isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }

  private async safeEmit(event: string, payload: unknown): Promise<void> {
    if (!this.isTauri()) return;
    try {
      const { emit } = await import('@tauri-apps/api/event');
      await emit(event, payload);
    } catch (error) {
      logger.debug(`[OmegaDevToolsBridge] emit failed for "${event}"`, { error });
    }
  }

  /** Emit cognitive state update (e.g. status: 'thinking') */
  async updateCognitiveState(update: DevToolsCognitiveStateUpdate): Promise<void> {
    await this.safeEmit('cognitive-state-update', update);
  }

  /** Emit a complete reasoning trace built from a CanonicalDecision */
  async reportReasoningTrace(
    decision: CanonicalDecision,
    requestId: string,
    startedAt: number,
    completedAt: number,
    singularityCoherence?: number,
    reflectionNotes?: string
  ): Promise<void> {
    const steps = buildReasoningStepsFromDecision(decision, requestId, startedAt);

    const trace: DevToolsReasoningTrace = {
      requestId,
      startedAt,
      completedAt,
      steps,
      finalMode: decision.mode,
      selectedProvider: decision.provider.name,
      effortLevel: decision.provider.reasoningEffort,
      singularityCoherence: singularityCoherence
        ? Math.round(singularityCoherence * 100)
        : undefined,
      keyConceptsExtracted: decision.signals
        .filter(s => s.type === 'keyword' || s.type === 'concept')
        .map(s => String(s.value))
        .slice(0, 6),
      reflectionNotes,
    };

    await this.safeEmit('omega-reasoning-trace', trace);
  }

  /**
   * Report a complete journal entry after a successful chatEngine.generate()
   */
  async reportJournalEntry(params: {
    requestId: string;
    startedAt: number;
    request: string;
    response: string;
    decision: CanonicalDecision;
    pipelineSteps: string[];
    totalDurationMs: number;
    success: boolean;
    errorMessage?: string;
    singularityCoherence?: number;
    reflectionNotes?: string;
  }): Promise<void> {
    const {
      requestId,
      startedAt,
      request,
      response,
      decision,
      pipelineSteps,
      totalDurationMs,
      success,
      errorMessage,
      singularityCoherence,
      reflectionNotes,
    } = params;

    const completedAt = startedAt + totalDurationMs;

    const steps = buildReasoningStepsFromDecision(decision, requestId, startedAt);

    const trace: DevToolsReasoningTrace = {
      requestId,
      startedAt,
      completedAt,
      steps,
      finalMode: decision.mode,
      selectedProvider: decision.provider.name,
      effortLevel: decision.provider.reasoningEffort,
      singularityCoherence: singularityCoherence
        ? Math.round(singularityCoherence * 100)
        : undefined,
      keyConceptsExtracted: decision.signals
        .filter(s => s.type === 'keyword' || s.type === 'concept')
        .map(s => String(s.value))
        .slice(0, 6),
      reflectionNotes,
    };

    const pipeline = buildPipelineStepsFromEngine(pipelineSteps, totalDurationMs, !success);

    const entry: DevToolsJournalEntry = {
      id: requestId,
      timestamp: startedAt,
      requestPreview: request.slice(0, 80),
      responsePreview: response.slice(0, 80),
      mode: decision.mode,
      provider: decision.provider.name,
      effortLevel: decision.provider.reasoningEffort,
      totalDurationMs,
      pipeline,
      reasoningTrace: trace,
      success,
      errorMessage,
    };

    await this.safeEmit('omega-journal-entry', entry);
  }

  /**
   * Report kernel metrics to DevTools
   */
  async reportKernelMetrics(metrics: {
    totalDecisions: number;
    avgConfidence: number;
    avgProcessingTimeMs: number;
    profileDistribution: Record<string, number>;
    fallbackRate: number;
  }): Promise<void> {
    await this.safeEmit('omega-kernel-metrics', metrics);
  }
}

export const omegaDevToolsBridge = new OmegaDevToolsBridge();
