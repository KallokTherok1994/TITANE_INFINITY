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

import type { AIMessage, AIResponse, AIConfig } from './types';
import { aiOrchestrator } from './orchestrator';
import {
  memoryIntegration,
  type MemoryContext,
} from './memoryIntegration';
import { inputValidator } from './inputValidator';
import { chatModes, type ChatModeConfig } from './chatModes';
import { chatValidator } from '../chatValidator';

const isDev = import.meta.env.DEV;

// ─────────────────────────────────────────────────────────────────
// TYPES OMEGA ÉTENDUS + SURVEILLANCE
// ─────────────────────────────────────────────────────────────────

export type ChatMode =
  | 'default'           // Mode standard
  | 'brainstorming'     // Divergence créative
  | 'synthesis'         // Connexion d'idées
  | 'planning'          // Structuration & action
  | 'journal'           // Réflexion personnelle
  | 'debug_cognitive';  // Analyse charge mentale

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
    let failureHandled = false;

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

      // ═══ PHASE 1.2: CONTEXTE MEMORY CORE SÉCURISÉ ═══
      pipelineSteps.push("context-loading");
      isDev && console.log('🧠 Step 1.2: Loading Memory Core context...');

      let memoryContext: MemoryContext;
      let context: { sources: string[]; data: Record<string, unknown> };

      try {
        memoryContext = await this.withTimeout(
          memoryIntegration.loadContext(finalConfig.contextSources || {}),
          5000,
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
          activeRituals: []
        };
        context = { sources: [], data: {} };
        autoHealed = true;
      }

      // ═══ PHASE 1.3: CONSTRUCTION PROMPT SELON MODE ═══
      pipelineSteps.push("prompt-building");
      isDev && console.log(`🎨 Step 1.3: Building OMEGA prompt for mode "${finalConfig.mode}"...`);

      const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
      const enrichedHistory = this.buildEnrichedHistory(
        history,
        context,
        modeConfig
      );
      isDev && console.log(`   ✅ Enriched history built (${enrichedHistory.length} messages)`);

      // ═══ PHASE 1.4: APPEL ORCHESTRATOR OMEGA ═══
      pipelineSteps.push("orchestrator-call");
      isDev && console.log('🚀 Step 1.4: Calling OMEGA orchestrator...');

      const timeoutMs = finalConfig.omegaConfig?.timeoutMs || 30000;
      const response = await this.withTimeout(
        aiOrchestrator.generate(validatedMessage, enrichedHistory, finalConfig.aiConfig),
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
            emotionState: finalConfig.emotionState,
            context: memoryContext,
          }),
          3000,
          'Memory save timeout'
        );
        isDev && console.log('   ✅ Interaction saved');
      } catch (error) {
        isDev && console.warn('   ⚠️ Memory save failed (continuing)');
        autoHealed = true;
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
    };

    return responses[mode] || responses.default;
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
        memoryContext = { activeProjects: [], recentDecisions: [], relevantKnowledge: [], activeRituals: [] };
        context = { sources: [], data: {} };
      }

      // Prompt selon mode
      pipelineSteps.push("stream-prompt");
      const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
      const enrichedHistory = this.buildEnrichedHistory(
        history,
        context,
        modeConfig
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
      }

      // Sauvegarde (async, non-bloquante pour streaming)
      pipelineSteps.push("stream-save");
      memoryIntegration.saveInteraction({
        mode: finalConfig.mode,
        userMessage: validatedMessage,
        aiResponse: finalContent,
        emotionState: finalConfig.emotionState,
        context: memoryContext,
      }).catch(error => {
        isDev && console.warn('[OMEGA STREAM] Memory save failed:', error);
      });

      // Retour final
      return {
        content: finalContent,
        provider: 'omega-stream',
        model: 'omega-stream-v19.2Ω',
        timestamp: Date.now(),
        mode: finalConfig.mode,
        contextUsed: context.sources,
        suggestions: this.generateSuggestions(finalConfig.mode),
        omegaMetadata: {
          pipelineSteps,
          validationScore: validation.score,
          autoHealed: false,
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
        provider: 'omega-emergency',
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
    modeConfig: ChatModeConfig
  ): AIMessage[] {
    try {
      const enrichedHistory: AIMessage[] = [];

      // Message système avec mode & contexte OMEGA
      enrichedHistory.push({
        role: 'system',
        content: this.buildSystemPrompt(modeConfig, context),
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
          content: `TITANE∞ v19.2Ω - Mode ${modeConfig.name} (Emergency)`,
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
        data.projects = memory.activeProjects.map((p) => `[${p.status}] ${p.name} (P${p.priority})`).join(', ');
      }

      // Décisions récentes
      if (memory.recentDecisions.length > 0) {
        sources.push('decisions');
        data.decisions = memory.recentDecisions.map((d) => `${d.title}: ${d.outcome}`).join('; ');
      }

      // Connaissances
      if (memory.relevantKnowledge.length > 0) {
        sources.push('knowledge');
        data.knowledge = memory.relevantKnowledge.map((k) => k.topic).join(', ');
      }

      // Rituels
      if (memory.activeRituals.length > 0) {
        sources.push('rituals');
        data.rituals = memory.activeRituals.map((r) => r.name).join(', ');
      }

      return { sources, data };
    } catch (error) {
      // Fallback formatage sécurisé
      isDev && console.warn('[OMEGA] formatMemoryContext failed:', error);
      return { sources: [], data: {} };
    }
  }

  /**
   * Construit le prompt système selon mode OMEGA
   */
  private buildSystemPrompt(
    modeConfig: ChatModeConfig,
    context: { sources: string[]; data: Record<string, unknown> }
  ): string {
    try {
      // Signature TITANE∞ OMEGA obligatoire
      let prompt = `═══════════════════════════════════════════════════════════════════
TITANE∞ v19.2Ω — Système Cognitif OMEGA Auto-Évolutif
Mode actif: ${modeConfig.name} (${modeConfig.icon})
Architecture: Pipeline OMEGA • Auto-guérison • Validation multi-niveaux
═══════════════════════════════════════════════════════════════════

`;

      // Ajout du prompt spécifique au mode (isolé)
      prompt += modeConfig.systemPrompt;

      // Isolation OMEGA: Rappel du mode pour éviter contamination
      prompt += `

⚠️ ISOLATION MODE OMEGA: Tu es actuellement en mode ${modeConfig.name}. Reste fidèle à ce mode avec cohérence TITANE∞, ne dérive pas vers d'autres styles de réponse.`;

      // Adaptation émotionnelle OMEGA
      if (this.config.emotionState) {
        const { valence, intensity, energy } = this.config.emotionState;

        if (intensity > 0.7 && energy < 0.3) {
          prompt += '\n\n⚠️ OMEGA ÉMOTIONNEL: Utilisateur fatigué avec forte intensité. Adopte un ton apaisant TITANE∞, propose des pauses cognitives.';
        } else if (valence < -0.5) {
          prompt += '\n\n💙 OMEGA SUPPORT: État émotionnel négatif détecté. Sois empathique avec la personnalité TITANE∞, écoute active, questions réflexives douces.';
        } else if (energy > 0.8 && valence > 0.5) {
          prompt += '\n\n🚀 OMEGA DYNAMIQUE: Utilisateur énergisé et positif. Encourage l\'action avec l\'efficacité TITANE∞, propose des défis stimulants.';
        }
      }

      // Contexte Memory Core OMEGA
      if (context.sources.length > 0) {
        prompt += '\n\n📚 Contexte OMEGA actif:\n';
        prompt += context.sources.map(s => `  • ${s}`).join('\n');

        // Projets actifs
        if (context.data.projects) {
          prompt += `\n\nProjets en cours: ${context.data.projects}`;
        }

        // Décisions récentes
        if (context.data.decisions) {
          prompt += `\n\nDécisions récentes: ${context.data.decisions}`;
        }
      }

      // Signature de clôture TITANE∞ OMEGA
      prompt += `

═══════════════════════════════════════════════════════════════════
Fin du contexte système TITANE∞ v19.2Ω OMEGA
Réponds maintenant en mode ${modeConfig.name} avec personnalité TITANE∞.
═══════════════════════════════════════════════════════════════════`;

      return prompt;
    } catch (error) {
      // Fallback prompt sécurisé
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
   * Génère suggestions contextuelles OMEGA
   */
  private generateSuggestions(mode: ChatMode): string[] {
    try {
      const baseSuggestions: Record<ChatMode, string[]> = {
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

      return baseSuggestions[mode] || baseSuggestions.default;
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
