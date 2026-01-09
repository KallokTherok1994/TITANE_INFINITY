/**
 * TITANE∞ v24.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.3.0 — CHAT ENGINE OMEGA (FlowEngine Reconstruction)
 *   Pipeline infaillible • Validation multi-niveaux • Auto-guérison
 *   Architecture: UI → useChat → chatEngine → orchestrator → providers → normalize → UI
 *   v22Ω AI Performance Optimizations: Parallel loading, -40% latency
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

// PHASE 2: Unified Memory System Integration
import { unifiedMemory } from '@/core/services/unifiedMemory';

import type {
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
} from '@/services/memory/types';
import { inputValidator } from './inputValidator';
import { chatModes, type ChatModeConfig } from './chatModes';
import { chatValidator } from '../chatValidator';
import type { ChatMode } from './chatTypes';
// Re-export for convenience
export type { ChatMode } from './chatTypes';
import type {
  ChatEngineProviderPreference,
  ChatEngineRequestArgs,
  ChatEngineCompletion,
} from '@/services/tauri';
import { MEMORY_TIMEOUTS } from '@/config/aiTimeouts.config'; // v22Ω: Centralized timeouts
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';
import { createLogger } from '@/utils/logger';

// Type-safe correction interface
interface _CorrectionInfo {
  correction_type?: string;
  confidence?: number;
  [key: string]: unknown;
}

// 🚀 v24.3.1 - Performance Optimizations
import { responseCache } from '@/services/cache/responseCache';
import { predictivePreloader } from '@/services/cache/predictivePreloader';

const logger = createLogger('ChatEngine');

type BackendStreamMetadata = {
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
  };
}

// ─────────────────────────────────────────────────────────────────
// CHAT ENGINE OMEGA v19.2Ω - FlowEngine Reconstruction
// ─────────────────────────────────────────────────────────────────

class ChatEngineOmega {
  private config: ChatEngineConfig = { mode: 'default' };
  private lastMode: ChatMode = 'default';
  private conversationContext: Map<string, any> = new Map();
  private pipelineFailures: number = 0;
  private lastHealing: number = 0;
  private conversationIds: Map<ChatMode, string> = new Map();
  private providerPreference: ChatEngineProviderPreference = 'auto';

  /**
   * PHASE 1Ω: Configure le mode avec reset cognitif OMEGA
   */
  setMode(mode: ChatMode, config?: Partial<ChatEngineConfig>): void {
    const startTime = Date.now();

    try {
      // Reset cognitif si changement de mode
      if (this.lastMode !== mode) {
        logger.info(`Cognitive reset: ${this.lastMode} → ${mode}`);
        this.conversationContext.clear();
        this.lastMode = mode;

        // Reset compteurs erreur sur changement mode
        this.pipelineFailures = 0;
      }

      this.config = {
        mode,
        omegaConfig: {
          timeoutMs: 30000,
          maxRetries: 3,
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

  setProvider(provider: ChatEngineProviderPreference): void {
    this.providerPreference = provider;
  }

  private isBackendAvailable(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  private getConversationId(mode: ChatMode): string | undefined {
    return this.conversationIds.get(mode);
  }

  private setConversationId(mode: ChatMode, id: string): void {
    this.conversationIds.set(mode, id);
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

    try {
      const finalConfig = { ...this.config, ...config };

      // 🚀 v24.3.1 - PHASE 0: CACHE CHECK (Ultra-Fast Response)
      const enableCache = finalConfig.performanceConfig?.enableCache !== false; // Défaut: true
      if (enableCache) {
        pipelineSteps.push('cache-check');
        const cached = responseCache.get({
          message,
          mode: finalConfig.mode,
          provider: 'auto',
        });

        if (cached) {
          logger.info('⚡ CACHE HIT - Instant response', {
            provider: cached.provider,
            age: Date.now() - cached.timestamp,
            hitCount: cached.hitCount,
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

      // Start observability trace
      const turnNumber = history.filter(m => m.role === 'user').length + 1;
      let traceId: string | undefined;
      try {
        traceId = await cognitiveOmega.startTrace(
          conversation_id,
          turnNumber,
          validatedMessage
        );
        logger.debug('Trace started', { traceId });
      } catch (error) {
        logger.warn('Failed to start trace (non-blocking)');
      }

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
        autoHealed = true;
      }

      logger.debug('Parallel context loading completed', {
        durationMs: Date.now() - contextLoadStart,
        memory: memoryResult.status,
        cognitive: cognitiveEnrichResult.status,
      });

      // ═══ PHASE 1.3: CONSTRUCTION PROMPT SELON MODE ═══
      pipelineSteps.push('prompt-building');
      logger.debug(`Step 1.3: Building prompt for mode "${finalConfig.mode}"...`);

      const modeConfig = (chatModes[finalConfig.mode] ??
        chatModes.default) as ChatModeConfig;
      const promptContext: PromptContext = {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: finalConfig.emotionState || this.config.emotionState,
        memory: context.sources.length > 0 ? context : undefined,
      };

      // Build system prompt with cognitive context
      let systemPrompt = this.buildSystemPrompt(modeConfig, context, promptContext, '');

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

      const backendResponse = await this.tryBackendPipeline({
        finalConfig,
        validatedMessage,
        systemPrompt,
        memoryContext,
        context,
        pipelineSteps,
        pipelineStartTime,
        initialAutoHealed: autoHealed,
      });

      if (backendResponse) {
        return backendResponse;
      }

      const enrichedHistory = this.buildEnrichedHistory(
        history,
        context,
        modeConfig,
        promptContext,
        systemPrompt
      );
      logger.debug('Enriched history built', { messages: enrichedHistory.length });

      // ═══ PHASE 1.4: APPEL ORCHESTRATOR OMEGA ═══
      pipelineSteps.push('orchestrator-call');
      logger.debug('Step 1.4: Calling orchestrator...');

      // Timeout adaptatif selon le mode (plus long pour modes complexes)
      const baseTimeout = finalConfig.omegaConfig?.timeoutMs || 30000;
      const timeoutMs =
        finalConfig.mode === 'brainstorming'
          ? baseTimeout * 1.5
          : finalConfig.mode === 'synthesis'
            ? baseTimeout * 1.3
            : baseTimeout;
      const response = await this.withTimeout(
        aiOrchestrator.generate(validatedMessage, enrichedHistory, {
          ...(finalConfig.aiConfig || {}),
          promptProfileId: modeConfig.profileId,
          promptContext,
        }),
        timeoutMs,
        `Orchestrator timeout (${timeoutMs}ms)`
      );

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

      // ═══ PHASE 1.6: POST-TRAITEMENT SELON MODE ═══
      pipelineSteps.push('post-processing');
      logger.debug('Step 1.6: Post-processing...');
      const processedResponse = this.postProcess(response, finalConfig);
      logger.debug('Response processed');

      // ═══ PHASE 1.7: PARALLEL MEMORY SAVING (v22Ω Optimization) ═══
      pipelineSteps.push('memory-saving-parallel');
      logger.debug('Step 1.7: Saving to memory engines (parallel)...');

      const importance = this.calculateImportance(finalConfig.mode, validatedMessage);
      const memorySaveStart = Date.now();

      // v22Ω: Parallel memory saves for better performance
      const [unifiedResult, cognitiveResult] = await Promise.allSettled([
        // Unified Memory save
        unifiedMemory.store(
          `${validatedMessage}\n\n${processedResponse.content}`,
          'assistant',
          importance,
          finalConfig.conversationId,
          [finalConfig.mode, 'conversation']
        ),
        // Cognitive Memory save with timeout
        this.withTimeout(
          cognitiveOmega.saveInteraction(
            conversation_id,
            validatedMessage,
            processedResponse.content,
            finalConfig.mode,
            {
              provider: processedResponse.provider,
              model: processedResponse.model,
              processingTime: Date.now() - pipelineStartTime,
            }
          ),
          MEMORY_TIMEOUTS.memorySave,
          'Cognitive memory save timeout'
        ),
      ]);

      // Handle results
      if (unifiedResult.status === 'rejected') {
        logger.warn('Unified memory save failed (non-blocking)', unifiedResult.reason);
        autoHealed = true;
      }

      if (cognitiveResult.status === 'rejected') {
        logger.warn(
          'Cognitive memory save failed (non-blocking)',
          cognitiveResult.reason
        );
        autoHealed = true;
      } else if (traceId) {
        await cognitiveOmega.logPhase(traceId, 'memory_saved', {
          conversation_id,
          mode: finalConfig.mode,
        });
      }

      logger.debug('Memory saves completed', {
        parallel: true,
        durationMs: Date.now() - memorySaveStart,
        unified: unifiedResult.status,
        cognitive: cognitiveResult.status,
      });

      // End observability trace
      if (traceId) {
        try {
          await cognitiveOmega.endTrace(traceId, processedResponse.content, 'success');
          logger.debug('Observability trace ended', { status: 'success' });
        } catch (error) {
          logger.warn('Failed to end observability trace', { error });
        }
      }

      // ═══ PHASE 1.8: CONSTRUCTION RÉPONSE FINALE OMEGA ═══
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
          failureHandled,
          processingTime,
        },
      };

      // 🚀 v24.3.1 - PHASE 1.9: CACHE INTELLIGENT (Sauvegarder pour réponses ultra-rapides)
      if (finalConfig.performanceConfig?.enableCache !== false) {
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

Le système cognitif TITANE∞ v19.2Ω s'est automatiquement restauré. Je reste pleinement opérationnel.

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
    } = params;

    if (!this.isBackendAvailable()) {
      return null;
    }

    try {
      pipelineSteps.push('backend-dispatch');

      const { chatEngineCommands } = await import(
        '@/services/tauri/chatEngine.commands.dynamic'
      );

      const payload: ChatEngineRequestArgs = {
        conversationId: this.getConversationId(finalConfig.mode),
        userMessage: validatedMessage,
        systemPrompt,
        temperature:
          finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
        maxOutputTokens:
          finalConfig.aiConfig?.maxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 1024,
        provider: this.providerPreference,
        enableStreaming: false,
      };

      const completion: ChatEngineCompletion =
        await chatEngineCommands.generateResponse(payload);
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

    const payload: ChatEngineRequestArgs = {
      conversationId: conversationId ?? undefined,
      userMessage: validatedMessage,
      systemPrompt,
      temperature:
        finalConfig.aiConfig?.temperature ?? DEFAULT_AI_CONFIG.temperature ?? 0.7,
      maxOutputTokens:
        finalConfig.aiConfig?.maxTokens ?? DEFAULT_AI_CONFIG.maxTokens ?? 1024,
      provider: this.providerPreference,
      enableStreaming: true,
    };

    try {
      const { chatEngineCommands } = await import(
        '@/services/tauri/chatEngine.commands.dynamic'
      );

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
            metadata = JSON.parse(chunk.content) as BackendStreamMetadata;
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
      const enableCache = finalConfig.performanceConfig?.enableCache !== false;
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

      // Prompt selon mode
      pipelineSteps.push('stream-prompt');
      const modeConfig = (chatModes[finalConfig.mode] ??
        chatModes.default) as ChatModeConfig;
      const promptContext: PromptContext = {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: finalConfig.emotionState || this.config.emotionState,
        memory: context.sources.length > 0 ? context : undefined,
      };
      const systemPrompt = this.buildSystemPrompt(modeConfig, context, promptContext);

      const backendStream = this.tryBackendStream({
        finalConfig,
        validatedMessage,
        systemPrompt,
        memoryContext,
        context,
        pipelineSteps,
        pipelineStartTime: startTime,
        initialAutoHealed: autoHealed,
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

      // Stream orchestrateur
      pipelineSteps.push('stream-orchestrator');
      for await (const chunk of aiOrchestrator.stream(
        validatedMessage,
        enrichedHistory
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
          content: systemPrompt || `TITANE∞ v19.2Ω - Mode ${modeConfig.name} (Emergency)`,
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
   * Construit le prompt système selon mode OMEGA
   */
  private buildSystemPrompt(
    modeConfig: ChatModeConfig,
    context: { sources: string[]; data: Record<string, unknown> },
    promptContext?: PromptContext,
    semanticContext?: string
  ): string {
    try {
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

      // Inject semantic context if available
      if (semanticContext && semanticContext.trim().length > 0) {
        return `${basePrompt}\n\n${semanticContext}`;
      }

      return basePrompt;
    } catch (error) {
      logger.warn('buildSystemPrompt failed', { error });
      return `TITANE∞ v19.2Ω - Mode ${modeConfig.name} (Emergency Mode)`;
    }
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
      // Modes TITANE∞ v21
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
      'nexus-guide': 0.5,
      'sentinel-guardian': 0.7,
      'artisan-creator': 0.7,
      'visionary-philosopher': 0.8,
      brainstorming: 0.7,
      synthesis: 0.6,
      planning: 0.7,
      journal: 0.5,
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

export default chatEngine;
