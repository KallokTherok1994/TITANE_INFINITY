/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — CHAT ENGINE OMEGA (FlowEngine Reconstruction)
 *   PHASE 1Ω: Pipeline infaillible • Validation multi-niveaux • Auto-guérison
 *   Architecture: UI → useChat → chatEngine → orchestrator → providers → normalize → UI
 * ═══════════════════════════════════════════════════════════════════
 */

import { DEFAULT_AI_CONFIG } from './types';
import type { AIMessage, AIResponse, AIConfig, AIProviderName } from './types';
import { buildSystemPrompt as buildTitanePrompt } from '@/core/prompts';
import type { PromptContext } from '@/core/prompts';
import { aiOrchestrator } from './orchestrator';
import { memoryIntegration } from './memoryIntegration';
import type { MemoryContext } from './memoryIntegration';
import type { ProjectSummary, DecisionSummary, KnowledgeEntry, RitualInfo } from '@/services/memory/types';
import { inputValidator } from './inputValidator';
import { chatModes, type ChatModeConfig } from './chatModes';
import { chatValidator } from '../chatValidator';
import { chatEngineCommands } from '@services/tauri';
import type { ChatMode } from './chatTypes';
// Re-export for convenience
export type { ChatMode } from './chatTypes';
import type {
  ChatEngineProviderPreference,
  ChatEngineRequestArgs,
  ChatEngineCompletion,
} from '@services/tauri';
import { semanticMemoryEngine } from '@/services/memory/semanticMemoryEngine';
import { consistencyEngine } from '@/services/consistency/consistencyEngine';
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';

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

const isDev = import.meta.env.DEV;

// ─────────────────────────────────────────────────────────────────
// TYPES OMEGA ÉTENDUS + SURVEILLANCE
// ─────────────────────────────────────────────────────────────────

export interface ChatEngineConfig {
  mode: ChatMode;
  emotionState?: {
    valence: number;    // -1.0 (négatif) → 1.0 (positif)
    intensity: number;  // 0.0 (calme) → 1.0 (intense)
    energy: number;     // 0.0 (épuisé) → 1.0 (énergisé)
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
        isDev && console.log(`🔄 OMEGA RESET COGNITIF: ${this.lastMode} → ${mode}`);
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
          ...config?.omegaConfig
        },
        ...config,
      };

      isDev && console.log(`⚙️ OMEGA Mode configuré: ${mode} (${Date.now() - startTime}ms)`);

    } catch (error) {
      // Fallback configuration sécurisée
      isDev && console.error('[OMEGA ENGINE] Erreur setMode (récupérée):', error);
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
      isDev && console.log('\n╔══════════════════════════════════════════════════════════════╗');
      isDev && console.log('║  🟣 CHAT ENGINE OMEGA v19.2Ω: Pipeline Starting            ║');
      isDev && console.log('╚══════════════════════════════════════════════════════════════╝');

      const finalConfig = { ...this.config, ...config };
      isDev && console.log(`🎯 Mode: ${finalConfig.mode} | AutoHeal: ${finalConfig.omegaConfig?.enableAutoHeal}`);

      // ═══ PHASE 1.1: VALIDATION ENTRÉE SÉCURISÉE ═══
      pipelineSteps.push("input-validation");
      isDev && console.log('🔒 Step 1.1: OMEGA Input Validation...');

      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message input');
      }

      const validatedMessage = inputValidator.validate(message.trim());
      if (!validatedMessage) {
        throw new Error('Message validation failed');
      }

      isDev && console.log(`   ✅ Validated (${validatedMessage.length} chars)`);

      // Generate or retrieve conversation ID
      const conversation_id = this.getConversationId(finalConfig.mode) || 
                              `conv_${finalConfig.mode}_${Date.now()}`;
      this.setConversationId(finalConfig.mode, conversation_id);

      // Start observability trace
      const turnNumber = history.filter(m => m.role === 'user').length + 1;
      let traceId: string | undefined;
      try {
        traceId = await cognitiveOmega.startTrace(conversation_id, turnNumber, validatedMessage);
        isDev && console.log(`   🔍 Trace started: ${traceId}`);
      } catch (error) {
        isDev && console.warn('   ⚠️ Failed to start trace (non-blocking)');
      }

      // ═══ PHASE 1.2: CONTEXTE MEMORY CORE SÉCURISÉ ═══
      pipelineSteps.push("context-loading");
      isDev && console.log('🧠 Step 1.2: Loading Memory Core context...');

      let memoryContext: MemoryContext;
      let context: { sources: string[]; data: Record<string, unknown> };

      try {
        memoryContext = await this.withTimeout(
          memoryIntegration.loadContext(finalConfig.contextSources || {}),
          3000, // 3s timeout optimisé
          'Memory context timeout'
        );
        context = this.formatMemoryContext(memoryContext);
        isDev && console.log(`   ✅ Context loaded (${context.sources.length} sources)`);
      } catch (error) {
        // Fallback contexte vide
        isDev && console.warn('   ⚠️ Memory context failed, using empty context');
        memoryContext = {
          activeProjects: [],
          recentDecisions: [],
          relevantKnowledge: [],
          activeRituals: [],
          timeline: []
        };
        context = { sources: [], data: {} };
        autoHealed = true;
      }

      // ═══ PHASE 1.3: CONSTRUCTION PROMPT SELON MODE ═══
      pipelineSteps.push("prompt-building");
      isDev && console.log(`🎨 Step 1.3: Building OMEGA prompt for mode "${finalConfig.mode}"...`);

      // ═══ PHASE 1.3.2: COGNITIVE CONTEXT ENRICHMENT (v∞.42) ═══
      pipelineSteps.push("cognitive-context-enrichment");
      isDev && console.log('🧠 Step 1.3.2: Enriching context with cognitive engines v∞.42...');

      let cognitiveContext = '';
      try {
        const enrichment = await this.withTimeout(
          cognitiveOmega.enrichContext(
            validatedMessage,
            conversation_id,
            finalConfig.mode
          ),
          3000,
          'Cognitive context enrichment timeout'
        );

        cognitiveContext = enrichment.combined;

        if (traceId) {
          await cognitiveOmega.logPhase(traceId, 'context_built', {
            memory_count: enrichment.metadata?.memoryCount,
            goal_count: enrichment.metadata?.goalCount,
            fact_count: enrichment.metadata?.factCount,
            context_length: cognitiveContext.length
          });
        }

        isDev && console.log(`   ✅ Cognitive context enriched (${enrichment.metadata?.memoryCount} memories, ${enrichment.metadata?.goalCount} goals, ${enrichment.metadata?.factCount} facts)`);
      } catch (error) {
        isDev && console.warn('   ⚠️ Cognitive context enrichment failed, continuing without');
        autoHealed = true;
      }

      const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
      const promptContext: PromptContext = {
        modeName: modeConfig.name,
        modeIcon: modeConfig.icon,
        emotionState: finalConfig.emotionState || this.config.emotionState,
        memory: context.sources.length > 0 ? context : undefined,
      };

      // Build system prompt with cognitive context
      let systemPrompt = this.buildSystemPrompt(modeConfig, context, promptContext, '');

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
      isDev && console.log(`   ✅ Enriched history built (${enrichedHistory.length} messages)`);

      // ═══ PHASE 1.4: APPEL ORCHESTRATOR OMEGA ═══
      pipelineSteps.push("orchestrator-call");
      isDev && console.log('🚀 Step 1.4: Calling OMEGA orchestrator...');

      // Timeout adaptatif selon le mode (plus long pour modes complexes)
      const baseTimeout = finalConfig.omegaConfig?.timeoutMs || 30000;
      const timeoutMs = finalConfig.mode === 'brainstorming' ? baseTimeout * 1.5
                      : finalConfig.mode === 'synthesis' ? baseTimeout * 1.3
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

      isDev && console.log('   ✅ Orchestrator response received');

      // ═══ PHASE 1.5: VALIDATION NEXUS & SENTINEL ═══
      pipelineSteps.push("nexus-sentinel-validation");
      isDev && console.log('🛡️  Step 1.5: Validating response with Nexus/Sentinel...');

      const validation = chatValidator.validate(response.content, finalConfig.mode, validatedMessage);
      isDev && console.log(`   ✅ Validation score: ${(validation.score * 100).toFixed(0)}% (coherence: ${(validation.coherenceScore * 100).toFixed(0)}%, anomaly: ${(validation.anomalyScore * 100).toFixed(0)}%)`);

      if (validation.issues.length > 0) {
        isDev && console.log(`   ⚠️ Issues detected: ${validation.issues.length}`);
        validation.issues.forEach(issue => {
          isDev && console.log(`      - [${issue.severity}] ${issue.type}: ${issue.message}`);
        });
      }

      // Si validation échoue, utiliser réponse nettoyée ou auto-heal
      if (!validation.isValid) {
        if (validation.cleaned && finalConfig.omegaConfig?.enableSanitizer) {
          isDev && console.log('   🧹 Using sanitized response');
          response.content = validation.cleaned;
          autoHealed = true;
        } else if (finalConfig.omegaConfig?.enableAutoHeal) {
          isDev && console.log('   🔄 Auto-healing invalid response');
          response.content = this.generateEmergencyResponse(validatedMessage, finalConfig.mode);
          autoHealed = true;
        }
      }

      // ═══ PHASE 1.5.1: CONSISTENCY CHECK (v∞.42) ═══
      pipelineSteps.push("consistency-check");
      isDev && console.log('🔍 Step 1.5.1: Checking consistency with cognitive engine v∞.42...');

      try {
        const consistencyResult = await this.withTimeout(
          cognitiveOmega.checkConsistency(
            conversation_id,
            response.content,
            {
              userMessage: validatedMessage,
              mode: finalConfig.mode
            }
          ),
          2000,
          'Consistency check timeout'
        );

        if (traceId) {
          await cognitiveOmega.logPhase(traceId, 'consistency_check', {
            is_consistent: consistencyResult.isConsistent,
            violations_count: consistencyResult.violations.length,
            consistency_score: consistencyResult.consistencyScore,
            should_correct: consistencyResult.shouldCorrect
          });
        }

        if (!consistencyResult.isConsistent) {
          isDev && console.log(`   ⚠️ ${consistencyResult.violations.length} consistency violations detected`);
          
          consistencyResult.violations.forEach((v, idx) => {
            isDev && console.log(`      ${idx + 1}. [${v.severity}] ${v.type}: ${v.description}`);
          });

          // Auto-correct if high/critical violations
          if (consistencyResult.shouldCorrect && finalConfig.omegaConfig?.enableAutoHeal) {
            isDev && console.log('   🔄 Applying auto-correction...');
            
            const correctionResult = await cognitiveOmega.autoCorrect(
              conversation_id,
              response.content,
              consistencyResult.violations
            );

            if (correctionResult.corrected) {
              response.content = correctionResult.correctedResponse;
              autoHealed = true;
              
              if (traceId) {
                await cognitiveOmega.logPhase(traceId, 'auto_correction', {
                  applied: true,
                  correction_type: (correctionResult.correction as any)?.correction_type,
                  confidence: (correctionResult.correction as any)?.confidence
                });
              }
              
              isDev && console.log('   ✅ Response auto-corrected for consistency');
            }
          }
        } else {
          isDev && console.log(`   ✅ Response consistent (score: ${(consistencyResult.consistencyScore * 100).toFixed(0)}%)`);
        }
      } catch (error) {
        isDev && console.warn('   ⚠️ Consistency check failed (non-blocking):', error);
        autoHealed = true;
      }

      // ═══ PHASE 1.6: POST-TRAITEMENT SELON MODE ═══
      pipelineSteps.push("post-processing");
      isDev && console.log('⚙️ Step 1.6: Post-processing...');
      const processedResponse = this.postProcess(response, finalConfig);
      isDev && console.log('   ✅ Response processed');

      // ═══ PHASE 1.7: SAUVEGARDE MEMORY CORE ═══
      pipelineSteps.push("memory-saving");
      isDev && console.log('💾 Step 1.7: Saving to Memory Core...');

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
        isDev && console.log('   ✅ Interaction saved to core memory');
      } catch (error) {
        isDev && console.warn('   ⚠️ Memory save failed (continuing)');
        autoHealed = true;
      }

      // ═══ PHASE 1.7: COGNITIVE MEMORY SAVING (v∞.42) ═══
      pipelineSteps.push("cognitive-memory-saving");
      isDev && console.log('💾 Step 1.7: Saving to cognitive engines v∞.42...');

      try {
        await this.withTimeout(
          cognitiveOmega.saveInteraction(
            conversation_id,
            validatedMessage,
            processedResponse.content,
            finalConfig.mode,
            {
              provider: processedResponse.provider,
              model: processedResponse.model,
              processingTime: Date.now() - pipelineStartTime
            }
          ),
          4000,
          'Cognitive memory save timeout'
        );

        if (traceId) {
          await cognitiveOmega.logPhase(traceId, 'memory_saved', {
            conversation_id,
            mode: finalConfig.mode
          });
        }

        isDev && console.log('   ✅ Interaction saved to cognitive engines (memory + goals + facts + evaluation)');
      } catch (error) {
        isDev && console.warn('   ⚠️ Cognitive memory save failed (continuing):', error);
        autoHealed = true;
      }

      // End observability trace
      if (traceId) {
        try {
          await cognitiveOmega.endTrace(traceId, processedResponse.content, 'success');
          isDev && console.log('   🔍 Trace ended successfully');
        } catch (error) {
          isDev && console.warn('   ⚠️ Failed to end trace:', error);
        }
      }

      // ═══ PHASE 1.8: CONSTRUCTION RÉPONSE FINALE OMEGA ═══
      pipelineSteps.push("response-building");
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
          processingTime
        }
      };

      // Reset compteur failures si succès
      this.pipelineFailures = 0;

      isDev && console.log('\n╔══════════════════════════════════════════════════════════════╗');
      isDev && console.log(`║  🟣 CHAT ENGINE OMEGA: Pipeline complete! (${processingTime}ms)     ║`);
      isDev && console.log('╚══════════════════════════════════════════════════════════════╝\n');

      return finalResponse;

    } catch (error) {
      // ═══ AUTO-HEAL PIPELINE OMEGA - RÉCUPÉRATION TOTALE ═══
      return this.handlePipelineFailure(error, message, history, config, pipelineSteps, pipelineStartTime);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════
   * PHASE 1Ω: AUTO-HEAL ENGINE - Récupération pipeline échoué
   * ═══════════════════════════════════════════════════════════════════
   */
  private handlePipelineFailure(
    error: any,
    message: string,
    history: AIMessage[],
    config: Partial<ChatEngineConfig> | undefined,
    pipelineSteps: string[],
    pipelineStartTime: number
  ): ChatEngineResponse {
    this.pipelineFailures++;
    this.lastHealing = Date.now();

    isDev && console.error(`🆘 OMEGA PIPELINE FAILURE #${this.pipelineFailures}:`, error);
    isDev && console.log(`   Steps completed: ${pipelineSteps.join(' → ')}`);

    // Emergency response selon niveau de failure
    let emergencyContent: string;
    let emergencyMode = "omega-emergency";

    if (this.pipelineFailures <= 2) {
      emergencyContent = `🔄 **Auto-réparation OMEGA engagée** (Incident #${this.pipelineFailures})

Le système cognitif TITANE∞ v19.2Ω s'est automatiquement restauré. Je reste pleinement opérationnel.

**Ta question** : "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

Je peux continuer notre conversation normalement. Le pipeline OMEGA garantit une récupération totale.`;
    } else {
      emergencyMode = "omega-survival";
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
        'Redémarrer en mode sécurisé'
      ],
      omegaMetadata: {
        pipelineSteps,
        validationScore: 0,
        autoHealed: true,
        failureHandled: true,
        processingTime
      },
      metadata: {
        emergency: true,
        auto_heal: true,
        failure_count: this.pipelineFailures,
        error_type: error?.toString()?.substring(0, 100) || 'unknown',
        mode: emergencyMode,
        omega_version: "v19.2Ω"
      }
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

      const payload: ChatEngineRequestArgs = {
        conversationId: this.getConversationId(finalConfig.mode),
        userMessage: validatedMessage,
        systemPrompt,
        temperature:
          finalConfig.aiConfig?.temperature ??
          DEFAULT_AI_CONFIG.temperature ??
          0.7,
        maxOutputTokens:
          finalConfig.aiConfig?.maxTokens ??
          DEFAULT_AI_CONFIG.maxTokens ??
          1024,
        provider: this.providerPreference,
        enableStreaming: false,
      };

      const completion: ChatEngineCompletion = await chatEngineCommands.generateResponse(payload);
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
      const validation = chatValidator.validate(response.content, finalConfig.mode, validatedMessage);
      isDev && console.log(`   ✅ Backend validation score: ${(validation.score * 100).toFixed(0)}%`);

      if (validation.issues.length > 0) {
        validation.issues.forEach(issue => {
          isDev && console.log(`      - [${issue.severity}] ${issue.type}: ${issue.message}`);
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
        isDev && console.warn('   ⚠️ Memory save failed (continuing)');
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

      if (isDev) {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log(`║  🟣 CHAT ENGINE OMEGA: Backend pipeline complete! (${processingTime}ms) ║`);
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
      }

      this.pipelineFailures = 0;
      return finalResponse;
    } catch (error) {
      pipelineSteps.push('backend-error');
      isDev && console.warn('[OMEGA ENGINE] Backend pipeline failed, falling back to orchestrator:', error);
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
        finalConfig.aiConfig?.temperature ??
        DEFAULT_AI_CONFIG.temperature ??
        0.7,
      maxOutputTokens:
        finalConfig.aiConfig?.maxTokens ??
        DEFAULT_AI_CONFIG.maxTokens ??
        1024,
      provider: this.providerPreference,
      enableStreaming: true,
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
            metadata = JSON.parse(chunk.content) as BackendStreamMetadata;
          } catch (parseError) {
            const message = parseError instanceof Error ? parseError.message : String(parseError);
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
      const backendProvider = typeof meta.provider === 'string' ? meta.provider : 'tauri-backend';
      const provider = this.normalizeBackendProvider(backendProvider);
      const timestamp = typeof meta.timestamp === 'number' ? meta.timestamp : Date.now();
      const latencyMs = typeof meta.latency_ms === 'number' ? meta.latency_ms : 0;
      const tokenCount = typeof meta.tokens === 'number' ? meta.tokens : undefined;
      const promptTokenCount = typeof meta.prompt_tokens === 'number' ? meta.prompt_tokens : undefined;
      const chunkCount = typeof meta.chunk_count === 'number' ? meta.chunk_count : undefined;
      const totalDuration = typeof meta.total_duration === 'number' ? meta.total_duration : undefined;
      const loadDuration = typeof meta.load_duration === 'number' ? meta.load_duration : undefined;

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
      const validation = chatValidator.validate(response.content, finalConfig.mode, validatedMessage);
      isDev && console.log(`   ✅ Backend stream validation score: ${(validation.score * 100).toFixed(0)}%`);

      if (validation.issues.length > 0) {
        validation.issues.forEach(issue => {
          isDev && console.log(`      - [${issue.severity}] ${issue.type}: ${issue.message}`);
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
        isDev && console.warn('   ⚠️ Memory save failed (streaming)');
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

      if (isDev) {
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log(`║  🟣 CHAT ENGINE OMEGA: Backend stream complete! (${processingTime}ms) ║`);
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
      }

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

      debug_cognitive: `Analyse cognitive : "${message.substring(0, 50)}". Mode debug OMEGA - évaluation et optimisation mentale.`
    } as Partial<Record<ChatMode, string>>;

    return responses[mode] as string || responses.default || `Message reçu : "${message.substring(0, 50)}"`;
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
      )
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

      // Validation rapide
      pipelineSteps.push("stream-validation");
      const validatedMessage = inputValidator.validate(message?.trim() || "");
      if (!validatedMessage) {
        yield "⚠️ Message invalide détecté...";
        throw new Error('Invalid message for streaming');
      }

      // Contexte Memory Core (optionnel pour streaming)
      pipelineSteps.push("stream-context");
      let memoryContext: MemoryContext;
      let context: { sources: string[]; data: Record<string, unknown> };

      try {
        memoryContext = await this.withTimeout(
          memoryIntegration.loadContext(finalConfig.contextSources || {}),
          3000,
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
          timeline: []
        };
        context = { sources: [], data: {} };
        autoHealed = true;
      }

      // Prompt selon mode
      pipelineSteps.push("stream-prompt");
      const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
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
          isDev && console.warn('[OMEGA STREAM] Backend pipeline failed, falling back to orchestrator:', error);
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
      pipelineSteps.push("stream-orchestrator");
      for await (const chunk of aiOrchestrator.stream(validatedMessage, enrichedHistory)) {
        fullContent += chunk;
        yield chunk;
      }

      // Post-validation streaming
      pipelineSteps.push("stream-validation-post");
      let finalContent = fullContent;
      const validation = chatValidator.validate(fullContent, finalConfig.mode, validatedMessage);
      if (!validation.isValid && validation.cleaned && finalConfig.omegaConfig?.enableSanitizer) {
        finalContent = validation.cleaned;
        yield "\n\n🧹 *[Réponse optimisée automatiquement]*";
        autoHealed = true;
      }

      // Sauvegarde (async, non-bloquante pour streaming)
      pipelineSteps.push("stream-save");
      memoryIntegration.saveInteraction({
        mode: finalConfig.mode,
        userMessage: validatedMessage,
        aiResponse: finalContent,
        emotionState: this.convertEmotionState(finalConfig.emotionState),
        context: memoryContext,
      }).catch(error => {
        isDev && console.warn('[OMEGA STREAM] Memory save failed:', error);
      });

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
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      // Fallback streaming
      isDev && console.error('[OMEGA STREAM] Error:', error);
      yield "\n\n🔄 *Auto-réparation OMEGA en cours...*";

      return {
        content: fullContent || `Erreur streaming récupérée. Message traité : "${message.substring(0, 50)}"`,
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
          processingTime: Date.now() - startTime
        }
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
      const systemContent = systemPrompt ?? this.buildSystemPrompt(modeConfig, context, promptContext);
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
      isDev && console.warn('[OMEGA] buildEnrichedHistory failed, using minimal history');
      return [
        {
          role: 'system',
          content: systemPrompt || `TITANE∞ v19.2Ω - Mode ${modeConfig.name} (Emergency)`,
          timestamp: Date.now(),
        },
        ...history.slice(-3) // Minimal history
      ];
    }
  }

  /**
   * Convertit MemoryContext en format compatible
   */
  private formatMemoryContext(memory: MemoryContext): { sources: string[]; data: Record<string, unknown> } {
    try {
      const sources: string[] = [];
      const data: Record<string, unknown> = {};

      // Projets actifs
      if (memory.activeProjects.length > 0) {
        sources.push('projets');
        data.projects = memory.activeProjects.map((p: ProjectSummary) => `[${p.status}] ${p.title} (P: ${p.priority})`).join(', ');
      }

      // Décisions récentes
      if (memory.recentDecisions.length > 0) {
        sources.push('decisions');
        data.decisions = memory.recentDecisions.map((d: DecisionSummary) => `${d.title} (${d.status})`).join('; ');
      }

      // Connaissances
      if (memory.relevantKnowledge.length > 0) {
        sources.push('knowledge');
        data.knowledge = memory.relevantKnowledge.map((k: KnowledgeEntry) => k.title).join(', ');
      }

      // Rituels
      if (memory.activeRituals.length > 0) {
        sources.push('rituals');
        data.rituals = memory.activeRituals.map((r: RitualInfo) => r.name).join(', ');
      }

      return { sources, data };
    } catch (error) {
      // Fallback formatage sécurisé
      isDev && console.warn('[OMEGA] formatMemoryContext failed:', error);
      return { sources: [], data: {} };
    }
  }

  /**
   * Convertit emotionState vers format Memory Core
   */
  private convertEmotionState(
    emotionState?: { valence: number; intensity: number; energy: number }
  ): { valence: number; activation: number; dominant_emotion: string } | undefined {
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
      const contextPayload: PromptContext =
        promptContext || {
          modeName: modeConfig.name,
          modeIcon: modeConfig.icon,
          emotionState: this.config.emotionState,
          memory: context.sources.length > 0 ? context : undefined,
        };

      const basePrompt = buildTitanePrompt(modeConfig.profileId, undefined, contextPayload);

      // Inject semantic context if available
      if (semanticContext && semanticContext.trim().length > 0) {
        return `${basePrompt}\n\n${semanticContext}`;
      }

      return basePrompt;
    } catch (error) {
      isDev && console.warn('[OMEGA] buildSystemPrompt failed:', error);
      return `TITANE∞ v19.2Ω - Mode ${modeConfig.name} (Emergency Mode)`;
    }
  }

  /**
   * Post-traitement selon mode OMEGA
   */
  private postProcess(
    response: AIResponse,
    config: ChatEngineConfig
  ): AIResponse {
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
          if (!content.toLowerCase().includes('résumé') && !content.toLowerCase().includes('synthèse')) {
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
      isDev && console.warn('[OMEGA] postProcess failed:', error);
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
      /\b(algorithm|function|class|interface|type|component|service|engine)\b/g
    ];

    // Domain concepts
    const domainPatterns = [
      /\b(ai|intelligence artificielle|machine learning|llm|gpt|claude|gemini)\b/g,
      /\b(chat|conversation|dialogue|interaction|message|prompt)\b/g,
      /\b(mémoire|memory|stockage|storage|database|persistence)\b/g,
      /\b(voice|voix|audio|tts|stt|speech|parole)\b/g
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
          'Qu\'as-tu appris aujourd\'hui (mode OMEGA) ?',
          'Quel est ton besoin principal maintenant ?',
        ],
        debug_cognitive: [
          'Quelle est ta charge cognitive actuelle (0-10) ?',
          'Quel projet draine le plus d\'énergie TITANE∞ ?',
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
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON OMEGA
// ─────────────────────────────────────────────────────────────────

export const chatEngine = new ChatEngineOmega();

export default chatEngine;
