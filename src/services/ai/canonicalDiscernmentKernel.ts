/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   CANONICAL DISCERNMENT KERNEL — Premier organe vivant de TITANE
 *
 *   Point de fusion unique pour toutes les décisions de chat.
 *   Un tour de chat = UNE CanonicalDecision.
 *   Le chatEngine consomme cette décision, il ne re-décide pas.
 *
 *   Architecture : Context Fusion → Decision Engine → CanonicalDecision
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';
import type { ResponseProfileId, TruthStatus } from './responsePolicy';
import {
  classifyIntent,
  computeEffectiveDepth,
  evaluateInferenceState,
  estimateComplexity,
  getEffectiveProfile,
  IDENTITY_CONSTANTS,
} from './responsePolicy';
import type { IntentClassification } from './responsePolicy';
import type { MemoryContext } from './memoryIntegration';
import { memoryIntegration } from './memoryIntegration';
import type { DurablePreference } from './preferenceEngine';
import { behavioralRouter } from './behavioralRouter';
import type { BehavioralDecision } from './behavioralRouter';
import type { ChatMode } from './chatTypes';
// Phase 3: Mode classification — kernel decides mode from message signals
import {
  classifyMode,
  resolveMode,
  type BackendConversationMode,
  type CanonicalMode,
  type ClassifierInput,
  type ModeClassification,
  type EffortLevel,
} from './omegaModeClassifier';
import { getChampion } from './championChallenger';
// Phase 2-3: Runtime truth, skill selection, orchestrator health
import { cognitiveKernel } from './cognitiveKernel';
import { aiOrchestrator } from './orchestrator';

const logger = createLogger('CanonicalDiscernmentKernel');

/** Singularity coherence must exceed this value to trigger a confidence boost signal. */
const COHERENCE_BOOST_THRESHOLD = 0.7;

// ─────────────────────────────────────────────────────────────────
// TYPES — Canonical Decision Output
// ─────────────────────────────────────────────────────────────────

/** The 8 decisions unified into one output */
export interface CanonicalDecision {
  // 1. Mode (resolved by kernel from message signals + user explicit mode)
  mode: ChatMode;
  modeClassification?: {
    canonicalMode: string;
    confidence: number;
    reasonCode: string;
    signals: string[];
  };

  // 2. Depth/Profile
  profileId: ResponseProfileId;
  profileLabel: string;

  // 3. Clarification
  inferenceState:
    | 'SAFE_TO_INFER'
    | 'INFER_WITH_DISCLOSURE'
    | 'CLARIFY_REQUIRED'
    | 'BLOCKED_BY_MISSING_FACT';

  // 4. Memory usefulness
  memoryInjection: {
    use: boolean;
    sources: string[];
    maxTokens: number;
    relevance: 'low' | 'medium' | 'high';
  };

  // 5. Provider/Model
  provider: {
    name: string;
    model: string;
    fallback: string[];
    temperature: number;
    maxTokens: number;
    reasoningEffort: EffortLevel;
  };

  // 6. Tool/Skill
  skillId: string | null;

  // 7. Fallback chain
  fallbackChain: string[];

  // 8. Truth status — HONEST, not declared
  truthStatus: TruthStatus;

  // Decision metadata
  reasoning: string;
  confidence: number; // 0.0-1.0
  signals: Array<{ source: string; type: string; value: unknown; confidence: number }>;
  timestamp: number;
  processingTimeMs: number;
}

/** Inputs to the discernment kernel */
export interface DiscernmentInput {
  message: string;
  mode: ChatMode;
  memoryContext: MemoryContext;
  preferences: DurablePreference[];
  userDepthPreference?: string | null;
  providerPreference?: string; // 'auto' | 'local' | provider name
  runtimeState?: {
    providerHealth?: Record<string, number>; // provider → health score 0-1
    latencyMs?: Record<string, number>;
    errorRates?: Record<string, number>;
    /** Singularity-Omega coherence score (0–1). Used to boost confidence when coherence is high. */
    singularityCoherence?: number;
  };
  availableSkills?: Array<{ id: string; healthy: boolean; intentMatch: string[] }>;
}

// ─────────────────────────────────────────────────────────────────
// KERNEL CLASS
// ─────────────────────────────────────────────────────────────────

export class CanonicalDiscernmentKernel {
  // Phase 3: Decision log for observability
  private decisionLog: CanonicalDecision[] = [];
  private readonly MAX_LOG_SIZE = 100;

  // Phase 3: Metrics
  private metrics = {
    totalDecisions: 0,
    avgConfidence: 0,
    avgProcessingTimeMs: 0,
    profileDistribution: {} as Record<string, number>,
    truthDistribution: {} as Record<string, number>,
    fallbackRate: 0,
    fallbackCount: 0,
  };

  /**
   * The single entry point. Takes all context, produces one decision.
   */
  discern(input: DiscernmentInput): CanonicalDecision {
    const startTime = Date.now();
    const signals: CanonicalDecision['signals'] = [];

    // ── STEP 0: Mode Classification ──
    // Phase 3: Kernel decides mode from message signals
    const modeClassification = classifyMode({
      message: input.message,
      userExplicitMode: input.mode as BackendConversationMode,
    });
    const resolvedMode = resolveMode(
      modeClassification,
      input.mode as BackendConversationMode
    ) as ChatMode;

    signals.push({
      source: 'mode_classifier',
      type: 'mode_classification',
      value: modeClassification.canonicalMode,
      confidence: modeClassification.confidence,
    });

    if (modeClassification.confidence >= 0.7) {
      signals.push({
        source: 'mode_classifier',
        type: 'mode_resolved',
        value: resolvedMode,
        confidence: modeClassification.confidence,
      });
    }

    // ── STEP 1: Intent Classification ──
    const intentResult = classifyIntent(input.message);
    signals.push({
      source: 'intent',
      type: 'intent_classification',
      value: intentResult.intent,
      confidence: intentResult.confidence,
    });

    // ── STEP 2: Depth/Profile Resolution ──
    const effectiveDepth = computeEffectiveDepth(
      intentResult.intent,
      input.mode,
      input.userDepthPreference ?? undefined
    );

    // Behavioral router gives us a richer signal set
    let behavioralDecision: BehavioralDecision | null = null;
    try {
      behavioralDecision = behavioralRouter.route(
        input.message,
        input.memoryContext,
        input.preferences,
        intentResult,
        input.mode
      );
      signals.push({
        source: 'behavioral',
        type: 'profile_decision',
        value: behavioralDecision.profileId,
        confidence: behavioralDecision.confidence,
      });
    } catch {
      logger.warn('BehavioralRouter failed, using intent-based depth');
    }

    // Behavioral router best candidate
    const behavioralProfileId =
      behavioralDecision && behavioralDecision.confidence >= 0.5
        ? behavioralDecision.profileId
        : effectiveDepth;

    // Profile rank for cap-down logic
    const PROFILE_RANK: Record<ResponseProfileId, number> = {
      DIRECT: 0, BALANCED: 1, DEVELOPED: 2, DEEP: 3, ARCHITECT: 4, OMEGA: 5,
    };

    // userDepthPreference caps the profile DOWN (e.g. 'short'→DIRECT overrides DEEP).
    // When the preference would elevate the profile, behavioral routing still decides.
    const profileId =
      input.userDepthPreference &&
      PROFILE_RANK[effectiveDepth] < PROFILE_RANK[behavioralProfileId]
        ? effectiveDepth
        : behavioralProfileId;

    // Get full profile with params
    const { profile: effectiveProfile } = getEffectiveProfile(
      input.mode,
      input.message,
      undefined,
      undefined,
      profileId
    );

    signals.push({
      source: 'kernel',
      type: 'final_profile',
      value: profileId,
      confidence: behavioralDecision?.confidence ?? 0.6,
    });

    // ── STEP 3: Inference State / Clarification ──
    const hasMemoryContext =
      input.memoryContext.activeProjects.length > 0 ||
      input.memoryContext.recentDecisions.length > 0 ||
      input.memoryContext.relevantKnowledge.length > 0;

    const inferenceState = evaluateInferenceState(
      input.message,
      effectiveProfile,
      hasMemoryContext
    );

    signals.push({
      source: 'inference',
      type: 'inference_state',
      value: inferenceState,
      confidence: inferenceState === 'SAFE_TO_INFER' ? 0.9 : 0.6,
    });

    // ── STEP 4: Memory Usefulness ──
    const memoryDecision = this.evaluateMemoryUsefulness(
      intentResult,
      input.memoryContext,
      hasMemoryContext,
      effectiveProfile
    );

    signals.push({
      source: 'memory',
      type: 'usefulness',
      value: memoryDecision.use,
      confidence: memoryDecision.use ? 0.7 : 0.8,
    });

    // ── STEP 5: Provider/Model Selection ──
    const providerDecision = this.selectProvider(
      effectiveProfile,
      input.providerPreference ?? 'auto',
      input.runtimeState,
      modeClassification.canonicalMode,
      modeClassification.effortLevel
    );

    signals.push({
      source: 'provider',
      type: 'selection',
      value: providerDecision.name,
      confidence: 0.7,
    });

    // ── STEP 6: Tool/Skill Selection ──
    const skillId = this.selectSkill(intentResult, input.availableSkills);

    if (skillId) {
      signals.push({
        source: 'skill',
        type: 'activation',
        value: skillId,
        confidence: 0.8,
      });
    }

    // ── STEP 7: Fallback Chain ──
    const fallbackChain = this.buildFallbackChain(
      providerDecision.name,
      effectiveProfile.preferredProviders,
      input.runtimeState
    );

    // ── STEP 8: Truth Status — HONEST ──
    const truthStatus = this.evaluateTruthStatus(
      providerDecision.name,
      input.runtimeState
    );

    signals.push({
      source: 'truth',
      type: 'runtime_status',
      value: truthStatus,
      confidence: 0.9,
    });

    // ── STEP 9: Singularity-Omega coherence signal ──
    // When SingularityBridge reports high coherence, the system is in an aligned state.
    // Boost the mode classification confidence slightly to favour the auto-selected mode.
    const singularityCoherence = input.runtimeState?.singularityCoherence ?? 0.5;
    if (singularityCoherence > COHERENCE_BOOST_THRESHOLD) {
      signals.push({
        source: 'singularity',
        type: 'coherence_boost',
        value: singularityCoherence,
        confidence: singularityCoherence,
      });
    }

    // ── Build reasoning ──
    const reasoning = this.buildReasoning(
      intentResult,
      profileId,
      inferenceState,
      memoryDecision.use,
      providerDecision.name,
      skillId,
      truthStatus
    );

    // ── Compute overall confidence ──
    const confidence = this.computeOverallConfidence(signals);

    const processingTimeMs = Date.now() - startTime;

    const decision: CanonicalDecision = {
      mode: resolvedMode,
      modeClassification: {
        canonicalMode: modeClassification.canonicalMode,
        confidence: modeClassification.confidence,
        reasonCode: modeClassification.reasonCode,
        signals: modeClassification.signals,
      },
      profileId,
      profileLabel: effectiveProfile.label,
      inferenceState,
      memoryInjection: memoryDecision,
      provider: providerDecision,
      skillId,
      fallbackChain,
      truthStatus,
      reasoning,
      confidence,
      signals,
      timestamp: Date.now(),
      processingTimeMs,
    };

    logger.info('CanonicalDecision produced', {
      profile: profileId,
      inference: inferenceState,
      memory: memoryDecision.use,
      provider: providerDecision.name,
      skill: skillId ?? 'none',
      truth: truthStatus,
      confidence: confidence.toFixed(2),
      timeMs: processingTimeMs,
    });

    // Phase 3: Log decision for observability
    this.decisionLog.push(decision);
    if (this.decisionLog.length > this.MAX_LOG_SIZE) {
      this.decisionLog.shift();
    }

    // Phase 3: Update metrics
    this.updateMetrics(decision);

    return decision;
  }

  // ─────────────────────────────────────────────────────────────────
  // DECISION SUB-FUNCTIONS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Decide if memory should be injected for this turn.
   * Not a hardcoded policy — reasoned from intent + context + cost.
   */
  private evaluateMemoryUsefulness(
    intent: IntentClassification,
    memoryContext: MemoryContext,
    hasContext: boolean,
    profile: { memory: { injectSTM: boolean; injectLTM: boolean; maxSources: number } }
  ): CanonicalDecision['memoryInjection'] {
    // Memory recall intent → always use memory
    if (intent.intent === 'memory_recall') {
      return {
        use: true,
        sources: this.extractMemorySources(memoryContext),
        maxTokens: profile.memory.maxSources,
        relevance: 'high',
      };
    }

    // Action request with active projects → memory is useful
    if (intent.intent === 'action_request' && memoryContext.activeProjects.length > 0) {
      return {
        use: true,
        sources: this.extractMemorySources(memoryContext),
        maxTokens: Math.min(profile.memory.maxSources, 5),
        relevance: 'high',
      };
    }

    // Preference signal → memory is very useful (store/retrieve preferences)
    if (intent.intent === 'preference_signal') {
      return {
        use: true,
        sources: ['preferences'],
        maxTokens: 3,
        relevance: 'high',
      };
    }

    // Diagnostic with recent decisions → useful context
    if (intent.intent === 'diagnostic' && memoryContext.recentDecisions.length > 0) {
      return {
        use: true,
        sources: this.extractMemorySources(memoryContext),
        maxTokens: Math.min(profile.memory.maxSources, 4),
        relevance: 'medium',
      };
    }

    // Information request with relevant knowledge → inject
    if (
      intent.intent === 'information_request' &&
      memoryContext.relevantKnowledge.length > 0
    ) {
      return {
        use: true,
        sources: ['knowledge'],
        maxTokens: Math.min(profile.memory.maxSources, 3),
        relevance: 'medium',
      };
    }

    // Conversational / very short → skip memory (cost not justified)
    if (intent.intent === 'conversational') {
      return { use: false, sources: [], maxTokens: 0, relevance: 'low' };
    }

    // Creative → minimal memory (creativity needs less anchoring)
    if (intent.intent === 'creative') {
      return { use: false, sources: [], maxTokens: 0, relevance: 'low' };
    }

    // Fallback: use memory if available and intent relevance is medium+
    if (hasContext && intent.memoryRelevance !== 'low') {
      return {
        use: true,
        sources: this.extractMemorySources(memoryContext),
        maxTokens: Math.min(profile.memory.maxSources, 3),
        relevance: intent.memoryRelevance,
      };
    }

    return { use: false, sources: [], maxTokens: 0, relevance: 'low' };
  }

  /**
   * Select provider based on explicit preference, champion ordering, and runtime health.
   */
  private selectProvider(
    profile: {
      preferredProviders: string[];
      temperature: number;
      maxTokens: number;
      reasoningEffort: EffortLevel;
    },
    userPreference: string,
    runtimeState?: DiscernmentInput['runtimeState'],
    canonicalMode?: CanonicalMode,
    classifierEffortLevel?: EffortLevel
  ): CanonicalDecision['provider'] {
    let candidates = [...profile.preferredProviders];

    // User explicit preference → top priority
    if (userPreference !== 'auto') {
      candidates = [userPreference, ...candidates.filter(p => p !== userPreference)];
    } else if (canonicalMode) {
      const champion = getChampion(canonicalMode);
      if (champion?.provider) {
        candidates = [
          champion.provider,
          ...candidates.filter(p => p !== champion.provider),
        ];
      }
    }

    candidates = [...new Set(candidates.filter(Boolean))];

    // Score candidates by health
    const scored = candidates.map(name => {
      const health = runtimeState?.providerHealth?.[name] ?? 0.8; // default healthy
      return { name, health };
    });

    // Sort: health desc, then preference order
    scored.sort((a, b) => b.health - a.health);

    const selected = scored[0] ?? { name: candidates[0] ?? 'ollama', health: 0.5 };
    const fallback = scored.slice(1).map(s => s.name);

    // Use the stronger of profile effort vs classifier effort (e.g. CERTIFY → 'max')
    const EFFORT_RANK: Record<EffortLevel, number> = { low: 0, medium: 1, high: 2, max: 3 };
    const resolvedEffort: EffortLevel =
      classifierEffortLevel &&
      EFFORT_RANK[classifierEffortLevel] > EFFORT_RANK[profile.reasoningEffort]
        ? classifierEffortLevel
        : profile.reasoningEffort;

    return {
      name: selected.name,
      model: 'auto', // orchestrator resolves model
      fallback,
      temperature: profile.temperature,
      maxTokens: profile.maxTokens,
      reasoningEffort: resolvedEffort,
    };
  }

  /**
   * Select tool/skill based on intent + availability.
   */
  private selectSkill(
    intent: IntentClassification,
    availableSkills?: Array<{ id: string; healthy: boolean; intentMatch: string[] }>
  ): string | null {
    if (!availableSkills || availableSkills.length === 0) return null;

    // Only action_request, diagnostic, and research_analysis intents can activate skills
    if (
      intent.intent !== 'action_request' &&
      intent.intent !== 'diagnostic' &&
      intent.intent !== 'research_analysis'
    ) {
      return null;
    }

    // Find healthy skill matching intent
    const match = availableSkills.find(
      s => s.healthy && s.intentMatch.includes(intent.intent)
    );

    return match?.id ?? null;
  }

  /**
   * Build fallback chain from provider candidates.
   */
  private buildFallbackChain(
    primary: string,
    preferredProviders: string[],
    runtimeState?: DiscernmentInput['runtimeState']
  ): string[] {
    const chain = preferredProviders.filter(p => p !== primary);

    // Remove unhealthy providers from chain
    if (runtimeState?.providerHealth) {
      return chain.filter(p => (runtimeState.providerHealth![p] ?? 0.5) > 0.3);
    }

    return chain;
  }

  /**
   * Evaluate truth status HONESTLY based on runtime evidence.
   * NOT declarative — this checks real conditions.
   */
  private evaluateTruthStatus(
    provider: string,
    runtimeState?: DiscernmentInput['runtimeState']
  ): TruthStatus {
    // If we have runtime health data, use it
    if (runtimeState?.providerHealth) {
      const health = runtimeState.providerHealth[provider] ?? 0;

      if (health >= 0.9) return 'PROVEN_RUNTIME';
      if (health >= 0.7) return 'STABLE_PARTIAL';
      if (health >= 0.4) return 'WIRED_BUT_UNPROVEN';
      if (health >= 0.1) return 'PARTIAL';
      return 'STUB_ONLY';
    }

    // No runtime data → be honest
    return 'WIRED_BUT_UNPROVEN';
  }

  /**
   * Build human-readable reasoning for the decision.
   */
  private buildReasoning(
    intent: IntentClassification,
    profileId: ResponseProfileId,
    inferenceState: string,
    memoryUsed: boolean,
    provider: string,
    skillId: string | null,
    truthStatus: TruthStatus
  ): string {
    const parts: string[] = [];

    parts.push(`Intent: ${intent.intent} (${(intent.confidence * 100).toFixed(0)}%)`);
    parts.push(`Profil: ${profileId}`);
    parts.push(`Inférence: ${inferenceState}`);
    parts.push(`Mémoire: ${memoryUsed ? 'active' : 'skip'}`);
    parts.push(`Provider: ${provider}`);
    if (skillId) parts.push(`Skill: ${skillId}`);
    parts.push(`Vérité: ${truthStatus}`);

    return parts.join(' | ');
  }

  /**
   * Compute overall confidence from all signals.
   */
  private computeOverallConfidence(signals: Array<{ confidence: number }>): number {
    if (signals.length === 0) return 0.5;

    const sum = signals.reduce((acc, s) => acc + s.confidence, 0);
    return Math.min(1.0, sum / signals.length);
  }

  /**
   * Extract memory source names from context.
   */
  private extractMemorySources(memoryContext: MemoryContext): string[] {
    const sources: string[] = [];

    if (memoryContext.activeProjects.length > 0) sources.push('projects');
    if (memoryContext.recentDecisions.length > 0) sources.push('decisions');
    if (memoryContext.relevantKnowledge.length > 0) sources.push('knowledge');
    if (memoryContext.activeRituals.length > 0) sources.push('rituals');

    return sources;
  }

  // ─────────────────────────────────────────────────────────────────
  // PHASE 3: METRICS + OBSERVABILITY
  // ─────────────────────────────────────────────────────────────────

  private updateMetrics(decision: CanonicalDecision): void {
    this.metrics.totalDecisions++;

    // Running average confidence
    this.metrics.avgConfidence =
      (this.metrics.avgConfidence * (this.metrics.totalDecisions - 1) +
        decision.confidence) /
      this.metrics.totalDecisions;

    // Running average processing time
    this.metrics.avgProcessingTimeMs =
      (this.metrics.avgProcessingTimeMs * (this.metrics.totalDecisions - 1) +
        decision.processingTimeMs) /
      this.metrics.totalDecisions;

    // Profile distribution
    this.metrics.profileDistribution[decision.profileId] =
      (this.metrics.profileDistribution[decision.profileId] ?? 0) + 1;

    // Truth distribution
    this.metrics.truthDistribution[decision.truthStatus] =
      (this.metrics.truthDistribution[decision.truthStatus] ?? 0) + 1;

    // Fallback tracking
    if (
      decision.fallbackChain.length > 0 &&
      decision.provider.name === decision.fallbackChain[0]
    ) {
      this.metrics.fallbackCount++;
    }
    this.metrics.fallbackRate = this.metrics.fallbackCount / this.metrics.totalDecisions;
  }

  /** Get kernel metrics for observability */
  getMetrics() {
    return { ...this.metrics };
  }

  /** Get recent decision log (last N decisions) */
  getDecisionLog(count = 10): CanonicalDecision[] {
    return this.decisionLog.slice(-count);
  }

  /** Get last decision */
  getLastDecision(): CanonicalDecision | null {
    return this.decisionLog.length > 0
      ? this.decisionLog[this.decisionLog.length - 1]!
      : null;
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const canonicalDiscernmentKernel = new CanonicalDiscernmentKernel();
export default canonicalDiscernmentKernel;
