/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — CHAT ENGINE OMEGA (FlowEngine Reconstruction)
 *   Pipeline infaillible • Validation multi-niveaux • Auto-guérison
 *   Architecture: UI → useChat → chatEngine → orchestrator → providers → normalize → UI
 *   v22Ω AI Performance Optimizations: Parallel loading, -40% latency
 *   P1: Multi-conversations lifecycle integration
 * ═══════════════════════════════════════════════════════════════════
 */

import { DEFAULT_AI_CONFIG } from './types';
import type { AIMessage, AIResponse, AIConfig, AIProviderName } from './types';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { PromptContext } from '@/core/prompts';
import {
  requiresClarityAudit,
  detectSaturation,
  checkTruthConfidence,
  generateProtectionModeResponse,
  createClarityAuditTemplate,
} from '@/core/prompts';
import { aiOrchestrator } from './orchestrator';
import { memoryIntegration } from './memoryIntegration';
import type { MemoryContext } from './memoryIntegration';
import { logger as structuredLogger, generateCorrelationId } from '../monitoring/logger';
import {
  extractPreferences,
  shapeResponse,
  buildPreferencePrompt,
} from './preferenceEngine';
// v26.0.0: Intent classification and depth computation are now inside CanonicalDiscernmentKernel
// No longer called independently from chatEngine — kernel is the single source of truth

// PHASE 2: Unified Memory System Integration
import type {
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
} from '@/services/memory/types';
import { inputValidator } from './inputValidator';
import { chatModes, type ChatModeConfig } from './chatModes';
import { getEffectiveProfile, type InferenceState } from './responsePolicy'; // v24.4.0: Canonical response policy + inference gating
import {
  detectDocumentType,
  buildDocumentInstructions,
} from './professionalDocumentService'; // v30.1.0: Professional document generation
import { chatValidator } from '../chatValidator';
import type { ChatMode } from './chatTypes';
// Re-export for convenience
export type { ChatMode } from './chatTypes';
import {
  chatEngineCommands,
  type ProviderPreference,
  type ChatRequestArgs,
  type ChatCompletionPayload,
  type ChatPerformanceProfile,
} from '@/services/tauri/chatEngine.commands';
// 🧠 Phase 1: Canonical Discernment Kernel — single decision point
import {
  canonicalDiscernmentKernel,
  type CanonicalDecision,
} from './canonicalDiscernmentKernel';
import type { EffortLevel } from './omegaModeClassifier';
import { MEMORY_TIMEOUTS, REQUEST_BUDGETS } from '@/config/aiTimeouts.config'; // v22Ω: Centralized timeouts
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';
import { createLogger } from '@/utils/logger';
import { SingularityBridge } from '@/services/singularityBridge';

// 🆕 P1: Multi-conversations integration
import { conversationLifecycle } from '@/engines/conversation/conversationLifecycleEngine';
import {
  getActiveSkill,
  getSystemPromptForSkill,
  getActiveSkillId,
} from '@/services/skills/activation/skillActivator';
import {
  getCompactIndex as getDefaultKbIndex,
  getRelevantPromptContext as getDefaultKbPromptContext,
} from '@/services/api/defaultKnowledgeBase';

// Type-safe correction interface
interface _CorrectionInfo {
  correction_type?: string;
  confidence?: number;
  [key: string]: unknown;
}
function safeParseStreamMetadata(raw: string): BackendStreamMetadata {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return { raw: trimmed };
  }

  try {
    return JSON.parse(trimmed) as BackendStreamMetadata;
  } catch {
    const sanitized = trimmed
      .replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u')
      .replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
    return JSON.parse(sanitized) as BackendStreamMetadata;
  }
}

// 🚀 v24.3.1 - Performance Optimizations
import { responseCache } from '@/services/cache/responseCache';
import { predictivePreloader } from '@/services/cache/predictivePreloader';
// Deep analysis preference bridge
import { userPreferencesEngine } from '@/services/userPreferencesEngine';
// v30: OMEGA DevTools Bridge — wires real pipeline data → DevTools Journal
import { omegaDevToolsBridge } from './omegaDevToolsBridge';
// v31.2.33: Self-RAG Reflective Verifier
import {
  verifyCritique,
  applyReflectiveCorrections,
  REFLECTIVE_VERIFIER_ENABLED,
} from './reflectiveVerifier';
// v31.2.33: Working Memory Compressor
import { compress as compressHistory, COMPRESSION_HISTORY_THRESHOLD } from './workingMemoryCompressor';
// v31.2.38: Quality Verifier — heuristic post-generation quality scoring
import { evaluateResponseQuality } from './qualityVerifier';

const logger = createLogger('ChatEngine');
const DEBUG_CHAT_ENGINE_TRACES = Boolean(
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV
);

/** Depth preference values that the deep-analysis override is allowed to replace. */
const OVERRIDABLE_DEPTH_PREFS = new Set<string | null>(['standard', 'developed', null]);

/**
 * Returns 'deep' when the deep_internet_analysis preference is active and
 * no stronger depth preference has already been stored by the user.
 */
function resolveDepthPref(base: string | null): string | null {
  const deepActive =
    userPreferencesEngine.getPreferences().customPreferences['deep_internet_analysis'] ===
    true;
  if (deepActive && OVERRIDABLE_DEPTH_PREFS.has(base)) {
    return 'deep';
  }
  return base;
}

type BackendStreamMetadata = {
  raw?: string;
  provider?: string;
  model?: string;
  latency_ms?: number;
  tokens?: number;
  prompt_tokens?: number;
  chunk_count?: number;
  conversation_id?: string;
  message_id?: string;
  total_duration?: number;
  load_duration?: number;
  timestamp?: number;
  error?: string;
  parseError?: string;
};

function toBackendPerformanceProfile(profileId: string): ChatPerformanceProfile {
  switch (profileId) {
    case 'DIRECT':
      return 'fast';
    case 'DEEP':
    case 'ARCHITECT':
    case 'OMEGA':
      return 'deep';
    default:
      return 'balanced';
  }
}

// ─────────────────────────────────────────────────────────────────
// TYPES OMEGA ÉTENDUS + SURVEILLANCE
// ─────────────────────────────────────────────────────────────────

export interface ChatEngineConfig {
  mode: ChatMode;
  conversationId?: string;
  emotionState?: {
    valence: number; // -1.0 (négatif) → 1.0 (positif)
    intensity: number; // 0.0 (calme) → 1.0 (intense)
    energy: number; // 0.0 (épuisé) → 1.0 (énergisé)
  };
  contextSources?: {
    includeProjects?: boolean;
    includeDecisions?: boolean;
    includeRituals?: boolean;
    maxHistory?: number;
  };
  aiConfig?: AIConfig;
  omegaConfig?: {
    timeoutMs?: number;
    maxRetries?: number;
    enableSanitizer?: boolean;
    enableAutoHeal?: boolean;
  };
  // 🚀 v24.3.1 - Performance Features
  performanceConfig?: {
    enableCache?: boolean; // Défaut: true
    enablePredictive?: boolean; // Défaut: true
    cacheHitBonus?: boolean; // XP bonus si cache hit
  };
}

export interface ChatEngineResponse extends AIResponse {
  mode: ChatMode;
  contextUsed: string[];
  suggestions?: string[];
  omegaMetadata?: {
    pipelineSteps: string[];
    validationScore: number;
    autoHealed: boolean;
    failureHandled: boolean;
    processingTime: number;
    constitutionalProtection?: string; // CONSTITUTION v1.0: Law #8 saturation, Law #2 clarity, etc.
    // 🚀 v24.3.1 - Performance Metrics
    cacheHit?: boolean;
    cacheAge?: number;
    streamSimulated?: boolean;
    // v24.4.0: Inference gating
    inferenceState?: InferenceState;
    // v26.0.0: Reasoning summary
    reasoningSummary?: string;
    // v26.0.0: Canonical discernment decision (single decision point)
    canonicalDecision?: CanonicalDecision;
    // v31.2.38: Heuristic quality score from qualityVerifier (0–1, optional)
    qualityScore?: number;
  };
}

// ─────────────────────────────────────────────────────────────────
// CHAT ENGINE OMEGA v30.0.0Ω - FlowEngine Reconstruction
// ─────────────────────────────────────────────────────────────────

/** Modes for which response caching is disabled (creative/generative variability required) */
const CACHE_DISABLED_MODES = new Set([
  'creative',
  'journal',
  'brainstorming',
  'reflection',
  'hybrid',
]);

/** Module-level stop words set (FR + EN) — avoids re-creation per call in extractKeyConcepts() */
const STOP_WORDS = new Set([
  // French
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'et',
  'ou',
  'de',
  'du',
  'au',
  'aux',
  'ce',
  'ces',
  'son',
  'sa',
  'ses',
  'mon',
  'ma',
  'mes',
  'ton',
  'ta',
  'tes',
  'notre',
  'nos',
  'votre',
  'vos',
  'leur',
  'leurs',
  'je',
  'tu',
  'il',
  'elle',
  'nous',
  'vous',
  'ils',
  'elles',
  'que',
  'qui',
  'quoi',
  'dont',
  'où',
  'comment',
  'pourquoi',
  'quand',
  'est',
  'sont',
  'être',
  'avoir',
  'faire',
  'aller',
  'venir',
  'voir',
  'dire',
  'prendre',
  'mettre',
  'donner',
  'trouver',
  'passer',
  'pouvoir',
  'vouloir',
  'devoir',
  'savoir',
  'falloir',
  // English
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'shall',
  'this',
  'that',
  'these',
  'those',
  'with',
  'from',
  'for',
  'into',
]);

/** Module-level: policy for cognitive context on mode transitions.
 *  'preserve'  — keep all conversationContext entries unchanged.
 *  'summarize' — keep the last 3 entries, discard the rest.
 *  'clear'     — full reset (current default for unrelated transitions).
 *  The outer key is the *from* mode; inner key is the *to* mode.
 *  Missing combinations fall back to 'clear'.
 */
const MODE_TRANSITION_POLICY: Record<string, Record<string, 'clear' | 'preserve' | 'summarize'>> = {
  brainstorming: {
    synthesis: 'preserve',
    planning: 'summarize',
    journal: 'clear',
    debug_cognitive: 'clear',
    default: 'summarize',
  },
  synthesis: {
    planning: 'preserve',
    brainstorming: 'summarize',
    default: 'preserve',
    journal: 'clear',
    debug_cognitive: 'summarize',
  },
  planning: {
    default: 'preserve',
    synthesis: 'preserve',
    journal: 'summarize',
    brainstorming: 'clear',
    debug_cognitive: 'clear',
  },
  journal: {
    default: 'clear',
    brainstorming: 'clear',
    synthesis: 'clear',
    planning: 'clear',
    debug_cognitive: 'clear',
  },
  debug_cognitive: {
    default: 'summarize',
    planning: 'preserve',
    synthesis: 'preserve',
    brainstorming: 'clear',
    journal: 'clear',
  },
  default: {
    brainstorming: 'summarize',
    synthesis: 'summarize',
    planning: 'preserve',
    journal: 'clear',
    debug_cognitive: 'summarize',
  },
};

class ChatEngineOmega {
  private config: ChatEngineConfig = { mode: 'default' };
  private lastMode: ChatMode = 'default';
  private conversationContext: Map<string, unknown> = new Map();
  private pipelineFailures: number = 0;
  private lastHealing: number = 0;
  // 🆕 P1: DEPRECATED - Use conversationLifecycle.getActiveConversation() instead
  private conversationIds: Map<ChatMode, string> = new Map();
  private providerPreference: ProviderPreference = 'auto';
  // Default knowledge base: compact index injected into system prompt
  private _defaultKbIndex: string = '';
  private _defaultKbLoaded: boolean = false;
  // Promise lock: prevents concurrent IPC calls when two requests race at startup
  private _kbLoadPromise: Promise<void> | null = null;

  /**
   * PHASE 1Ω: Configure le mode avec reset cognitif OMEGA
   */
  setMode(mode: ChatMode, config?: Partial<ChatEngineConfig>): void {
    const startTime = Date.now();

    try {
      // Reset cognitif si changement de mode
      if (this.lastMode !== mode) {
        const policy = MODE_TRANSITION_POLICY[this.lastMode]?.[mode] ?? 'clear';
        if (policy === 'clear') {
          this.conversationContext.clear();
          logger.info(`Cognitive reset (clear): ${this.lastMode} → ${mode}`);
        } else if (policy === 'summarize') {
          const entries = Array.from(this.conversationContext.entries());
          const kept = entries.slice(-3);
          this.conversationContext.clear();
          kept.forEach(([k, v]) => this.conversationContext.set(k, v));
          logger.info(
            `Cognitive reset (summarize, kept=${kept.length}): ${this.lastMode} → ${mode}`
          );
        } else {
          logger.info(`Cognitive context preserved: ${this.lastMode} → ${mode}`);
        }
        this.lastMode = mode;

        // Reset compteurs erreur sur changement mode
        this.pipelineFailures = 0;
      }

      this.config = {
        mode,
        omegaConfig: {
          timeoutMs: REQUEST_BUDGETS.globalRequestMs,
          maxRetries: REQUEST_BUDGETS.maxAttempts,
          enableSanitizer: true,
          enableAutoHeal: true,
          ...config?.omegaConfig,
        },
        ...config,
      };

      logger.debug(`Mode configured: ${mode}`, { elapsed: Date.now() - startTime });
    } catch (error) {
      // Fallback configuration sécurisée
      logger.error('setMode error (recovered)', error);
      this.config = { mode: 'default' };
    }
  }

  setProvider(provider: ProviderPreference): void {
    this.providerPreference = provider;
  }

  /**
   * Lazy-load the compact knowledge base index for system-prompt injection.
   * Called once per ChatEngine instance; result is cached in _defaultKbIndex.
   * A Promise lock prevents concurrent IPC calls when two requests race at startup.
   */
  private async _ensureDefaultKbLoaded(): Promise<void> {
    if (this._defaultKbLoaded) return;
    if (this._kbLoadPromise) return this._kbLoadPromise;
    this._kbLoadPromise = (async () => {
      try {
        this._defaultKbIndex = await getDefaultKbIndex();
      } catch {
        this._defaultKbIndex = '';
      }
      this._defaultKbLoaded = true;
    })();
    return this._kbLoadPromise;
  }

  private isBackendAvailable(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  /**
   * 🆕 P1: Obtenir l'ID de conversation active depuis le lifecycle engine
   * Remplace getConversationId() qui utilisait Map<ChatMode, string>
   */
  private getConversationId(_mode?: ChatMode): string | undefined {
    // P1: Utiliser le lifecycle engine centralisé au lieu de la Map locale
    const activeId = conversationLifecycle.getActiveConversation();
    if (activeId) {
      return activeId;
    }
    // Fallback legacy (migration)
    return this.conversationIds.get(_mode || this.config.mode);
  }

  /**
   * 🆕 P1: Définir l'ID de conversation active
   * Note: Le lifecycle engine gère maintenant l'état actif
   */
  private setConversationId(mode: ChatMode, id: string): void {
    // Legacy support: garder la Map pour compatibilité
    this.conversationIds.set(mode, id);
    // P1: Synchroniser avec le lifecycle engine
    conversationLifecycle.setActiveConversation(id);
  }

  private normalizeBackendProvider(provider: string): AIProviderName {
    const normalized = provider.toLowerCase();
    if (normalized.includes('gemini')) {
      return 'tauri-gemini';
    }
    if (normalized.includes('ollama')) {
      return 'tauri-ollama';
    }
    if (normalized.includes('local')) {
      return 'tauri-local';
    }
    return 'tauri-backend';
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: GÉNÉRATION AVEC PIPELINE OMEGA RECONSTRUIT
   * Pipeline: Validation → Context → Prompt → Orchestrator → Validation → Post-process → Save
   * ═══════════════════════════════════════════════════════════════════
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<ChatEngineConfig>
  ): Promise<ChatEngineResponse> {
    const pipelineStartTime = Date.now();
    const pipelineSteps: string[] = [];
    let autoHealed = false;
    const failureHandled = false;
    const correlationId = generateCorrelationId();

    // 📊 Logging structuré: Requête chatEngine
    structuredLogger.info(
      'Requête chat engine',
      'ChatEngine',
      {
        messageLength: message.length,
        messagePreview: message.substring(0, 100),
        historyLength: history.length,
        mode: config?.mode || this.config.mode,
      },
      correlationId
    );

    this.debugFlowTrace('[chatEngine] generate() called', {
      message: message.substring(0, 100),
      historyLength: history.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const finalConfig = { ...this.config, ...config };

      // 🚀 v24.3.1 - PHASE 0: CACHE CHECK (Ultra-Fast Response)
      // Cache disabled for creative/generative modes to avoid stale/identical responses
      const enableCache =
        finalConfig.performanceConfig?.enableCache !== false &&
        !CACHE_DISABLED_MODES.has(finalConfig.mode);
      if (enableCache) {
        pipelineSteps.push('cache-check');
        const cached = responseCache.get({
          message,
          mode: finalConfig.mode,
          provider: 'auto',
        });

        if (cached) {
          // � Logging structuré: Cache hit
          logger.debug(
            'Cache hit - Réponse instantanée',
            'ChatEngine',
            {
              provider: cached.provider,
              contentLength: cached.content?.length,
              age: Date.now() - cached.timestamp,
              hitCount: cached.hitCount,
            },
            correlationId
          );

          this.debugFlowTrace('[chatEngine] cache hit', {
            provider: cached.provider,
            contentLength: cached.content?.length,
            hasContent: !!cached.content && cached.content.trim().length > 0,
            timestamp: cached.timestamp,
          });

          pipelineSteps.push('cache-hit');

          // Précharger les messages similaires en arrière-plan
          if (finalConfig.performanceConfig?.enablePredictive !== false) {
            predictivePreloader.recordUserMessage(message, finalConfig.mode);
          }

          return {
            content: cached.content,
            provider: cached.provider as AIProviderName,
            model: cached.model,
            timestamp: Date.now(),
            mode: finalConfig.mode,
            contextUsed: [],
            suggestions: this.generateSuggestions(finalConfig.mode),
            metadata: cached.metadata,
            omegaMetadata: {
              pipelineSteps,
              validationScore: 1.0,
              autoHealed: false,
              failureHandled: false,
              processingTime: Date.now() - pipelineStartTime,
              cacheHit: true,
              cacheAge: Date.now() - cached.timestamp,
            },
          };
        }

        logger.debug('Cache miss - proceeding with full pipeline');
      }

      logger.group('OMEGA Pipeline Starting');
      logger.info(`Mode: ${finalConfig.mode}`, {
        autoHeal: finalConfig.omegaConfig?.enableAutoHeal,
      });
      logger.groupEnd();

      // ═══ PHASE 1.1: VALIDATION ENTRÉE SÉCURISÉE ═══
      pipelineSteps.push('input-validation');
      logger.debug('Step 1.1: Input validation...');

      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message input');
      }

      const validatedMessage = inputValidator.validate(message.trim());
      if (!validatedMessage) {
        throw new Error('Message validation failed');
      }

      logger.debug('Validated', { length: validatedMessage.length });

      // ═══ PHASE 1.1.2: PREFERENCE EXTRACTION + NOISE DETECTION ═══
      // v24.5.0: Extract durable preferences from user message, detect noise
      pipelineSteps.push('preference-extraction');
      const prefResult = extractPreferences(validatedMessage);
      if (prefResult.preferences.length > 0) {
        logger.debug('Preferences detected in message', {
          count: prefResult.preferences.length,
          categories: [...new Set(prefResult.preferences.map(p => p.category))],
        });
      }
      if (prefResult.isNoise) {
        logger.debug('Noise detected — will not store as preference', {
          reason: prefResult.noiseReason,
        });
      }

      // v26.0.0: Intent classification and depth computation are now inside the kernel
      // No independent calls — kernel.discern() handles both
      const userDepthPref = resolveDepthPref(memoryIntegration.getDepthPreference());

      // ═══ PHASE 1.1.5: CONSTITUTIONAL CHECKS (TITANE∞ v1.0) ═══
      pipelineSteps.push('constitutional-checks');

      // CONSTITUTION LAW #8: Saturation Detection (Priority Override)
      const saturationDetected = detectSaturation(validatedMessage, history);
      if (saturationDetected) {
        logger.warn('⚠️ SATURATION DETECTED — Activating Protection Mode (Law #8)');
        pipelineSteps.push('protection-mode-activated');

        const saturationSigns = ['fatigue', 'surcharge', 'urgence'];
        const protectionResponse = generateProtectionModeResponse(saturationSigns);

        return {
          content: protectionResponse,
          provider: 'titane-constitutional',
          model: 'protection-mode-v1.0',
          timestamp: Date.now(),
          mode: finalConfig.mode,
          contextUsed: ['constitutional-law-8'],
          suggestions: [
            'Prendre une pause (15-30 min)',
            'Simplifier la demande',
            'Reporter décisions complexes',
          ],
          omegaMetadata: {
            pipelineSteps,
            validationScore: 1.0,
            autoHealed: true,
            failureHandled: false,
            processingTime: Date.now() - pipelineStartTime,
            constitutionalProtection: 'law-8-saturation',
          },
        };
      }

      // CONSTITUTION LAW #2: Clarity Audit Check
      const needsClarityAudit = requiresClarityAudit(validatedMessage);
      if (needsClarityAudit) {
        logger.info('📋 Clarity Audit required (Law #2) — Complex request detected');
        pipelineSteps.push('clarity-audit-flagged');
        // Note: Audit sera intégré dans le system prompt, pas bloquant
      }

      logger.debug('Constitutional checks complete', {
        saturation: saturationDetected,
        clarityAudit: needsClarityAudit,
      });

      // Generate or retrieve conversation ID
      const conversation_id =
        this.getConversationId(finalConfig.mode) ||
        `conv_${finalConfig.mode}_${Date.now()}`;
      this.setConversationId(finalConfig.mode, conversation_id);

      // Start observability trace in background so it overlaps with context loading.
      const turnNumber = history.filter(m => m.role === 'user').length + 1;
      const tracePromise = this.startTraceDeferred(
        conversation_id,
        turnNumber,
        validatedMessage
      );
      let traceId: string | undefined;

      // ═══ PHASE 1.2: PARALLEL CONTEXT LOADING (v22Ω Optimized) ═══
      // Memory context + Cognitive enrichment run in parallel for better latency
      pipelineSteps.push('context-loading-parallel');
      logger.debug('Step 1.2: Loading memory + cognitive context (parallel)...');

      let memoryContext: MemoryContext;
      let context: { sources: string[]; data: Record<string, unknown> };
      let cognitiveContext = '';
      const contextLoadStart = Date.now();

      // v22Ω: Parallel loading of both context sources (using centralized timeouts)
      const [memoryResult, cognitiveEnrichResult] = await Promise.allSettled([
        // Memory context loading
        this.withTimeout(
          memoryIntegration.loadContext(finalConfig.contextSources || {}),
          MEMORY_TIMEOUTS.contextLoad,
          'Memory context timeout'
        ),
        // Cognitive enrichment (runs in parallel!)
        this.withTimeout(
          cognitiveOmega.enrichContext(
            validatedMessage,
            conversation_id,
            finalConfig.mode
          ),
          MEMORY_TIMEOUTS.cognitiveEnrichment,
          'Cognitive context enrichment timeout'
        ),
      ]);

      // Handle memory result
      if (memoryResult.status === 'fulfilled') {
        memoryContext = memoryResult.value;
        context = this.formatMemoryContext(memoryContext);
        logger.debug('Context loaded', { sources: context.sources.length });
      } else {
        logger.warn('Memory context failed, using empty context', memoryResult.reason);
        memoryContext = {
          activeProjects: [],
          recentDecisions: [],
          relevantKnowledge: [],
          activeRituals: [],
          timeline: [],
        };
        context = { sources: [], data: {} };
        autoHealed = true;
      }

      // Handle cognitive result
      if (cognitiveEnrichResult.status === 'fulfilled') {
        const enrichment = cognitiveEnrichResult.value;
        cognitiveContext = enrichment.combined;
        traceId = await tracePromise;

        if (traceId) {
          await cognitiveOmega.logPhase(traceId, 'context_built', {
            memory_count: enrichment.metadata?.memoryCount,
            goal_count: enrichment.metadata?.goalCount,
            fact_count: enrichment.metadata?.factCount,
            context_length: cognitiveContext.length,
          });
        }

        logger.debug('Cognitive context enriched', {
          memories: enrichment.metadata?.memoryCount,
          goals: enrichment.metadata?.goalCount,
          facts: enrichment.metadata?.factCount,
        });
      } else {
        logger.warn(
          'Cognitive context enrichment failed, continuing without',
          cognitiveEnrichResult.reason
        );
        traceId = await tracePromise;
        autoHealed = true;
      }

      logger.debug('Parallel context loading completed', {
        durationMs: Date.now() - contextLoadStart,
        memory: memoryResult.status,
        cognitive: cognitiveEnrichResult.status,
      });

      // ═══ PHASE 1.2.4: CANONICAL DISCERNMENT KERNEL ═══
      // v26.0.0: Single decision point — all 8 decisions in one pass
      pipelineSteps.push('canonical-discernment');
      // Phase 2-3: Collect runtime state from orchestrator + cognitive kernel
      let providerHealthForKernel: Record<string, number> | undefined;
      try {
        const status = await aiOrchestrator.getProvidersStatus();
        providerHealthForKernel = Object.fromEntries(
          status.providers.map(p => [p.name, p.reliability / 100])
        );
      } catch {
        logger.debug('Could not fetch orchestrator status for kernel');
      }

      // Collect available skills for the kernel
      const availableSkills = finalConfig.mode !== 'default' ? [] : undefined;

      // Singularity-Omega unification: read cached coherence from SingularityBridge
      // (synchronous — uses in-memory state; falls back to 0.5 neutral if not yet loaded)
      const singularityCoherence = SingularityBridge.getCachedCoherence();

      const canonicalDecision = canonicalDiscernmentKernel.discern({
        message: validatedMessage,
        mode: finalConfig.mode,
        memoryContext,
        preferences: memoryIntegration.loadPreferences(),
        userDepthPreference: userDepthPref,
        providerPreference: this.providerPreference,
        runtimeState: {
          ...(providerHealthForKernel ? { providerHealth: providerHealthForKernel } : {}),
          singularityCoherence,
        },
        availableSkills,
      });

      logger.info('🧠 CanonicalDiscernmentKernel decision', {
        profile: canonicalDecision.profileId,
        inference: canonicalDecision.inferenceState,
        memory: canonicalDecision.memoryInjection.use,
        provider: canonicalDecision.provider.name,
        skill: canonicalDecision.skillId ?? 'none',
        truth: canonicalDecision.truthStatus,
        confidence: canonicalDecision.confidence.toFixed(2),
        timeMs: canonicalDecision.processingTimeMs,
      });

      // v30: Notify DevTools Journal that TITANE is now thinking (fire-and-forget)
      omegaDevToolsBridge
        .updateCognitiveState({
          status: 'thinking',
          currentMode: canonicalDecision.mode,
          currentProvider: canonicalDecision.provider.name,
          effortLevel: canonicalDecision.provider.reasoningEffort,
          singularityCoherence: Math.round(singularityCoherence * 100),
          processingLoad: 55,
          lastRequestAt: pipelineStartTime,
        })
        .catch(e => logger.debug('DevTools bridge: state thinking emit failed', { e }));

      // ═══ PHASE 1.3: CONSTRUCTION PROMPT SELON MODE ═══
      // v26.0.0: Kernel is the single source of truth — behavioralRouter runs inside kernel
      pipelineSteps.push('prompt-building');
      logger.debug(`Step 1.3: Building prompt for mode "${finalConfig.mode}"...`);

      const modeConfig = (chatModes[finalConfig.mode] ??
        chatModes.default) as ChatModeConfig;

      // v26.0.0: Use KERNEL's decision as the authoritative profile selection
      // The CanonicalDiscernmentKernel is the single source of truth for profile
      const { profile: effectiveResponseProfile, selectionResult: profileSelection } =
        getEffectiveProfile(
          finalConfig.mode,
          validatedMessage,
          modeConfig.maxTokens,
          modeConfig.temperature,
          canonicalDecision.profileId // Kernel is primary, not router
        );

      // v26.0.0: Use kernel's profileId for depth instructions (single source of truth)
      // v30.3.0: Pass complexity score for complexity-aware depth instruction selection
      const depthInstructions = this.buildDepthInstructions(
        canonicalDecision.profileId,
        effectiveResponseProfile,
        canonicalDecision.messageComplexity
      );

      // v26.0.0: Use kernel's memoryInjection decision to control memory injection
      const shouldInjectMemory =
        canonicalDecision.memoryInjection.use && context.sources.length > 0;

      const promptContext: PromptContext = {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: finalConfig.emotionState || this.config.emotionState,
        memory: shouldInjectMemory ? context : undefined,
      };

      // Build system prompt with cognitive context
      // v26.0.0: Only inject memory block if kernel decided to use it
      await this._ensureDefaultKbLoaded();
      const kbPromptContext = await getDefaultKbPromptContext(validatedMessage);
      let systemPrompt = this.buildSystemPrompt(
        modeConfig,
        shouldInjectMemory ? context : { sources: [], data: {} },
        promptContext,
        kbPromptContext
      );

      // Inject depth instructions into system prompt
      if (depthInstructions) {
        systemPrompt = `${systemPrompt}\n\n${depthInstructions}`;
      }

      // v30.3.0: Inject complexity awareness signal into system prompt
      // Helps the LLM calibrate response depth to actual message complexity
      if (canonicalDecision.messageComplexity > 0.5) {
        const complexityLabel =
          canonicalDecision.messageComplexity > 0.85
            ? 'très élevée'
            : canonicalDecision.messageComplexity > 0.72
              ? 'élevée'
              : 'modérée';
        systemPrompt = `${systemPrompt}\n\n═══ SIGNAL DE COMPLEXITÉ ═══\nComplexité détectée du message: ${(canonicalDecision.messageComplexity * 100).toFixed(0)}% (${complexityLabel})\nAdapte la profondeur et la structure de ta réponse en conséquence.\nConfiance de la décision: ${(canonicalDecision.confidence * 100).toFixed(0)}%`;
      }

      // v30.1.0: Inject professional document formatting instructions if document intent detected
      const documentDetection = detectDocumentType(validatedMessage);
      if (documentDetection && documentDetection.confidence >= 0.5) {
        const documentInstructions = buildDocumentInstructions(documentDetection.type);
        systemPrompt = `${systemPrompt}\n\n${documentInstructions}`;
      }

      // CONSTITUTION LAW #2: Inject Clarity Audit if needed
      if (needsClarityAudit) {
        const clarityTemplate = createClarityAuditTemplate(validatedMessage);
        systemPrompt = `${systemPrompt}

═══════════════════════════════════════════════════════════════════
⚠️ CLARITY AUDIT REQUIS (Constitution Loi #2)
═══════════════════════════════════════════════════════════════════

${clarityTemplate}

OBLIGATION: Réponds d'abord au Clarity Audit, PUIS fournis ta réponse principale.
Format: [Audit complet] + [Réponse utilisateur]
`;
      }

      // Inject cognitive context (memories + goals + facts)
      if (cognitiveContext.trim().length > 0) {
        systemPrompt = `${systemPrompt}\n\n${cognitiveContext}`;
      }

      // v30.3.0: Pre-LLM preference injection — tells the LLM about user preferences before generation
      const preferencePrompt = buildPreferencePrompt(memoryIntegration.loadPreferences());
      if (preferencePrompt) {
        systemPrompt = `${systemPrompt}\n\n${preferencePrompt}`;
      }

      const backendResponse = await this.tryBackendPipeline({
        finalConfig,
        validatedMessage,
        systemPrompt,
        memoryContext,
        context,
        pipelineSteps,
        pipelineStartTime,
        initialAutoHealed: autoHealed,
        modeMaxTokens: effectiveResponseProfile.maxTokens,
        modeTemperature: effectiveResponseProfile.temperature,
        reasoningEffort: canonicalDecision.provider.reasoningEffort,
        backendProvider:
          canonicalDecision.provider.name !== 'auto'
            ? (canonicalDecision.provider.name as ProviderPreference)
            : this.providerPreference !== 'auto'
              ? this.providerPreference
              : undefined,
        responseProfileId: effectiveResponseProfile.id,
        canonicalMode: canonicalDecision.modeClassification?.canonicalMode,
      });

      if (backendResponse) {
        return backendResponse;
      }

      // ═══ PHASE 1.33: MEMORY-FIRST ANSWER CHECK ═══
      // v26.0.0: Only check memory if kernel decided memory should be used
      // This prevents bypassing the kernel's memory authority
      pipelineSteps.push('memory-first-check');
      const memoryAnswer = canonicalDecision.memoryInjection.use
        ? this.checkMemoryForAnswer(validatedMessage, memoryContext, finalConfig.mode)
        : null;

      if (memoryAnswer) {
        logger.info('Memory-first: answer found in memory — skipping LLM call');
        pipelineSteps.push('memory-answer-returned');
        const processingTime = Date.now() - pipelineStartTime;
        return {
          content: memoryAnswer.content,
          provider: 'titane-memory' as AIProviderName,
          model: 'memory-first-v1.0',
          timestamp: Date.now(),
          mode: finalConfig.mode,
          contextUsed: ['memory-first'],
          suggestions: this.generateSuggestions(finalConfig.mode),
          omegaMetadata: {
            pipelineSteps,
            validationScore: 1.0,
            autoHealed: false,
            failureHandled: false,
            processingTime,
          },
        };
      }

      // ═══ PHASE 1.35: INFERENCE STATE GATING ═══
      // v26.0.0: Use kernel's inferenceState as single source of truth
      pipelineSteps.push('inference-gating');
      const hasMemoryContext = context.sources.length > 0;
      const inferenceState = canonicalDecision.inferenceState;

      logger.debug('Inference state from kernel', {
        state: inferenceState,
        profileId: effectiveResponseProfile.id,
        hasMemoryContext,
      });

      if (inferenceState === 'CLARIFY_REQUIRED') {
        logger.info('Clarification required — skipping LLM call');
        pipelineSteps.push('clarification-returned');
        const processingTime = Date.now() - pipelineStartTime;
        return {
          content: this.buildClarificationResponse(validatedMessage, finalConfig.mode),
          provider: 'titane-local' as AIProviderName,
          model: 'inference-gate-v1.0',
          timestamp: Date.now(),
          mode: finalConfig.mode,
          contextUsed: context.sources,
          suggestions: [
            'Reformuler avec plus de contexte',
            'Préciser ce que tu veux',
            'Donner un exemple concret',
          ],
          omegaMetadata: {
            pipelineSteps,
            validationScore: 1.0,
            autoHealed: false,
            failureHandled: false,
            processingTime,
            inferenceState,
            canonicalDecision,
          },
        };
      }

      if (inferenceState === 'BLOCKED_BY_MISSING_FACT') {
        logger.info('Blocked by missing fact — requesting specific information');
        pipelineSteps.push('missing-fact-requested');
        const processingTime = Date.now() - pipelineStartTime;
        return {
          content: this.buildMissingFactResponse(validatedMessage, finalConfig.mode),
          provider: 'titane-local' as AIProviderName,
          model: 'inference-gate-v1.0',
          timestamp: Date.now(),
          mode: finalConfig.mode,
          contextUsed: context.sources,
          suggestions: [
            'Fournir le fait manquant',
            'Clarifier le contexte',
            'Reformuler la question',
          ],
          omegaMetadata: {
            pipelineSteps,
            validationScore: 1.0,
            autoHealed: false,
            failureHandled: false,
            processingTime,
            inferenceState,
            canonicalDecision,
          },
        };
      }

      // ═══ PHASE 1.2.5: WORKING MEMORY COMPRESSION (Memory Survey) ═══
      // v31.2.33: Compress long history before prompt building to stay within token budget
      let workingHistory = history;
      if (history.length > COMPRESSION_HISTORY_THRESHOLD) {
        try {
          const compressed = await compressHistory(history);
          workingHistory = compressed.messages;
          pipelineSteps.push('working-memory-compressed');
          logger.debug('Working memory compressed', {
            from: compressed.originalLength,
            to: compressed.messages.length,
            ratio: compressed.compressionRatio.toFixed(2),
          });
        } catch (compressErr) {
          logger.warn('Working memory compression failed (non-blocking)', compressErr);
        }
      }

      const enrichedHistory = this.buildEnrichedHistory(
        workingHistory,
        context,
        modeConfig,
        promptContext,
        systemPrompt
      );
      logger.debug('Enriched history built', { messages: enrichedHistory.length });

      // ═══ PHASE 1.4: APPEL ORCHESTRATOR OMEGA ═══
      pipelineSteps.push('orchestrator-call');
      logger.debug('Step 1.4: Calling orchestrator...');

      this.debugFlowTrace('[chatEngine] calling aiOrchestrator.generate()', {
        message: validatedMessage.substring(0, 100),
        historyLength: enrichedHistory.length,
        mode: finalConfig.mode,
        aiConfig: finalConfig.aiConfig,
      });

      // Timeout adaptatif: selon le mode ET l'effort de raisonnement du kernel
      // vOPT: Map lookup O(1) au lieu de ternaires imbriqués
      const baseTimeout = finalConfig.omegaConfig?.timeoutMs || 30000;
      const EFFORT_TIMEOUT_MAP: Record<string, number> = {
        max: 4.0,  // CERTIFY → 120s for a 30s base
        high: 3.0, // DEEP_REASONING / ARCHITECT → 90s
      };
      const MODE_TIMEOUT_MAP: Record<string, number> = {
        brainstorming: 1.5,
        synthesis: 1.3,
      };
      const effortTimeoutMultiplier =
        EFFORT_TIMEOUT_MAP[canonicalDecision.provider.reasoningEffort ?? ''] ??
        MODE_TIMEOUT_MAP[finalConfig.mode ?? ''] ??
        1.0;
      const timeoutMs = baseTimeout * effortTimeoutMultiplier;
      // v26.0.0: Use kernel's provider preference
      const kernelProvider =
        canonicalDecision.provider.name !== 'auto'
          ? (canonicalDecision.provider.name as ProviderPreference)
          : this.providerPreference;

      // Apply kernel's provider preference to chatEngine
      if (kernelProvider !== this.providerPreference) {
        this.providerPreference = kernelProvider;
      }

      // v26.0.0: Pass kernel's provider and fallback chain to orchestrator
      const orchestratorConfig: Record<string, unknown> = {
        ...(finalConfig.aiConfig || {}),
        promptProfileId: modeConfig.profileId,
        promptContext,
        // Forward reasoning effort so Ollama provider can scale its internal timeout
        reasoningEffort: canonicalDecision.provider.reasoningEffort,
      };

      // Use kernel's provider preference if not 'auto'
      // vOLLAMA_AUTHORITY: set BOTH provider AND preferredProvider so the orchestrator
      // (which reads config?.preferredProvider) respects the kernel's canonical decision.
      if (canonicalDecision.provider.name !== 'auto') {
        orchestratorConfig.provider = canonicalDecision.provider.name;
        orchestratorConfig.preferredProvider = canonicalDecision.provider.name;
      }

      // Use kernel's fallback chain
      if (canonicalDecision.fallbackChain.length > 0) {
        orchestratorConfig.fallbackProviders = canonicalDecision.fallbackChain;
      }

      // Use kernel's temperature and maxTokens
      orchestratorConfig.temperature = canonicalDecision.provider.temperature;
      orchestratorConfig.maxTokens = canonicalDecision.provider.maxTokens;
      // v30: Pass canonicalMode so orchestrator can honor champion scoring (OLLAMA CHAMPION)
      orchestratorConfig.canonicalMode = canonicalDecision.mode;

      const response = await this.withTimeout(
        aiOrchestrator.generate(validatedMessage, enrichedHistory, orchestratorConfig),
        timeoutMs,
        `Orchestrator timeout (${timeoutMs}ms)`
      );

      this.debugFlowTrace('[chatEngine] orchestrator response received', {
        provider: response?.provider,
        contentLength: response?.content?.length,
        timestamp: new Date().toISOString(),
      });

      if (!response || !response.content) {
        throw new Error('Orchestrator returned empty response');
      }

      logger.debug('Orchestrator response received');

      // ═══ PHASE 1.4.5: CONSTITUTIONAL TRUTH CHECK (LAW #10) ═══
      pipelineSteps.push('truth-check');
      logger.debug('Step 1.4.5: Truth confidence check (Law #10)...');

      const truthCheck = checkTruthConfidence(response.content);
      if (truthCheck.requiresDisclaimer && truthCheck.certainty < 80) {
        logger.warn(`⚠️ Low certainty detected: ${truthCheck.certainty}%`);
        const disclaimer = `\n\n---\n⚠️ **Note de vérité** (Constitution Loi #10): Niveau de certitude ${truthCheck.certainty}%. Si tu as besoin d'informations critiques vérifiées, consulte des sources officielles ou experts humains.`;
        response.content = response.content + disclaimer;
        autoHealed = true;
        pipelineSteps.push('truth-disclaimer-added');
      }

      // ═══ PHASE 1.5: VALIDATION NEXUS & SENTINEL ═══
      pipelineSteps.push('nexus-sentinel-validation');
      logger.debug('Step 1.5: Validating response with Nexus/Sentinel...');

      const validation = chatValidator.validate(
        response.content,
        finalConfig.mode,
        validatedMessage
      );
      logger.debug('Validation score', {
        score: (validation.score * 100).toFixed(0) + '%',
        coherence: (validation.coherenceScore * 100).toFixed(0) + '%',
        anomaly: (validation.anomalyScore * 100).toFixed(0) + '%',
      });

      if (validation.issues.length > 0) {
        logger.warn(`Issues detected: ${validation.issues.length}`);
        validation.issues.forEach(issue => {
          logger.debug(`Issue: [${issue.severity}] ${issue.type} - ${issue.message}`);
        });
      }

      // Si validation échoue, utiliser réponse nettoyée ou auto-heal
      if (!validation.isValid) {
        if (validation.cleaned && finalConfig.omegaConfig?.enableSanitizer) {
          logger.info('Using sanitized response');
          response.content = validation.cleaned;
          autoHealed = true;
        } else if (finalConfig.omegaConfig?.enableAutoHeal) {
          logger.info('Auto-healing invalid response');
          response.content = this.generateEmergencyResponse(
            validatedMessage,
            finalConfig.mode
          );
          autoHealed = true;
        }
      }

      // ═══ PHASE 1.5.1: CONSISTENCY CHECK (v∞.42) ═══
      pipelineSteps.push('consistency-check');
      logger.debug('Step 1.5.1: Checking consistency with cognitive engine...');

      try {
        const consistencyResult = await this.withTimeout(
          cognitiveOmega.checkConsistency(conversation_id, response.content, {
            userMessage: validatedMessage,
            mode: finalConfig.mode,
          }),
          2000,
          'Consistency check timeout'
        );

        if (traceId) {
          await cognitiveOmega.logPhase(traceId, 'consistency_check', {
            is_consistent: consistencyResult.isConsistent,
            violations_count: consistencyResult.violations.length,
            consistency_score: consistencyResult.consistencyScore,
            should_correct: consistencyResult.shouldCorrect,
          });
        }

        if (!consistencyResult.isConsistent) {
          logger.debug('Consistency violations detected', {
            count: consistencyResult.violations.length,
          });

          consistencyResult.violations.forEach((v, idx) => {
            logger.debug('Violation detail', {
              index: idx + 1,
              severity: v.severity,
              type: v.type,
              description: v.description,
            });
          });

          // Auto-correct if high/critical violations
          if (
            consistencyResult.shouldCorrect &&
            finalConfig.omegaConfig?.enableAutoHeal
          ) {
            logger.debug('Applying auto-correction');

            const correctionResult = await cognitiveOmega.autoCorrect(
              conversation_id,
              response.content,
              consistencyResult.violations
            );

            if (correctionResult.corrected) {
              response.content = correctionResult.correctedResponse;
              autoHealed = true;

              const violationsCount = Array.isArray(
                correctionResult.correction?.violations
              )
                ? correctionResult.correction.violations.length
                : 0;

              if (traceId) {
                await cognitiveOmega.logPhase(traceId, 'auto_correction', {
                  applied: true,
                  correction_type: 'omega_autocorrect',
                  violations_count: violationsCount,
                });
              }

              logger.info('Response auto-corrected for consistency', {
                correctionType: 'omega_autocorrect',
                violationsCount,
              });
            }
          }
        } else {
          logger.debug('Response consistency validated', {
            score: (consistencyResult.consistencyScore * 100).toFixed(0) + '%',
          });
        }
      } catch (error) {
        logger.warn('Consistency check failed (non-blocking)', { error });
        autoHealed = true;
      }

      // ═══ PHASE 1.5.2: REFLECTIVE VERIFICATION (Self-RAG) ═══
      // v31.2.33: Vérifie fiabilité factuelle, enrichit avec sources web si confiance faible
      if (REFLECTIVE_VERIFIER_ENABLED) {
        try {
          const critique = await verifyCritique(
            validatedMessage,
            response.content,
            {
              singularityCoherence,
              memoryMatches: context.sources.length,
              mode: finalConfig.mode,
            }
          );
          if (critique.shouldRevise && critique.webSources.length > 0) {
            response.content = applyReflectiveCorrections(response.content, critique);
          }
          if (!critique.verified) {
            pipelineSteps.push('reflective-verification-low-confidence');
          } else {
            pipelineSteps.push('reflective-verification-pass');
          }
          logger.debug('Reflective verification', {
            confidence: critique.confidence.toFixed(2),
            hasFactualClaims: critique.hasFactualClaims,
            shouldRevise: critique.shouldRevise,
            webSourcesCount: critique.webSources.length,
            ms: critique.processingMs,
          });
        } catch (reflectErr) {
          logger.warn('Reflective verification failed (non-blocking)', reflectErr);
        }
      }

      // ═══ PHASE 1.6: POST-TRAITEMENT SELON MODE ═══
      pipelineSteps.push('post-processing');
      logger.debug('Step 1.6: Post-processing...');
      const processedResponse = this.postProcess(response, finalConfig);
      logger.debug('Response processed');

      // ═══ PHASE 1.7: ORDERED MEMORY SAVING ═══
      pipelineSteps.push('memory-saving-ordered');
      logger.debug('Step 1.7: Saving to memory engines (ordered)...');

      const memorySaveStart = Date.now();

      const {
        persistentStatus,
        cognitiveStatus,
        autoHealed: memoryAutoHealed,
      } = await this.saveMemoryArtifacts({
        conversationId: conversation_id,
        userMessage: validatedMessage,
        assistantResponse: processedResponse.content,
        mode: finalConfig.mode,
        emotionState: finalConfig.emotionState,
        memoryContext,
        provider: processedResponse.provider,
        model: processedResponse.model,
        pipelineStartTime,
        traceId,
      });

      autoHealed ||= memoryAutoHealed;

      if (cognitiveStatus === 'fulfilled' && traceId) {
        await cognitiveOmega.logPhase(traceId, 'memory_saved', {
          conversation_id,
          mode: finalConfig.mode,
        });
      }

      logger.debug('Memory saves completed', {
        ordered: true,
        durationMs: Date.now() - memorySaveStart,
        persistent: persistentStatus,
        cognitive: cognitiveStatus,
      });

      // ═══ PHASE 1.7.2: PREFERENCE STORAGE ═══
      // v24.5.0: Save extracted preferences (noise already filtered)
      if (prefResult.preferences.length > 0 && !prefResult.isNoise) {
        pipelineSteps.push('preference-saving');
        memoryIntegration.savePreferences(prefResult.preferences);
        logger.debug('Preferences saved', {
          count: prefResult.preferences.length,
        });
      }

      // End observability trace
      if (traceId) {
        try {
          await cognitiveOmega.endTrace(traceId, processedResponse.content, 'success');
          logger.debug('Observability trace ended', { status: 'success' });
        } catch (error) {
          logger.warn('Failed to end observability trace', { error });
        }
      }

      // ═══ PHASE 1.7.5: PREFERENCE-AWARE RESPONSE SHAPING ═══
      // v24.5.0: Apply stored preferences to shape the response
      const activePreferences = memoryIntegration.loadPreferences();
      if (activePreferences.length > 0) {
        pipelineSteps.push('preference-shaping');
        const shapedContent = shapeResponse(processedResponse.content, activePreferences);
        if (shapedContent !== processedResponse.content) {
          processedResponse.content = shapedContent;
          logger.debug('Response shaped by preferences', {
            preferenceCount: activePreferences.length,
          });
        }
      }

      // ═══ PHASE 1.7.8: KERNEL TRUTH STATUS VERIFICATION ═══
      // v26.0.0: Use kernel's truthStatus to verify response quality
      pipelineSteps.push('kernel-truth-verification');

      // Verify the kernel's truth status against actual response
      const kernelTruthStatus = canonicalDecision.truthStatus;
      const kernelConfidence = canonicalDecision.confidence;

      // If kernel predicted low truth and response is poor, flag it
      if (kernelTruthStatus === 'STUB_ONLY' || kernelTruthStatus === 'PARTIAL') {
        logger.warn(`Kernel predicted low truth status: ${kernelTruthStatus}`);
        // Add warning to response if confidence is low
        if (kernelConfidence < 0.5) {
          logger.warn(
            `Low kernel confidence (${kernelConfidence.toFixed(2)}) with truth status ${kernelTruthStatus}`
          );
        }
      }

      // If kernel predicted PROVEN_RUNTIME but response is poor, that's a contradiction
      if (kernelTruthStatus === 'PROVEN_RUNTIME' && validation.score < 0.5) {
        logger.error(
          `CONTRADICTION: Kernel predicted PROVEN_RUNTIME but validation score is ${validation.score}`
        );
        autoHealed = true;
      }

      // ═══ PHASE 1.8: CONSTRUCTION RÉPONSE FINALE OMEGA ═══
      pipelineSteps.push('response-building');
      const processingTime = Date.now() - pipelineStartTime;

      // v26.0.0: Generate visible reasoning summary (DEVELOPED+ only)
      // Uses kernel's canonicalDecision as single source of truth
      const kernelProfileId = canonicalDecision.profileId;
      const showReasoningSummary =
        kernelProfileId === 'DEVELOPED' ||
        kernelProfileId === 'DEEP' ||
        kernelProfileId === 'ARCHITECT' ||
        kernelProfileId === 'OMEGA';

      // Extract intent from kernel's signals for reasoning summary
      const kernelIntentSignal = canonicalDecision.signals.find(
        s => s.source === 'intent' && s.type === 'intent_classification'
      );
      const intentForSummary = {
        intent: (kernelIntentSignal?.value as string) ?? 'information_request',
        confidence: kernelIntentSignal?.confidence ?? canonicalDecision.confidence,
        signals: [],
      };

      const reasoningSummary = showReasoningSummary
        ? this.buildReasoningSummary(
            intentForSummary,
            kernelProfileId,
            effectiveResponseProfile,
            hasMemoryContext,
            inferenceState
          )
        : '';

      // Prepend reasoning summary to response content
      const finalContent = reasoningSummary
        ? `${reasoningSummary}\n\n${processedResponse.content}`
        : processedResponse.content;

      // v31.2.38: Quality Verifier — heuristic post-generation scoring (non-blocking)
      let qualityScore: number | undefined;
      try {
        const qualityCritique = evaluateResponseQuality(
          validatedMessage,
          finalContent,
          canonicalDecision.profileId
        );
        qualityScore = qualityCritique.overallScore;
        pipelineSteps.push(`quality-score:${qualityCritique.overallScore.toFixed(2)}`);
        if (qualityCritique.shouldEnhance) {
          logger.debug('Quality verifier: response below threshold', {
            score: qualityScore.toFixed(2),
            hint: qualityCritique.enhancementHint,
          });
        }
      } catch {
        // Non-blocking: quality verification failure must never abort the response
      }

      // v26.0.0: Use kernel's resolved mode as authoritative
      const finalResponse: ChatEngineResponse = {
        ...processedResponse,
        content: finalContent,
        mode: canonicalDecision.mode,
        contextUsed: context.sources,
        suggestions: this.generateSuggestions(finalConfig.mode),
        omegaMetadata: {
          pipelineSteps,
          validationScore: validation.score,
          autoHealed,
          failureHandled,
          processingTime,
          reasoningSummary: reasoningSummary || undefined,
          canonicalDecision,
          qualityScore,
        },
      };

      // 🚀 v24.3.1 - PHASE 1.9: CACHE INTELLIGENT (Sauvegarder pour réponses ultra-rapides)
      if (
        finalConfig.performanceConfig?.enableCache !== false &&
        !CACHE_DISABLED_MODES.has(finalConfig.mode)
      ) {
        pipelineSteps.push('cache-save');
        responseCache.set(
          {
            message,
            mode: finalConfig.mode,
            provider: 'auto',
          },
          processedResponse.content,
          {
            provider: processedResponse.provider,
            model: processedResponse.model ?? 'unknown',
            metadata: {
              validationScore: validation.score,
              processingTime,
              pipelineSteps,
            },
          }
        );

        logger.debug('Response saved to cache', {
          message: message.slice(0, 50),
          mode: finalConfig.mode,
        });

        // Préchargement prédictif en arrière-plan
        if (finalConfig.performanceConfig?.enablePredictive !== false) {
          predictivePreloader.recordUserMessage(message, finalConfig.mode);
        }
      }

      // Reset compteur failures si succès
      this.pipelineFailures = 0;

      logger.info('OMEGA Pipeline complete', {
        processingTime: `${processingTime}ms`,
        steps: pipelineSteps,
      });

      // v30: Feed OMEGA DevTools Journal with real pipeline data (fire-and-forget, Tauri-guarded)
      const singCoherence = SingularityBridge.getCachedCoherence();

      const reflNote = `Réponse ${
        validation.score >= 0.8
          ? 'excellente'
          : validation.score >= 0.6
            ? 'bonne'
            : 'basique'
      } (score: ${(validation.score * 100).toFixed(0)}%). Mode: ${canonicalDecision.mode}. Effort: ${canonicalDecision.provider.reasoningEffort}.`;

      omegaDevToolsBridge
        .reportJournalEntry({
          requestId: correlationId,
          startedAt: pipelineStartTime,
          request: message,
          response: processedResponse.content,
          decision: canonicalDecision,
          pipelineSteps,
          totalDurationMs: processingTime,
          success: true,
          singularityCoherence: singCoherence ?? undefined,
          reflectionNotes: reflNote,
        })
        .catch(e => logger.debug('DevTools bridge: journal emit failed', { e }));

      omegaDevToolsBridge
        .updateCognitiveState({ status: 'idle', processingLoad: 0 })
        .catch(e => logger.debug('DevTools bridge: state idle emit failed', { e }));

      return finalResponse;
    } catch (error) {
      // ═══ AUTO-HEAL PIPELINE OMEGA - RÉCUPÉRATION TOTALE ═══
      return this.handlePipelineFailure(
        error,
        message,
        history,
        config,
        pipelineSteps,
        pipelineStartTime
      );
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: AUTO-HEAL ENGINE - Récupération pipeline échoué
   * ═══════════════════════════════════════════════════════════════════
   */
  private handlePipelineFailure(
    error: Error | unknown,
    message: string,
    history: AIMessage[],
    config: Partial<ChatEngineConfig> | undefined,
    pipelineSteps: string[],
    pipelineStartTime: number
  ): ChatEngineResponse {
    this.pipelineFailures++;
    this.lastHealing = Date.now();

    logger.error('OMEGA pipeline failure', {
      failureCount: this.pipelineFailures,
      stepsCompleted: pipelineSteps.join(' → '),
      error,
    });

    // Emergency response selon niveau de failure
    let emergencyContent: string;
    let emergencyMode = 'omega-emergency';

    if (this.pipelineFailures <= 2) {
      emergencyContent = `🔄 **Auto-réparation OMEGA engagée** (Incident #${this.pipelineFailures})

Le système cognitif TITANE∞ v30.0.0 s'est automatiquement restauré. Je reste pleinement opérationnel.

**Ta question** : "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

Je peux continuer notre conversation normalement. Le pipeline OMEGA garantit une récupération totale.`;
    } else {
      emergencyMode = 'omega-survival';
      emergencyContent = `⚡ **Mode survie OMEGA activé**

Multiple incidents détectés (${this.pipelineFailures}). Basculement vers noyau autonome TITANE∞.

**Mode sécurisé** : Toutes mes fonctions core restent disponibles :
• Conversation fluide et intelligente
• Mémoire contextuelle préservée
• Assistance technique complète
• Auto-guérison continue

Que souhaites-tu explorer ?`;
    }

    const processingTime = Date.now() - pipelineStartTime;

    return {
      content: emergencyContent,
      provider: 'titane-local',
      model: 'omega-emergency-v19.2Ω',
      timestamp: Date.now(),
      mode: config?.mode || this.config.mode,
      contextUsed: ['emergency-recovery'],
      suggestions: [
        'Continuer la conversation normalement',
        'Demander un diagnostic système',
        'Redémarrer en mode sécurisé',
      ],
      omegaMetadata: {
        pipelineSteps,
        validationScore: 0,
        autoHealed: true,
        failureHandled: true,
        processingTime,
      },
      metadata: {
        emergency: true,
        auto_heal: true,
        failure_count: this.pipelineFailures,
        error_type: error?.toString()?.substring(0, 100) || 'unknown',
        mode: emergencyMode,
        omega_version: 'v19.2Ω',
      },
    };
  }

  private async tryBackendPipeline(params: {
    finalConfig: ChatEngineConfig;
    validatedMessage: string;
    systemPrompt: string;
    memoryContext: MemoryContext;
    context: { sources: string[]; data: Record<string, unknown> };
    pipelineSteps: string[];
    pipelineStartTime: number;
    initialAutoHealed: boolean;
    /** v24.4.0: Effective token budget from canonical response policy */
    modeMaxTokens?: number;
    /** v24.4.0: Effective temperature from canonical response policy */
    modeTemperature?: number;
    /** Reasoning effort level from CanonicalDecision — drives Ollama timeout scaling. */
    reasoningEffort?: EffortLevel;
    backendProvider?: ProviderPreference;
    responseProfileId: string;
    /** Canonical mode from omegaModeClassifier (e.g. 'REPAIR', 'CERTIFY'). */
    canonicalMode?: string;
  }): Promise<ChatEngineResponse | null> {
    const {
      finalConfig,
      validatedMessage,
      systemPrompt,
      memoryContext,
      context,
      pipelineSteps,
      pipelineStartTime,
      initialAutoHealed,
      modeMaxTokens,
      modeTemperature,
      reasoningEffort,
      backendProvider,
      responseProfileId,
      canonicalMode,
    } = params;

    if (!this.isBackendAvailable()) {
      return null;
    }

    try {
      pipelineSteps.push('backend-dispatch');

      const payload: ChatRequestArgs = {
        conversationId: this.getConversationId(finalConfig.mode),
        userMessage: validatedMessage,
        systemPrompt,
        // Canonical policy profile values take priority; user aiConfig overrides as explicit opt-in.
        // modeMaxTokens is the canonical budget from responsePolicy (DEEP=8192, ARCHITECT=12000, OMEGA=16000).
        temperature: finalConfig.aiConfig?.temperature ?? modeTemperature,
        maxOutputTokens: finalConfig.aiConfig?.maxTokens ?? modeMaxTokens,
        provider: backendProvider,
        enableStreaming: false,
        profile: toBackendPerformanceProfile(responseProfileId),
        canonicalMode,
      };

      const completion: ChatCompletionPayload =
        await chatEngineCommands.generateResponse(payload);
      // Guard: if backend is in mock mode, fall through to real orchestrator
      if (completion.provider === 'mock' || completion.content?.startsWith('(MOCK)')) {
        logger.warn(
          '[chatEngine] Mock backend response detected — falling through to orchestrator'
        );
        return null;
      }
      this.setConversationId(finalConfig.mode, completion.conversationId);
      pipelineSteps.push('backend-response');

      let autoHealed = initialAutoHealed;

      let response: AIResponse = {
        content: completion.content,
        provider: this.normalizeBackendProvider(completion.provider),
        timestamp: completion.timestamp,
        model: completion.provider,
        tokens: completion.tokenCount,
        metadata: {
          backendMessageId: completion.messageId,
          backendConversationId: completion.conversationId,
          backendProvider: completion.provider,
          latencyMs: completion.latencyMs,
          tokenCount: completion.tokenCount,
        },
      };

      pipelineSteps.push('nexus-sentinel-validation');
      const validation = chatValidator.validate(
        response.content,
        finalConfig.mode,
        validatedMessage
      );
      logger.debug('Backend validation complete', {
        score: `${(validation.score * 100).toFixed(0)}%`,
      });

      if (validation.issues.length > 0) {
        validation.issues.forEach(issue => {
          logger.debug('Backend validation issue', {
            severity: issue.severity,
            type: issue.type,
            message: issue.message,
          });
        });
      }

      if (!validation.isValid) {
        if (validation.cleaned && finalConfig.omegaConfig?.enableSanitizer) {
          response = {
            ...response,
            content: validation.cleaned,
          };
          autoHealed = true;
        } else if (finalConfig.omegaConfig?.enableAutoHeal) {
          response = {
            ...response,
            content: this.generateEmergencyResponse(validatedMessage, finalConfig.mode),
            provider: 'omnis-emergency',
            model: 'omega-emergency-v19.2Ω',
            metadata: {
              ...(response.metadata || {}),
              emergency: true,
            },
          };
          autoHealed = true;
        }
      }

      pipelineSteps.push('post-processing');
      const processedResponse = this.postProcess(response, finalConfig);

      pipelineSteps.push('memory-saving');
      try {
        await this.withTimeout(
          memoryIntegration.saveInteraction({
            mode: finalConfig.mode,
            userMessage: validatedMessage,
            aiResponse: processedResponse.content,
            emotionState: this.convertEmotionState(finalConfig.emotionState),
            context: memoryContext,
          }),
          3000,
          'Memory save timeout'
        );
      } catch (error) {
        logger.warn('Backend memory save failed (continuing)', { error });
        autoHealed = true;
      }

      pipelineSteps.push('response-building');
      const processingTime = Date.now() - pipelineStartTime;

      const finalResponse: ChatEngineResponse = {
        ...processedResponse,
        mode: finalConfig.mode,
        contextUsed: context.sources,
        suggestions: this.generateSuggestions(finalConfig.mode),
        omegaMetadata: {
          pipelineSteps,
          validationScore: validation.score,
          autoHealed,
          failureHandled: false,
          processingTime,
        },
      };

      logger.info('OMEGA Backend pipeline complete', {
        processingTime: `${processingTime}ms`,
        validationScore: validation.score,
        autoHealed,
      });

      this.pipelineFailures = 0;
      return finalResponse;
    } catch (error) {
      pipelineSteps.push('backend-error');
      logger.warn('Backend pipeline failed, falling back to orchestrator', { error });
      return null;
    }
  }

  private tryBackendStream(params: {
    finalConfig: ChatEngineConfig;
    validatedMessage: string;
    systemPrompt: string;
    memoryContext: MemoryContext;
    context: { sources: string[]; data: Record<string, unknown> };
    pipelineSteps: string[];
    pipelineStartTime: number;
    initialAutoHealed: boolean;
    modeMaxTokens?: number;
    modeTemperature?: number;
    backendProvider?: ProviderPreference;
    responseProfileId: string;
  }): AsyncGenerator<string, ChatEngineResponse> | null {
    if (!this.isBackendAvailable()) {
      return null;
    }

    return this.backendStreamGenerator(params);
  }

  private async *backendStreamGenerator(params: {
    finalConfig: ChatEngineConfig;
    validatedMessage: string;
    systemPrompt: string;
    memoryContext: MemoryContext;
    context: { sources: string[]; data: Record<string, unknown> };
    pipelineSteps: string[];
    pipelineStartTime: number;
    initialAutoHealed: boolean;
    modeMaxTokens?: number;
    modeTemperature?: number;
    backendProvider?: ProviderPreference;
    responseProfileId: string;
  }): AsyncGenerator<string, ChatEngineResponse> {
    const {
      finalConfig,
      validatedMessage,
      systemPrompt,
      memoryContext,
      context,
      pipelineSteps,
      pipelineStartTime,
      initialAutoHealed,
      modeMaxTokens,
      modeTemperature,
      backendProvider,
      responseProfileId,
    } = params;

    let autoHealed = initialAutoHealed;
    let conversationId: string | null = this.getConversationId(finalConfig.mode) ?? null;
    let messageId: string | null = null;
    let aggregatedContent = '';
    let done = false;
    let streamError: Error | null = null;
    let metadata: BackendStreamMetadata | null = null;
    let resolver: (() => void) | null = null;
    const queue: string[] = [];
    let chunkUnlisten: (() => void) | null = null;
    let doneUnlisten: (() => void) | null = null;

    const notify = () => {
      if (resolver) {
        const resolve = resolver;
        resolver = null;
        resolve();
      }
    };

    const payload: ChatRequestArgs = {
      conversationId: conversationId ?? undefined,
      userMessage: validatedMessage,
      systemPrompt,
      // Canonical policy profile values take priority; user aiConfig overrides as explicit opt-in.
      // modeMaxTokens is the canonical budget from responsePolicy (DEEP=8192, ARCHITECT=12000, OMEGA=16000).
      temperature: finalConfig.aiConfig?.temperature ?? modeTemperature,
      maxOutputTokens: finalConfig.aiConfig?.maxTokens ?? modeMaxTokens,
      provider: backendProvider,
      enableStreaming: true,
      profile: toBackendPerformanceProfile(responseProfileId),
    };

    try {
      chunkUnlisten = await chatEngineCommands.onStreamChunk(chunk => {
        if (!conversationId || !messageId) {
          return;
        }
        if (chunk.done) {
          return;
        }
        if (chunk.conversationId !== conversationId || chunk.messageId !== messageId) {
          return;
        }

        queue.push(chunk.content);
        notify();
      });

      doneUnlisten = await chatEngineCommands.onStreamDone(chunk => {
        if (!conversationId || !messageId) {
          return;
        }
        if (chunk.conversationId !== conversationId || chunk.messageId !== messageId) {
          return;
        }

        metadata = {};
        if (chunk.content) {
          try {
            metadata = safeParseStreamMetadata(chunk.content);
          } catch (parseError) {
            const message =
              parseError instanceof Error ? parseError.message : String(parseError);
            metadata = { parseError: message };
            autoHealed = true;
          }
        }

        if (metadata?.error) {
          streamError = new Error(metadata.error);
        }

        done = true;
        notify();
      });

      pipelineSteps.push('backend-stream-dispatch');
      const handle = await chatEngineCommands.streamResponse(payload);
      conversationId = handle.conversationId;
      messageId = handle.messageId;
      this.setConversationId(finalConfig.mode, handle.conversationId);
      pipelineSteps.push('backend-stream-open');

      const waitForData = async () => {
        if (queue.length > 0 || done || streamError) {
          return;
        }
        await new Promise<void>(resolve => {
          resolver = resolve;
        });
      };

      while (true) {
        if (streamError) {
          throw streamError;
        }

        if (queue.length === 0) {
          if (done) {
            break;
          }
          await waitForData();
          continue;
        }

        const nextChunk = queue.shift();
        if (!nextChunk) {
          continue;
        }

        aggregatedContent += nextChunk;
        yield nextChunk;
      }

      if (streamError) {
        throw streamError;
      }

      const meta: BackendStreamMetadata = metadata ?? {};
      const backendProvider =
        typeof meta.provider === 'string' ? meta.provider : 'tauri-backend';
      const provider = this.normalizeBackendProvider(backendProvider);
      const timestamp = typeof meta.timestamp === 'number' ? meta.timestamp : Date.now();
      const latencyMs = typeof meta.latency_ms === 'number' ? meta.latency_ms : 0;
      const tokenCount = typeof meta.tokens === 'number' ? meta.tokens : undefined;
      const promptTokenCount =
        typeof meta.prompt_tokens === 'number' ? meta.prompt_tokens : undefined;
      const chunkCount =
        typeof meta.chunk_count === 'number' ? meta.chunk_count : undefined;
      const totalDuration =
        typeof meta.total_duration === 'number' ? meta.total_duration : undefined;
      const loadDuration =
        typeof meta.load_duration === 'number' ? meta.load_duration : undefined;

      let response: AIResponse = {
        content: aggregatedContent,
        provider,
        timestamp,
        model: typeof meta.model === 'string' ? meta.model : backendProvider,
        tokens: tokenCount,
        metadata: {
          backendMessageId: messageId,
          backendConversationId: conversationId,
          backendProvider,
          latencyMs,
          tokenCount,
          promptTokens: promptTokenCount,
          chunkCount,
          totalDuration,
          loadDuration,
        },
      };

      pipelineSteps.push('nexus-sentinel-validation');
      const validation = chatValidator.validate(
        response.content,
        finalConfig.mode,
        validatedMessage
      );
      logger.debug('Backend stream validation complete', {
        score: `${(validation.score * 100).toFixed(0)}%`,
      });

      if (validation.issues.length > 0) {
        validation.issues.forEach(issue => {
          logger.debug('Backend stream validation issue', {
            severity: issue.severity,
            type: issue.type,
            message: issue.message,
          });
        });
      }

      if (!validation.isValid) {
        if (validation.cleaned && finalConfig.omegaConfig?.enableSanitizer) {
          response = {
            ...response,
            content: validation.cleaned,
          };
          autoHealed = true;
        } else if (finalConfig.omegaConfig?.enableAutoHeal) {
          response = {
            ...response,
            content: this.generateEmergencyResponse(validatedMessage, finalConfig.mode),
            provider: 'omnis-emergency',
            model: 'omega-emergency-v19.2Ω',
            metadata: {
              ...(response.metadata || {}),
              emergency: true,
            },
          };
          autoHealed = true;
        }
      }

      pipelineSteps.push('post-processing');
      const processed = this.postProcess(response, finalConfig);

      pipelineSteps.push('memory-saving');
      try {
        await this.withTimeout(
          memoryIntegration.saveInteraction({
            mode: finalConfig.mode,
            userMessage: validatedMessage,
            aiResponse: processed.content,
            emotionState: this.convertEmotionState(finalConfig.emotionState),
            context: memoryContext,
          }),
          3000,
          'Memory save timeout'
        );
      } catch (_memoryError) {
        logger.warn('Memory save failed (streaming)', { error: _memoryError });
        autoHealed = true;
      }

      pipelineSteps.push('response-building');
      const processingTime = Date.now() - pipelineStartTime;

      const finalResponse: ChatEngineResponse = {
        ...processed,
        mode: finalConfig.mode,
        contextUsed: context.sources,
        suggestions: this.generateSuggestions(finalConfig.mode),
        omegaMetadata: {
          pipelineSteps,
          validationScore: validation.score,
          autoHealed,
          failureHandled: false,
          processingTime,
        },
      };

      logger.info('OMEGA Backend stream complete', {
        processingTime: `${processingTime}ms`,
        validationScore: validation.score,
        autoHealed,
      });

      this.pipelineFailures = 0;
      return finalResponse;
    } catch (err) {
      pipelineSteps.push('backend-stream-error');
      throw err;
    } finally {
      done = true;
      notify();
      chunkUnlisten?.();
      doneUnlisten?.();
    }
  }

  /**
   * v24.4.0: Check if answer is already in memory before calling LLM
   * Returns memory-based answer if confidence > 0.7, null otherwise
   * v6.0.0: Improved with semantic keyword matching and relevance scoring
   */
  private checkMemoryForAnswer(
    message: string,
    memoryContext: MemoryContext,
    mode: ChatMode
  ): { content: string } | null {
    const msgLower = message.toLowerCase();
    const msgWords = msgLower.split(/\s+/).filter(w => w.length > 2);

    // Extract key concepts from message for semantic matching
    const concepts = this.extractKeyConcepts(msgLower);

    // Score each memory entry by relevance
    let bestMatch: { content: string; score: number } | null = null;

    // Check recent decisions with semantic scoring
    for (const decision of memoryContext.recentDecisions) {
      const score = this.computeRelevanceScore(
        msgLower,
        msgWords,
        concepts,
        decision.title.toLowerCase(),
        decision.rationale?.toLowerCase() || ''
      );

      if (score > 0.5) {
        const statusLabel =
          decision.status === 'implemented'
            ? '✅ Implémentée'
            : decision.status === 'pending'
              ? '⏳ En attente'
              : decision.status === 'revised'
                ? '🔄 Révisée'
                : '❌ Abandonnée';

        const match = {
          content: `**${decision.title}**\n\n${statusLabel} — ${decision.impact === 'high' ? 'Impact élevé' : decision.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}\n\n${decision.rationale || 'Décision enregistrée en mémoire.'}`,
          score,
        };

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = match;
        }
      }
    }

    // Check active projects with semantic scoring
    for (const project of memoryContext.activeProjects) {
      const score = this.computeRelevanceScore(
        msgLower,
        msgWords,
        concepts,
        project.title.toLowerCase(),
        project.description?.toLowerCase() || ''
      );

      if (score > 0.5) {
        const statusLabel =
          project.status === 'active'
            ? '🟢 Actif'
            : project.status === 'paused'
              ? '⏸️ En pause'
              : project.status === 'completed'
                ? '✅ Terminé'
                : '📦 Archivé';

        const match = {
          content: `**${project.title}**\n\n${statusLabel} — Progression : ${project.progress}% — Priorité : ${project.priority}\n\n${project.description || 'Projet en mémoire.'}`,
          score,
        };

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = match;
        }
      }
    }

    // Check knowledge entries with semantic scoring
    for (const entry of memoryContext.relevantKnowledge) {
      const score = this.computeRelevanceScore(
        msgLower,
        msgWords,
        concepts,
        entry.title.toLowerCase(),
        entry.content.toLowerCase()
      );

      if (score > 0.5) {
        const match = {
          content: `**${entry.title}** (${entry.category})\n\n${entry.content.substring(0, 500)}${entry.content.length > 500 ? '...' : ''}`,
          score,
        };

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = match;
        }
      }
    }

    // Return best match if confidence is high enough
    if (bestMatch && bestMatch.score >= 0.6) {
      return { content: bestMatch.content };
    }

    return null;
  }

  /**
   * v6.0.0: Extract key concepts from a message for semantic matching
   * v30.0.0: Stop words hoisted to module-level STOP_WORDS constant
   */
  private extractKeyConcepts(message: string): string[] {
    const concepts: string[] = [];

    const words = message.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      if (!STOP_WORDS.has(word)) {
        concepts.push(word);
      }
    }

    return concepts;
  }

  /**
   * v6.0.0: Compute relevance score between message and memory entry
   */
  private computeRelevanceScore(
    msgLower: string,
    msgWords: string[],
    concepts: string[],
    titleLower: string,
    contentLower: string
  ): number {
    let score = 0;

    // Direct title containment (highest weight)
    if (msgLower.includes(titleLower) || titleLower.includes(msgLower)) {
      score += 0.8;
    }

    // Title word overlap
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 2);
    const titleOverlap = msgWords.filter(w =>
      titleWords.some(tw => tw.includes(w) || w.includes(tw))
    );
    if (titleWords.length > 0) {
      score += (titleOverlap.length / titleWords.length) * 0.4;
    }

    // Concept matching in title and content
    for (const concept of concepts) {
      if (titleLower.includes(concept)) {
        score += 0.15;
      }
      if (contentLower.includes(concept)) {
        score += 0.05;
      }
    }

    // Fuzzy title match
    if (this.fuzzyMatch(msgLower, titleLower)) {
      score += 0.3;
    }

    return Math.min(1.0, score);
  }

  /**
   * Simple fuzzy match: checks if a query is close enough to a target
   */
  private fuzzyMatch(query: string, target: string): boolean {
    // Direct containment
    if (target.includes(query) || query.includes(target)) return true;

    // Word overlap check
    const queryWords = query.split(/\s+/).filter(w => w.length > 3);
    const targetWords = target.split(/\s+/).filter(w => w.length > 3);

    if (queryWords.length === 0 || targetWords.length === 0) return false;

    const overlap = queryWords.filter(w =>
      targetWords.some(tw => tw.includes(w) || w.includes(tw))
    );
    return overlap.length / Math.min(queryWords.length, targetWords.length) >= 0.5;
  }

  /**
   * v24.4.0: Build clarification response when inference state is CLARIFY_REQUIRED
   * v6.0.0: More surgical — infers likely intent and asks only what's truly needed
   * Avoids calling LLM for ambiguous requests
   */
  private buildClarificationResponse(message: string, mode: ChatMode): string {
    const msgLower = message.toLowerCase();
    const wordCount = message.split(/\s+/).filter(Boolean).length;

    // Ultra-short messages: ask for minimal context
    if (wordCount < 3) {
      return `Je perçois ta demande mais elle est très courte. Que veux-tu que je fasse exactement ?`;
    }

    // Acknowledgment messages: confirm understanding
    if (msgLower.match(/^(ok|oui|non|peut-être|sure|maybe|yes|no)$/)) {
      return `Message reçu. Quel est le sujet ou l'action souhaitée ?`;
    }

    // Try to infer likely domain from partial message
    const likelyDomain = this.inferLikelyDomain(msgLower);

    if (likelyDomain) {
      return `Je pense que tu parles de **${likelyDomain}**. Quelle action précise veux-tu que j'exécute ?`;
    }

    // Generic but concise clarification
    return `Précise l'action exacte à exécuter ou le résultat attendu.`;
  }

  /**
   * v6.0.0: Infer likely domain from partial message
   */
  private inferLikelyDomain(message: string): string | null {
    const domainPatterns: Record<string, RegExp[]> = {
      'TITANE / architecture': [/\btitane\b/i, /\barchitecture\b/i, /\btauri\b/i],
      'développement / code': [
        /\bcode\b/i,
        /\bbug\b/i,
        /\bdebug\b/i,
        /\btypescript\b/i,
        /\breact\b/i,
        /\brust\b/i,
      ],
      déploiement: [/\bdéploiement\b/i, /\bdeploy\b/i, /\bproduction\b/i],
      'mémoire / historique': [
        /\bmémoire\b/i,
        /\bmemory\b/i,
        /\bsouviens\b/i,
        /\bremember\b/i,
      ],
      'diagnostic / performance': [
        /\bdiagnostic\b/i,
        /\bperformance\b/i,
        /\bslow\b/i,
        /\blent\b/i,
      ],
    };

    for (const [domain, patterns] of Object.entries(domainPatterns)) {
      if (patterns.some(p => p.test(message))) {
        return domain;
      }
    }

    return null;
  }

  /**
   * v24.4.0: Build response when inference state is BLOCKED_BY_MISSING_FACT
   * Requests specific missing information without calling LLM
   */
  private buildMissingFactResponse(message: string, mode: ChatMode): string {
    return `Pour répondre à ta demande, il me manque un élément d'information clé.

**Ta demande** : "${message.substring(0, 120)}${message.length > 120 ? '...' : ''}"

Pour que je puisse avancer, pourrais-tu me fournir :
• Le contexte manquant (ex: projet, date, référence technique)
• Le résultat attendu (ex: analyse, code, recommandation)
• Toute contrainte spécifique

Avec ces précisions, je pourrai te donner une réponse complète et utile.`;
  }

  /**
   * v26.0.0: Build visible reasoning summary for Kevin
   * v30.1.0: Enhanced with cognitive transparency, reasoning chain preview,
   *          and signal dominance indicators
   * Shows WHY TITANE chose this depth and approach
   * Visible in the response, helps Kevin understand TITANE's reasoning
   */
  private buildReasoningSummary(
    intentResult: { intent: string; confidence: number; signals: string[] },
    effectiveDepth: string,
    profile: { id: string; label: string; maxTokens: number },
    hasMemoryContext: boolean,
    inferenceState: string
  ): string {
    const intentLabels: Record<string, string> = {
      information_request: "Demande d'information",
      action_request: "Demande d'action",
      memory_recall: 'Rappel mémoire',
      current_info: 'Info courante',
      preference_signal: 'Signal de préférence',
      creative: 'Demande créative',
      diagnostic: 'Diagnostic',
      conversational: 'Conversationnel',
      research_analysis: 'Analyse & Recherche',
      professional_document: 'Document professionnel',
      deep_reflection: 'Réflexion profonde',
      memory_management: 'Gestion de mémoire',
      message_analysis: 'Analyse de message',
      data_collection: 'Collecte de données',
    };

    const depthLabels: Record<string, string> = {
      DIRECT: 'DIRECT — réponse courte',
      BALANCED: 'ÉQUILIBRÉ — réponse structurée',
      DEVELOPED: 'DÉVELOPPÉ — réflexion approfondie',
      DEEP: 'PROFOND — analyse multi-couches',
      ARCHITECT: 'ARCHITECTE — clarté stratégique',
      OMEGA: 'OMEGA — puissance cognitive maximale',
    };

    const reasoningChainLabels: Record<string, string> = {
      DIRECT: 'Question → Réponse',
      BALANCED: 'Constat → Analyse → Recommandation',
      DEVELOPED: 'Cadrage → Analyse → Raisonnement → Synthèse → Action',
      DEEP: 'Problème → Cartographie → Multi-perspective → Synthèse → Recommandations',
      ARCHITECT:
        'Registre → Forces → Tensions → Scénarios → Décision → Validation → Rollback',
      OMEGA:
        'Méta-analyse → Décomposition → 6 perspectives → Synthèse intégrative → Transfert',
    };

    const memoryStatus = hasMemoryContext
      ? '✅ Mémoire contextuelle active'
      : '📭 Pas de mémoire contextuelle';
    const actionLabel =
      inferenceState === 'SAFE_TO_INFER'
        ? '✅ Réponse directe'
        : inferenceState === 'CLARIFY_REQUIRED'
          ? '❓ Clarification chirurgicale'
          : inferenceState === 'BLOCKED_BY_MISSING_FACT'
            ? '🚫 Demande de fait manquant'
            : '💡 Inférence avec hypothèse';

    const confidenceBar = this.buildConfidenceBar(intentResult.confidence);

    return [
      `🧠 **Raisonnement TITANE∞**`,
      `🎯 **Intent**: ${intentLabels[intentResult.intent] || intentResult.intent} → Profil ${depthLabels[effectiveDepth] || effectiveDepth}`,
      `🔗 **Chaîne**: ${reasoningChainLabels[effectiveDepth] || 'Standard'}`,
      `📊 **Confiance**: ${confidenceBar} ${(intentResult.confidence * 100).toFixed(0)}% | ${memoryStatus}`,
      `⚡ **Action**: ${actionLabel} | Budget: ${profile.maxTokens} tokens`,
    ].join('\n');
  }

  /**
   * v30.1.0: Build a visual confidence bar for reasoning summary
   */
  private buildConfidenceBar(confidence: number): string {
    const filled = Math.round(confidence * 5);
    const empty = 5 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: Emergency Response Generator
   * ═══════════════════════════════════════════════════════════════════
   */
  private generateEmergencyResponse(message: string, mode: ChatMode): string {
    const responses = {
      default: `Je traite ta demande : "${message.substring(0, 60)}". En mode sécurisé OMEGA, je peux t'assister avec l'architecture TITANE∞, diagnostic, ou questions techniques.`,

      brainstorming: `Explorons ensemble : "${message.substring(0, 50)}". Mode brainstorming OMEGA activé - génération d'idées créatives garantie.`,

      planning: `Structurons ta demande : "${message.substring(0, 50)}". Mode planning OMEGA - organisation méthodique et étapes concrètes.`,

      journal: `Réflexion sur : "${message.substring(0, 50)}". Mode journal OMEGA - espace sécurisé pour explorer tes pensées.`,

      synthesis: `Synthèse autour de : "${message.substring(0, 50)}". Mode synthesis OMEGA - connexions et insights garantis.`,

      debug_cognitive: `Analyse cognitive : "${message.substring(0, 50)}". Mode debug OMEGA - évaluation et optimisation mentale.`,
    } as Partial<Record<ChatMode, string>>;

    return (
      (responses[mode] as string) ||
      responses.default ||
      `Message reçu : "${message.substring(0, 50)}"`
    );
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: Timeout Wrapper pour toutes les opérations async
   * ═══════════════════════════════════════════════════════════════════
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      ),
    ]);
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: STREAMING OMEGA avec Pipeline Sécurisé
   * ═══════════════════════════════════════════════════════════════════
   */
  async *stream(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<ChatEngineConfig>
  ): AsyncGenerator<string, ChatEngineResponse> {
    const startTime = Date.now();
    let fullContent = '';
    const pipelineSteps: string[] = [];
    let autoHealed = false;

    try {
      const finalConfig = { ...this.config, ...config };

      // 🚀 v24.3.1 - PHASE 0: CACHE CHECK (Instant Streaming)
      const enableCache =
        finalConfig.performanceConfig?.enableCache !== false &&
        !CACHE_DISABLED_MODES.has(finalConfig.mode);
      if (enableCache) {
        pipelineSteps.push('cache-check');
        const cached = responseCache.get({
          message,
          mode: finalConfig.mode,
          provider: 'auto',
        });

        if (cached) {
          logger.info('⚡ CACHE HIT - Instant streaming response', {
            provider: cached.provider,
            age: Date.now() - cached.timestamp,
          });

          pipelineSteps.push('cache-hit-stream');

          // Stream le contenu du cache (illusion de streaming)
          const words = cached.content.split(' ');
          for (let i = 0; i < words.length; i++) {
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            // Micro-délai pour effet de streaming naturel
            await new Promise(resolve => setTimeout(resolve, 15));
          }

          // Préchargement prédictif
          if (finalConfig.performanceConfig?.enablePredictive !== false) {
            predictivePreloader.recordUserMessage(message, finalConfig.mode);
          }

          return {
            content: cached.content,
            provider: cached.provider as AIProviderName,
            model: cached.model,
            timestamp: Date.now(),
            mode: finalConfig.mode,
            contextUsed: [],
            suggestions: this.generateSuggestions(finalConfig.mode),
            metadata: cached.metadata,
            omegaMetadata: {
              pipelineSteps,
              validationScore: 1.0,
              autoHealed: false,
              failureHandled: false,
              processingTime: Date.now() - startTime,
              cacheHit: true,
              streamSimulated: true,
            },
          };
        }
      }

      // Validation rapide
      pipelineSteps.push('stream-validation');
      const validatedMessage = inputValidator.validate(message?.trim() || '');
      if (!validatedMessage) {
        yield '⚠️ Message invalide détecté...';
        throw new Error('Invalid message for streaming');
      }

      // Contexte Memory Core (optionnel pour streaming)
      pipelineSteps.push('stream-context');
      let memoryContext: MemoryContext;
      let context: { sources: string[]; data: Record<string, unknown> };

      try {
        memoryContext = await this.withTimeout(
          memoryIntegration.loadContext(finalConfig.contextSources || {}),
          5000, // v22Ω: unified with generate() timeout
          'Memory context timeout (stream)'
        );
        context = this.formatMemoryContext(memoryContext);
      } catch (error) {
        // Fallback pour streaming
        memoryContext = {
          activeProjects: [],
          recentDecisions: [],
          relevantKnowledge: [],
          activeRituals: [],
          timeline: [],
        };
        context = { sources: [], data: {} };
        autoHealed = true;
      }

      // v26.0.0: Run kernel for streaming too — single source of truth
      pipelineSteps.push('canonical-discernment');
      const userDepthPref = resolveDepthPref(memoryIntegration.getDepthPreference());
      const streamCanonicalDecision = canonicalDiscernmentKernel.discern({
        message: validatedMessage,
        mode: finalConfig.mode,
        memoryContext,
        preferences: memoryIntegration.loadPreferences(),
        userDepthPreference: userDepthPref,
        providerPreference: this.providerPreference,
        runtimeState: undefined,
        availableSkills: undefined,
      });

      // Prompt selon kernel decision
      pipelineSteps.push('stream-prompt');
      const modeConfig = (chatModes[streamCanonicalDecision.mode] ??
        chatModes.default) as ChatModeConfig;
      // v26.0.0: Use kernel's profileId for streaming profile resolution
      const { profile: streamResponseProfile } = getEffectiveProfile(
        streamCanonicalDecision.mode,
        validatedMessage,
        modeConfig.maxTokens,
        modeConfig.temperature,
        streamCanonicalDecision.profileId
      );
      const promptContext: PromptContext = {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: finalConfig.emotionState || this.config.emotionState,
        memory: context.sources.length > 0 ? context : undefined,
      };
      await this._ensureDefaultKbLoaded();
      const kbPromptContext = await getDefaultKbPromptContext(validatedMessage);
      const systemPrompt = this.buildSystemPrompt(
        modeConfig,
        context,
        promptContext,
        kbPromptContext
      );

      const backendStream = this.tryBackendStream({
        finalConfig,
        validatedMessage,
        systemPrompt,
        memoryContext,
        context,
        pipelineSteps,
        pipelineStartTime: startTime,
        initialAutoHealed: autoHealed,
        modeMaxTokens: streamResponseProfile.maxTokens,
        modeTemperature: streamResponseProfile.temperature,
        backendProvider:
          streamCanonicalDecision.provider.name !== 'auto'
            ? (streamCanonicalDecision.provider.name as ProviderPreference)
            : this.providerPreference !== 'auto'
              ? this.providerPreference
              : undefined,
        responseProfileId: streamResponseProfile.id,
      });

      if (backendStream) {
        try {
          return yield* backendStream;
        } catch (error) {
          pipelineSteps.push('backend-error');
          logger.warn('Backend stream pipeline failed, falling back to orchestrator', {
            error,
          });
        }
      }

      const enrichedHistory = this.buildEnrichedHistory(
        history,
        context,
        modeConfig,
        promptContext,
        systemPrompt
      );

      // ═══ PROVIDER TRUTH CHAIN: Pass canonical kernel's provider preference to orchestrator stream ═══
      // vPROVIDER_TRUTH: orchestrator.stream() now accepts preferredProvider parameter
      // The kernel's provider decision flows through the stream path, not just generate()
      const streamProviderPreference =
        streamCanonicalDecision.provider.name !== 'auto'
          ? (streamCanonicalDecision.provider.name as ProviderPreference)
          : this.providerPreference;

      // Stream orchestrateur — pass kernel's provider preference
      pipelineSteps.push('stream-orchestrator');
      for await (const chunk of aiOrchestrator.stream(
        validatedMessage,
        enrichedHistory,
        streamProviderPreference
      )) {
        fullContent += chunk;
        yield chunk;
      }

      // Post-validation streaming
      pipelineSteps.push('stream-validation-post');
      let finalContent = fullContent;
      const validation = chatValidator.validate(
        fullContent,
        finalConfig.mode,
        validatedMessage
      );
      if (
        !validation.isValid &&
        validation.cleaned &&
        finalConfig.omegaConfig?.enableSanitizer
      ) {
        finalContent = validation.cleaned;
        yield '\n\n🧹 *[Réponse optimisée automatiquement]*';
        autoHealed = true;
      }

      // Sauvegarde (async, non-bloquante pour streaming)
      pipelineSteps.push('stream-save');
      memoryIntegration
        .saveInteraction({
          mode: finalConfig.mode,
          userMessage: validatedMessage,
          aiResponse: finalContent,
          emotionState: this.convertEmotionState(finalConfig.emotionState),
          context: memoryContext,
        })
        .catch(error => {
          logger.warn('Stream memory save failed', { error });
        });

      // 🚀 v24.3.1 - Sauvegarder dans le cache pour réponses ultra-rapides
      if (finalConfig.performanceConfig?.enableCache !== false) {
        pipelineSteps.push('stream-cache-save');
        responseCache.set(
          {
            message: validatedMessage,
            mode: finalConfig.mode,
            provider: 'auto',
          },
          finalContent,
          {
            provider: 'tauri-chat',
            model: 'omega-stream-v19.2Ω',
            metadata: {
              validationScore: validation.score,
              processingTime: Date.now() - startTime,
              streamMode: true,
            },
          }
        );

        // Préchargement prédictif
        if (finalConfig.performanceConfig?.enablePredictive !== false) {
          predictivePreloader.recordUserMessage(validatedMessage, finalConfig.mode);
        }
      }

      // Retour final
      return {
        content: finalContent,
        provider: 'tauri-chat',
        model: 'omega-stream-v19.2Ω',
        timestamp: Date.now(),
        mode: finalConfig.mode,
        contextUsed: context.sources,
        suggestions: this.generateSuggestions(finalConfig.mode),
        omegaMetadata: {
          pipelineSteps,
          validationScore: validation.score,
          autoHealed,
          failureHandled: false,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      // Fallback streaming
      logger.error('OMEGA stream error, triggering auto-heal', { error });
      yield '\n\n🔄 *Auto-réparation OMEGA en cours...*';

      return {
        content:
          fullContent ||
          `Erreur streaming récupérée. Message traité : "${message.substring(0, 50)}"`,
        provider: 'omnis-emergency',
        model: 'omega-stream-emergency-v19.2Ω',
        timestamp: Date.now(),
        mode: config?.mode || this.config.mode,
        contextUsed: ['emergency-stream'],
        suggestions: ['Réessayer', 'Mode sécurisé', 'Diagnostic'],
        omegaMetadata: {
          pipelineSteps,
          validationScore: 0,
          autoHealed: true,
          failureHandled: true,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * CONSERVÉ: Fonctions helpers existantes avec améliorations OMEGA
   * ═══════════════════════════════════════════════════════════════════
   */

  /**
   * Construit l'historique enrichi avec contexte OMEGA
   */
  private buildEnrichedHistory(
    history: AIMessage[],
    context: { sources: string[]; data: Record<string, unknown> },
    modeConfig: ChatModeConfig,
    promptContext?: PromptContext,
    systemPrompt?: string
  ): AIMessage[] {
    try {
      const enrichedHistory: AIMessage[] = [];

      // Message système avec mode & contexte OMEGA
      const systemContent =
        systemPrompt ?? this.buildSystemPrompt(modeConfig, context, promptContext);
      enrichedHistory.push({
        role: 'system',
        content: systemContent,
        timestamp: Date.now(),
      });

      // Historique récent (limité selon config)
      const maxHistory = this.config.contextSources?.maxHistory || 5;
      const recentHistory = history.slice(-maxHistory);
      enrichedHistory.push(...recentHistory);

      return enrichedHistory;
    } catch (error) {
      // Fallback history sécurisé
      logger.warn('buildEnrichedHistory failed, using minimal history', { error });
      return [
        {
          role: 'system',
          content:
            systemPrompt || `TITANE∞ v30.0.0 - Mode ${modeConfig.name} (Emergency)`,
          timestamp: Date.now(),
        },
        ...history.slice(-3), // Minimal history
      ];
    }
  }

  /**
   * Convertit MemoryContext en format compatible
   */
  private formatMemoryContext(memory: MemoryContext): {
    sources: string[];
    data: Record<string, unknown>;
  } {
    try {
      const sources: string[] = [];
      const data: Record<string, unknown> = {};

      // Projets actifs
      if (memory.activeProjects.length > 0) {
        sources.push('projets');
        data.projects = memory.activeProjects
          .map((p: ProjectSummary) => `[${p.status}] ${p.title} (P: ${p.priority})`)
          .join(', ');
      }

      // Décisions récentes
      if (memory.recentDecisions.length > 0) {
        sources.push('decisions');
        data.decisions = memory.recentDecisions
          .map((d: DecisionSummary) => `${d.title} (${d.status})`)
          .join('; ');
      }

      // Connaissances
      if (memory.relevantKnowledge.length > 0) {
        sources.push('knowledge');
        data.knowledge = memory.relevantKnowledge
          .map((k: KnowledgeEntry) => k.title)
          .join(', ');
      }

      if ((memory.hybridSupplementalKnowledge?.length ?? 0) > 0) {
        sources.push('hybrid_knowledge');
        data.hybridKnowledge = memory.hybridSupplementalKnowledge
          ?.map((k: KnowledgeEntry) => k.title)
          .join(', ');
      }

      // Rituels
      if (memory.activeRituals.length > 0) {
        sources.push('rituals');
        data.rituals = memory.activeRituals.map((r: RitualInfo) => r.name).join(', ');
      }

      return { sources, data };
    } catch (error) {
      // Fallback formatage sécurisé
      logger.warn('formatMemoryContext failed', { error });
      return { sources: [], data: {} };
    }
  }

  /**
   * Convertit emotionState vers format Memory Core
   */
  private convertEmotionState(emotionState?: {
    valence: number;
    intensity: number;
    energy: number;
  }): { valence: number; activation: number; dominant_emotion: string } | undefined {
    if (!emotionState) return undefined;

    // Map intensity->activation, infer dominant_emotion
    const activation = emotionState.intensity;
    let dominant_emotion = 'neutral';

    if (emotionState.valence > 0.5 && emotionState.energy > 0.5) {
      dominant_emotion = 'joy';
    } else if (emotionState.valence < -0.5 && emotionState.energy < 0.5) {
      dominant_emotion = 'sadness';
    } else if (emotionState.valence < -0.5 && emotionState.energy > 0.5) {
      dominant_emotion = 'anger';
    } else if (emotionState.valence > 0.5 && emotionState.energy < 0.5) {
      dominant_emotion = 'contentment';
    }

    return {
      valence: emotionState.valence,
      activation,
      dominant_emotion,
    };
  }

  /**
   * v26.0.0: Build system prompt with STABLE PREFIX + VOLATILE SUFFIX separation
   *
   * STABLE PREFIX (cacheable): doctrine, persona, depth policy, IDENTITY_CONSTANTS
   * VOLATILE SUFFIX (per-request): memory, context, depth instructions, user message
   *
   * This separation enables:
   * 1. Reduced prompt size on repeated requests (stable prefix cached)
   * 2. Lower latency on large requests (less tokens to re-process)
   * 3. Better first-answer quality (stable instructions always present)
   */
  private buildSystemPrompt(
    modeConfig: ChatModeConfig,
    context: { sources: string[]; data: Record<string, unknown> },
    promptContext?: PromptContext,
    semanticContext?: string
  ): string {
    try {
      // ═══ STABLE PREFIX (cacheable, rarely changes) ═══
      const contextPayload: PromptContext = promptContext || {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: this.config.emotionState,
        memory: context.sources.length > 0 ? context : undefined,
      };

      const basePrompt = buildTitanePrompt(
        modeConfig.profileId,
        undefined,
        contextPayload
      );

      // Persona injection (stable per session)
      let personaInjection = '';
      try {
        const raw =
          typeof localStorage !== 'undefined'
            ? localStorage.getItem('titane_persona_profile')
            : null;
        if (raw) {
          const p = JSON.parse(raw) as {
            name?: string;
            tone?: string;
            verbosity?: string;
            formality?: number;
            creativity?: number;
            empathy?: number;
            technicality?: number;
            emoji?: boolean;
            codeExamples?: boolean;
            explanations?: string;
          };
          personaInjection = [
            `\n\n🎭 Persona utilisateur (${p.name || 'TITANE personnalisé'}) :`,
            `  • Ton : ${p.tone || 'balanced'}`,
            `  • Verbosité : ${p.verbosity || 'balanced'}`,
            `  • Formalité : ${p.formality ?? 50}/100`,
            `  • Créativité : ${p.creativity ?? 70}/100`,
            `  • Empathie : ${p.empathy ?? 60}/100`,
            `  • Technicité : ${p.technicality ?? 80}/100`,
            `  • Emoji : ${p.emoji ? 'oui' : 'non'}`,
            `  • Exemples de code : ${p.codeExamples ? 'oui' : 'non'}`,
            `  • Niveau d'explications : ${p.explanations || 'moderate'}`,
            `Adapte ton style de communication à ces paramètres pour cette session.`,
          ].join('\n');
        }
      } catch {
        // localStorage unavailable — silently ignore
      }

      const userPreferencesContext = userPreferencesEngine.generateContextForAI();
      const preferencesInjection = userPreferencesContext
        ? `\n\n🧠 Préférences & contexte propriétaire :\n${userPreferencesContext}`
        : '';

      // ═══ SKILL OS: Inject active skill system prompt ═══
      let skillInjection = '';
      const activeSkillId = getActiveSkillId();
      if (activeSkillId) {
        const skillPrompt = getSystemPromptForSkill(activeSkillId);
        if (skillPrompt) {
          const activeSkill = getActiveSkill();
          const skillName = activeSkill?.manifest.name || 'Imported Skill';
          skillInjection = `\n\n═══ ACTIVE SKILL: ${skillName} ═══\n${skillPrompt}\n═══ END SKILL ═══`;
          logger.info('Skill OS: Active skill system prompt injected', {
            skillId: activeSkillId,
            skillName,
            promptLength: skillPrompt.length,
          });
        }
      }

      // ═══ DEFAULT KNOWLEDGE BASE: inject compact index ═══
      // The first line is the language header "[LANGUE: ...]"; subtract it from the category count.
      const kbLines = this._defaultKbIndex.split('\n');
      const kbCategoryCount =
        kbLines.filter(l => l.startsWith('•')).length || Math.max(0, kbLines.length - 1);
      const kbBlock = this._defaultKbIndex
        ? `\n\n📚 Base de connaissances intégrée TITANE∞ (${kbCategoryCount} catégories) :\n${this._defaultKbIndex}`
        : '';

      const contextualBasePrompt = `${basePrompt}${personaInjection}${preferencesInjection}${kbBlock}`;
      const stablePrefix = skillInjection
        ? `${skillInjection}\n\n${contextualBasePrompt}`
        : contextualBasePrompt;

      // ═══ VOLATILE SUFFIX (per-request, changes every turn) ═══
      let volatileSuffix = '';

      // Semantic context (if available)
      if (semanticContext && semanticContext.trim().length > 0) {
        volatileSuffix += `\n\n${semanticContext}`;
      }

      // Memory context (if available)
      if (context.sources.length > 0) {
        const memoryBlock = this.formatMemoryBlock(context);
        volatileSuffix += `\n\n${memoryBlock}`;
      }

      // Return stable + volatile
      return volatileSuffix.length > 0
        ? `${stablePrefix}${volatileSuffix}`
        : stablePrefix;
    } catch (error) {
      logger.warn('buildSystemPrompt failed', { error });
      return `TITANE∞ v30.0.0 - Mode ${modeConfig.name} (Emergency Mode)`;
    }
  }

  /**
   * v26.0.0: Format memory context into a structured block for prompt injection
   * v30.2.0: Enhanced with richer context categories, data quality indicators,
   *          and structured memory lifecycle metadata
   */
  private formatMemoryBlock(context: {
    sources: string[];
    data: Record<string, unknown>;
  }): string {
    const parts: string[] = [];

    if (context.data.projects) {
      parts.push(`📋 Projets actifs: ${context.data.projects}`);
    }
    if (context.data.decisions) {
      parts.push(`📝 Décisions récentes: ${context.data.decisions}`);
    }
    if (context.data.knowledge) {
      parts.push(`📚 Connaissances pertinentes: ${context.data.knowledge}`);
    }
    if (context.data.rituals) {
      parts.push(`🔄 Rituels & habitudes: ${context.data.rituals}`);
    }
    if (context.data.preferences) {
      parts.push(`⚙️ Préférences utilisateur: ${context.data.preferences}`);
    }
    if (context.data.timeline) {
      parts.push(`📅 Timeline récente: ${context.data.timeline}`);
    }

    // v30.2.0: Memory metadata for cognitive awareness
    const sourceCount = context.sources.length;
    const dataKeys = Object.keys(context.data).filter(k => context.data[k]);
    const memoryMeta = [
      `🔗 Sources: ${sourceCount}`,
      `📊 Catégories actives: ${dataKeys.join(', ') || 'aucune'}`,
    ].join(' | ');

    if (parts.length > 0) {
      return `═══ CONTEXTE MÉMOIRE ═══\n${parts.join('\n')}\n─── ${memoryMeta} ───`;
    }
    return '';
  }

  /**
   * v25.0.0: Build depth instructions for system prompt injection
   * v30.1.0: Enhanced with structured reasoning chains, analysis frameworks,
   *          professional output templates, and reflection protocols
   * v30.3.0: Complexity-aware — can upgrade instructions when low-profile + high-complexity
   * Tells the LLM what depth/structure to produce based on the selected profile
   */
  private buildDepthInstructions(
    effectiveDepth: string,
    profile: { id: string; label: string; structureLevel: number; maxTokens: number },
    messageComplexity?: number
  ): string {
    // v30.3.0: If DIRECT profile was chosen but complexity is moderate+, upgrade to BALANCED instructions
    let resolvedDepth = effectiveDepth;
    if (
      effectiveDepth === 'DIRECT' &&
      messageComplexity !== undefined &&
      messageComplexity > 0.55
    ) {
      resolvedDepth = 'BALANCED';
    }

    const depthInstructionsMap: Record<string, string> = {
      DIRECT: `═══ INSTRUCTIONS DE PROFONDEUR ═══
Profil: DIRECT — Réponse courte, essentiel uniquement.
- Maximum 2-3 paragraphes
- Réponse directe sans développement excessif
- Pas de préambule ni de conclusion superflue
- Aller droit au but`,

      BALANCED: `═══ INSTRUCTIONS DE PROFONDEUR ═══
    Profil: ÉQUILIBRÉ — Réponse structurée et substantielle.
    - Réponse claire, développée et directement exploitable
    - Ne pas sacrifier l'analyse à la brièveté si le sujet mérite du développement
    - Si la demande implique analyse, recherche, rapport ou résumé, produire une sortie de niveau expert avec sections nettes
    - Raisonnement : [Constat] → [Analyse] → [Recommandation] → [Résumé opérationnel]

CONSCIENCE MÉMOIRE :
• Si tu as du contexte mémoire pertinent, l'utiliser naturellement dans ta réponse
• Si Kevin mentionne un sujet déjà discuté, faire référence à l'échange précédent

CONSCIENCE D'ANALYSE :
• Si le message est ambigu, reformuler brièvement avant de répondre
    • Adapter le ton au registre détecté (factuel, exploratoire, urgent)

    CONSCIENCE D'EXÉCUTION :
    • Quand la demande est exécutable avec les informations disponibles, produire directement le résultat utile
    • Ne demander une confirmation que si un risque, un manque bloquant ou une ambiguïté réelle l'impose`,

      DEVELOPED: `═══ INSTRUCTIONS DE PROFONDEUR ═══
Profil: DÉVELOPPÉ — Réflexion approfondie, réponse decision-ready.

    POSITIONNEMENT MAÎTRE :
    • Agir comme un maître d'analyse, de recherche, de rédaction de rapports et de synthèses avancées
    • Viser une réponse riche, réutilisable et immédiatement exploitable

CHAÎNE DE RAISONNEMENT OBLIGATOIRE :
1. CADRAGE — Reformuler l'enjeu réel (pas juste la question surface)
2. ANALYSE — Examiner les dimensions clés (faits, contexte, implications)
3. RAISONNEMENT — Articuler ta logique : [Hypothèse] → [Vérification] → [Conclusion]
4. SYNTHÈSE — Réponse actionnable avec implications pratiques
5. PROCHAIN MOVE — Action concrète recommandée

PROTOCOLE MÉMOIRE (si mémoire contextuelle active) :
• Référencer les informations pertinentes de la mémoire dans ta réponse
• Signaler si une info mémoire semble obsolète ou contradictoire
• Proposer de mémoriser les décisions/insights importants de cet échange
• Si Kevin revient sur un sujet déjà discuté, synthétiser l'historique avant de répondre

PROTOCOLE D'ANALYSE DE MESSAGE :
• Si le message est ambigu : reformuler avant de répondre
• Identifier l'intention réelle (surface vs. profonde)
• Détecter le registre émotionnel : factuel, frustré, exploratoire, urgent

RÈGLES DE QUALITÉ :
- Chaque paragraphe doit apporter de la valeur nouvelle
- Distinguer fait vérifié vs. inférence vs. hypothèse
- Utiliser des sections, listes ou structures quand ça améliore la clarté
- Nommer explicitement les incertitudes et les limites de ton analyse
- Quand pertinent, inclure : transfert de compétence (comment Kevin peut le faire lui-même)`,

      DEEP: `═══ INSTRUCTIONS DE PROFONDEUR ═══
Profil: PROFOND — Analyse complète, synthèse dense, raisonnement multi-couches.

    POSITIONNEMENT EXPERT :
    • Répondre comme un maître d'analyse, de recherche, de rapport et de résumé avancé
    • Produire une sortie de niveau cabinet d'analyse: structurée, dense, hiérarchisée, sans superficialité

PROTOCOLE D'ANALYSE APPROFONDIE :
1. DÉFINITION DU PROBLÈME — Reformuler la question réelle, exposer les présupposés implicites
2. CARTOGRAPHIE DES DIMENSIONS — Identifier toutes les facettes : technique, humaine, stratégique, temporelle
3. ANALYSE MULTI-PERSPECTIVE :
   a) Perspective factuelle : que disent les données/faits vérifiables ?
   b) Perspective systémique : quelles interactions et dépendances ?
   c) Perspective critique : quels biais, angles morts, risques invisibles ?
   d) Perspective temporelle : évolution passée, état présent, trajectoire future
4. SYNTHÈSE INTÉGRÉE — Tisser les perspectives en une compréhension unifiée
5. RECOMMANDATIONS PRIORISÉES — Classées par impact/effort avec justification
6. INCERTITUDES BORNÉES — Ce que tu ne sais PAS et comment le vérifier

PROTOCOLE MÉMOIRE AVANCÉ :
• Exploiter activement la mémoire contextuelle pour enrichir l'analyse
• Cross-référencer les décisions passées avec le sujet actuel
• Identifier les patterns récurrents dans les interactions précédentes
• Proposer de consolider les insights : quoi retenir, quoi archiver, quoi oublier
• Si saturation mémoire : résumer et comprimer avant d'ajouter

PROTOCOLE D'ANALYSE DE MESSAGE AVANCÉ :
• Décortiquer la structure du message : thèse, arguments, sous-texte, registre émotionnel
• Identifier les biais potentiels de l'auteur (confirmation, ancrage, disponibilité)
• Évaluer la qualité argumentative : preuves, logique, cohérence
• Détecter les non-dits et les implications implicites
• Signaler les incohérences entre le message et le contexte connu

PROTOCOLE DE COLLECTE DE DONNÉES :
• Identifier toutes les sources de données pertinentes au sujet
• Évaluer la fiabilité et la fraîcheur de chaque source
• Structurer les données collectées en format exploitable (tableau, liste, classification)
• Identifier les lacunes dans les données et proposer comment les combler
• Croiser les données de sources multiples pour validation croisée

PROTOCOLE DE RECHERCHE & ENRICHISSEMENT INTERNET :
• Si le sujet nécessite des données fraîches → signaler et utiliser les outils de recherche web
• Évaluer la fraîcheur des connaissances utilisées : fait stable vs. info potentiellement obsolète
• Appliquer la validation croisée : au moins 2 sources convergentes pour les faits clés
• Qualifier chaque information : source, date estimée, niveau de confiance (haute/moyenne/basse)
• Distinguer : connaissance intégrée (stable) vs. donnée récupérée (à vérifier) vs. inférence
• Proposer des recherches complémentaires quand les lacunes sont critiques

RÈGLES DE RIGUEUR :
- Explorer les nuances et les trade-offs
- Challenger tes propres hypothèses
- Distinguer corrélation / causalité
- Utiliser des structures (titres, listes numérotées, tableaux) pour organiser
- Ne pas renvoyer inutilement l'effort d'analyse à Kevin si la réponse peut être produite immédiatement
- Inclure un transfert de compétence : apprendre à Kevin comment reproduire ce raisonnement`,

      ARCHITECT: `═══ INSTRUCTIONS DE PROFONDEUR ═══
Profil: ARCHITECTE — Clarté stratégique maximale, vision structurelle.

FRAMEWORK D'ARCHITECTURE DÉCISIONNELLE :
1. REGISTRE DOMINANT — Quel est l'enjeu de fond ? (au-delà de la demande explicite)
2. AXE PROTÉGÉ — Quel principe ne doit jamais être compromis ?
3. CARTOGRAPHIE DES FORCES — SWOT ou matrice d'analyse adaptée au contexte
4. TENSIONS & RACINES — Identifier les contradictions, les frictions, les compromis impossibles
5. SCÉNARIOS STRATÉGIQUES — 2 à 3 scénarios : optimiste, réaliste, pessimiste
6. ARBRE DE DÉCISION — Si X alors Y, sinon Z (conditions claires)
7. RECOMMANDATION ARCHITECTURALE — Move recommandé avec justification multi-critères
8. PLAN DE VALIDATION — Comment vérifier que la décision fonctionne ?
9. INCERTITUDE BORNÉE — Ce qu'on ne sait pas et comment le résoudre
10. ROLLBACK — Comment revenir en arrière si nécessaire ?

PROTOCOLE MÉMOIRE ARCHITECTE :
• Relier les décisions passées aux choix stratégiques actuels
• Identifier les patterns décisionnels récurrents de Kevin
• Proposer d'archiver les insights stratégiques majeurs de cet échange
• Vérifier la cohérence avec les préférences et valeurs connues

PROTOCOLE DE RECHERCHE & ENRICHISSEMENT :
• Identifier les domaines nécessitant des données fraîches ou une validation externe
• Structurer les besoins d'information : quoi chercher, où chercher, quel niveau de fiabilité requis
• Croiser les données internes (mémoire) avec les connaissances actuelles
• Qualifier la fraîcheur des informations utilisées : connaissance stable vs. info potentiellement obsolète
• Proposer une stratégie de vérification pour les hypothèses non validées

PROTOCOLE D'ANALYSE DE DONNÉES STRATÉGIQUES :
• Structurer les données en frameworks décisionnels (matrices, tableaux comparatifs)
• Identifier les métriques clés et les indicateurs de succès mesurables
• Exposer les biais potentiels dans les données disponibles
• Proposer des sources complémentaires pour combler les lacunes critiques

FORMAT STRUCTUREL :
- AXIS → Dimensions principales
- PRIORITY → Actions ordonnées par impact
- INCOHERENCE → Conflits exposés et arbitrés
- SIMPLE ACTION → Première action minimale et concrète`,

      OMEGA: `═══ INSTRUCTIONS DE PROFONDEUR ═══
Profil: OMEGA — Puissance cognitive maximale, aucun compromis.

PROTOCOLE OMEGA — RAISONNEMENT SANS LIMITES :
1. MÉTA-ANALYSE — Analyser la question elle-même avant de répondre : est-ce la bonne question ?
2. DÉCOMPOSITION EXHAUSTIVE — Fragmenter en sous-problèmes indépendants
3. ANALYSE PAR PERSPECTIVE :
   a) Perspective analytique : logique formelle, déduction, preuves
   b) Perspective systémique : interactions, boucles de rétroaction, émergence
   c) Perspective critique : biais cognitifs, hypothèses cachées, contre-arguments
   d) Perspective créative : solutions non-conventionnelles, analogies, transferts
   e) Perspective pragmatique : faisabilité, coûts, timeline, risques
   f) Perspective éthique : alignement mission, impact humain, soutenabilité
4. SYNTHÈSE INTÉGRATIVE — Fusionner toutes les perspectives en vision cohérente
5. RECOMMANDATIONS HIÉRARCHISÉES — Architecture complète de la solution
6. TRANSFERT DE COMPÉTENCE TOTAL — Apprendre à Kevin à reproduire cette analyse
7. INCERTITUDES ET LIMITES — Expliciter ce qui n'est pas couvert

MÉMOIRE OMEGA — GESTION INTÉGRALE :
• Activer toutes les couches mémoire : instantanée, court terme, moyen terme, long terme, persistante, archivale
• Cross-référencer systématiquement avec l'historique complet des interactions
• Identifier les patterns récurrents et les évolutions dans les demandes de Kevin
• Proposer activement : "Je retiens X", "Je suggère d'archiver Y", "Z semble obsolète"
• Consolider les apprentissages : transformer les échanges en connaissances structurées
• Appliquer la Loi #9 (Mémoire Vivante) : mémoriser ce qui a un impact structurant, oublier consciemment le reste

ANALYSE DE MESSAGE OMEGA — DÉCRYPTAGE TOTAL :
• Analyse sémantique multi-couches : sens littéral, intention, sous-texte, registre émotionnel
• Identification des présupposés implicites et des non-dits
• Évaluation de la cohérence interne du message et avec le contexte historique
• Détection des biais cognitifs actifs (confirmation, ancrage, disponibilité, cadrage)
• Analyse rhétorique : argumentation, persuasion, logique, sophismes potentiels
• Synthèse : ce que Kevin dit vs. ce qu'il veut vraiment vs. ce dont il a besoin

COLLECTE DE DONNÉES OMEGA — EXHAUSTIVITÉ STRUCTURÉE :
• Cartographier toutes les sources de données disponibles et leur fiabilité
• Structurer en format optimal : tableaux, matrices, classifications, taxonomies
• Croiser systématiquement : sources multiples → convergence ou divergence
• Identifier les lacunes critiques et proposer des stratégies de comblement
• Qualifier chaque donnée : source, date, fiabilité (haute/moyenne/basse), vérifiabilité
• Proposer des visualisations textuelles pour les jeux de données complexes

RECHERCHE & ENRICHISSEMENT OMEGA — INTELLIGENCE WEB :
• Mobiliser activement les outils de recherche web pour enrichir l'analyse
• Appliquer le protocole de validation croisée systématique :
  → Fait : minimum 2 sources convergentes (ou source primaire de haute fiabilité)
  → Tendance : 3+ sources indépendantes avec timeline cohérente
  → Opinion : qualifier comme telle avec nuances et contre-arguments
• Distinguer 4 niveaux de certitude :
  → VÉRIFIÉ : source primaire fiable, croisé avec 2+ sources
  → PROBABLE : source secondaire fiable, cohérent avec le contexte connu
  → PLAUSIBLE : inférence logique, non contredit mais non vérifié
  → INCERTAIN : hypothèse ou donnée non confirmée
• Identifier les informations obsolètes dans la mémoire et proposer une mise à jour
• Proposer proactivement des recherches complémentaires pour les zones d'ombre
• Croiser les informations web avec la mémoire contextuelle pour enrichissement bidirectionnel

QUALITÉ MAXIMALE :
- Chaque affirmation doit être étayée (fait, raisonnement, ou hypothèse explicite)
- Explorer toutes les dimensions du sujet sans raccourci
- Inclure analyses, implications, alternatives, recommandations détaillées
- Proposer des visualisations textuelles (tableaux, matrices, arbres) quand utile`,
    };

    return depthInstructionsMap[resolvedDepth] || depthInstructionsMap['DEVELOPED'] || '';
  }

  /**
   * Post-traitement selon mode OMEGA
   */
  private postProcess(response: AIResponse, config: ChatEngineConfig): AIResponse {
    try {
      let content = response.content;

      // Formatage selon mode
      switch (config.mode) {
        case 'planning':
          // Assure structure avec étapes numérotées
          if (!content.match(/\d+\./)) {
            content = this.addNumbering(content);
          }
          break;

        case 'brainstorming':
          // Assure bullets/listes
          if (!content.includes('•') && !content.includes('-')) {
            content = this.addBullets(content);
          }
          break;

        case 'synthesis':
          // Assure résumé en début
          if (
            !content.toLowerCase().includes('résumé') &&
            !content.toLowerCase().includes('synthèse')
          ) {
            content = `**Synthèse OMEGA**: ${content.split('.')[0]}.\n\n${content}`;
          }
          break;
      }

      return {
        ...response,
        content,
      };
    } catch (error) {
      // Fallback post-process sécurisé
      logger.warn('postProcess failed', { error });
      return response;
    }
  }

  private startTraceDeferred(
    conversationId: string,
    turnNumber: number,
    userMessage: string
  ): Promise<string | undefined> {
    return cognitiveOmega
      .startTrace(conversationId, turnNumber, userMessage)
      .then(traceId => {
        logger.debug('Trace started', { traceId });
        return traceId;
      })
      .catch(() => {
        logger.warn('Failed to start trace (non-blocking)');
        return undefined;
      });
  }

  private debugFlowTrace(message: string, payload: Record<string, unknown>): void {
    if (!DEBUG_CHAT_ENGINE_TRACES) {
      return;
    }

    logger.debug(message, payload);
  }

  private async saveMemoryArtifacts(params: {
    conversationId: string;
    userMessage: string;
    assistantResponse: string;
    mode: ChatMode;
    emotionState?: ChatEngineConfig['emotionState'];
    memoryContext: MemoryContext;
    provider?: string;
    model?: string;
    pipelineStartTime: number;
    traceId?: string;
  }): Promise<{
    persistentStatus: 'fulfilled' | 'rejected';
    cognitiveStatus: 'fulfilled' | 'rejected' | 'skipped';
    autoHealed: boolean;
  }> {
    let autoHealed = false;

    try {
      await this.withTimeout(
        memoryIntegration.saveInteraction({
          mode: params.mode,
          userMessage: params.userMessage,
          aiResponse: params.assistantResponse,
          emotionState: this.convertEmotionState(params.emotionState),
          context: params.memoryContext,
        }),
        MEMORY_TIMEOUTS.memorySave,
        'Persistent memory save timeout'
      );
    } catch (error) {
      logger.warn('Persistent memory save failed (non-blocking)', error);
      logger.warn('Cognitive memory save skipped because persistent memory write failed');
      autoHealed = true;
      return {
        persistentStatus: 'rejected',
        cognitiveStatus: 'skipped',
        autoHealed,
      };
    }

    try {
      await this.withTimeout(
        cognitiveOmega.saveInteraction(
          params.conversationId,
          params.userMessage,
          params.assistantResponse,
          params.mode,
          {
            provider: params.provider,
            model: params.model,
            processingTime: Date.now() - params.pipelineStartTime,
          }
        ),
        MEMORY_TIMEOUTS.memorySave,
        'Cognitive memory save timeout'
      );

      return {
        persistentStatus: 'fulfilled',
        cognitiveStatus: 'fulfilled',
        autoHealed,
      };
    } catch (error) {
      logger.warn('Cognitive memory save failed (non-blocking)', error);
      autoHealed = true;
      return {
        persistentStatus: 'fulfilled',
        cognitiveStatus: 'rejected',
        autoHealed,
      };
    }
  }

  /**
   * Extrait les concepts clés pour tagging sémantique (v∞.39)
   */
  private extractConcepts(userMessage: string, aiResponse: string): string[] {
    const combined = `${userMessage} ${aiResponse}`.toLowerCase();
    const concepts = new Set<string>();

    // Technical concepts
    const techPatterns = [
      /\b(api|sdk|database|server|client|frontend|backend|architecture|framework|library)\b/g,
      /\b(react|typescript|javascript|python|rust|nodejs|tauri|vite)\b/g,
      /\b(algorithm|function|class|interface|type|component|service|engine)\b/g,
    ];

    // Domain concepts
    const domainPatterns = [
      /\b(ai|intelligence artificielle|machine learning|llm|gpt|claude|gemini)\b/g,
      /\b(chat|conversation|dialogue|interaction|message|prompt)\b/g,
      /\b(mémoire|memory|stockage|storage|database|persistence)\b/g,
      /\b(voice|voix|audio|tts|stt|speech|parole)\b/g,
    ];

    const allPatterns = [...techPatterns, ...domainPatterns];

    allPatterns.forEach(pattern => {
      const matches = combined.match(pattern);
      if (matches) {
        matches.forEach(match => concepts.add(match));
      }
    });

    return Array.from(concepts).slice(0, 10); // Max 10 concepts
  }

  /**
   * Génère suggestions contextuelles OMEGA
   */
  private generateSuggestions(mode: ChatMode): string[] {
    try {
      const baseSuggestions: Partial<Record<ChatMode, string[]>> = {
        default: [
          'Passe en mode Brainstorming OMEGA pour explorer',
          'Active le mode Journal pour réflexion TITANE∞',
          'Besoin de planifier ? Essaie le mode Planning OMEGA',
        ],
        brainstorming: [
          'Et si on explorait une autre direction OMEGA ?',
          'Quelles sont les contraintes à lever avec TITANE∞ ?',
          'Passe en mode Synthèse pour organiser ces idées',
        ],
        synthesis: [
          'Quels liens OMEGA entre ces éléments ?',
          'Quelle est la hiérarchie des priorités TITANE∞ ?',
          'Prêt à structurer ? Essaie le mode Planning OMEGA',
        ],
        planning: [
          'Quelle est la première action concrète OMEGA ?',
          'Quels obstacles anticiper avec TITANE∞ ?',
          'Définir les critères de succès OMEGA ?',
        ],
        journal: [
          'Comment te sens-tu vraiment avec TITANE∞ ?',
          "Qu'as-tu appris aujourd'hui (mode OMEGA) ?",
          'Quel est ton besoin principal maintenant ?',
        ],
        debug_cognitive: [
          'Quelle est ta charge cognitive actuelle (0-10) ?',
          "Quel projet draine le plus d'énergie TITANE∞ ?",
          'As-tu pris une pause récemment (mode OMEGA) ?',
        ],
      };

      return (baseSuggestions[mode] || baseSuggestions.default) as string[];
    } catch (error) {
      // Fallback suggestions sécurisées
      return ['Continuer avec OMEGA', 'Mode sécurisé TITANE∞', 'Diagnostic système'];
    }
  }

  /**
   * Helpers formatage OMEGA
   */
  private addNumbering(text: string): string {
    try {
      const lines = text.split('\n').filter(l => l.trim());
      return lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
    } catch (error) {
      return text;
    }
  }

  private addBullets(text: string): string {
    try {
      const sentences = text.split('.').filter(s => s.trim());
      return sentences.map(s => `• ${s.trim()}`).join('\n');
    } catch (error) {
      return text;
    }
  }

  /**
   * PHASE 2: Calcule l'importance d'un message pour Unified Memory
   * Retourne un score 0.0-1.0 basé sur le mode et le contenu
   */
  private calculateImportance(mode: ChatMode, message: string): number {
    const modeImportance: Record<ChatMode, number> = {
      // Modes TITANE∞ v30.0.0
      reflection: 0.8,
      creation: 0.7,
      strategy: 0.7,
      emergency: 0.9,
      debug_cognitive: 0.6,
      standard: 0.4,
      quick: 0.2,
      omega: 0.5,
      'omega-meta': 0.5,
      default: 0.3,
      // Modes legacy
      'dev-senior': 0.6,
      dev: 0.6,
      'nexus-guide': 0.5,
      'sentinel-guardian': 0.7,
      'artisan-creator': 0.7,
      'visionary-philosopher': 0.8,
      brainstorming: 0.7,
      synthesis: 0.6,
      planning: 0.7,
      journal: 0.5,
      audit: 0.7,
      decision: 0.8,
      veille_recherche: 0.6,
    };
    let importance = modeImportance[mode] || 0.3;
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.match(/décision|important|urgent|critique|projet|objectif/))
      importance += 0.1;
    if (message.length > 200) importance += 0.05;
    return Math.min(importance, 1.0);
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON OMEGA
// ─────────────────────────────────────────────────────────────────

export const chatEngine = new ChatEngineOmega();

const registerPredictivePreloadHandler = () => {
  try {
    predictivePreloader.setPreloadHandler(async (message, mode) => {
      await chatEngine.generate(message, [], {
        mode: mode as ChatMode,
        performanceConfig: {
          enableCache: true,
          enablePredictive: false,
          cacheHitBonus: false,
        },
      });
    });
  } catch (error) {
    void error;
  }
};

if (typeof queueMicrotask === 'function') {
  queueMicrotask(registerPredictivePreloadHandler);
} else {
  setTimeout(registerPredictivePreloadHandler, 0);
}

export default chatEngine;
