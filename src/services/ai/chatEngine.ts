/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — CHAT ENGINE (UNIFIED)
 *   Moteur de chat unifié avec modes de travail & intégration Memory Core
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

// ─────────────────────────────────────────────────────────────────
// TYPES ÉTENDUS
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
}

export interface ChatEngineResponse extends AIResponse {
  mode: ChatMode;
  contextUsed: string[];
  suggestions?: string[];
}

// ─────────────────────────────────────────────────────────────────
// CLASSE PRINCIPALE
// ─────────────────────────────────────────────────────────────────

class ChatEngine {
  private config: ChatEngineConfig = { mode: 'default' };
  private lastMode: ChatMode = 'default';
  private conversationContext: Map<string, any> = new Map();

  /**
   * Configure le mode de travail avec reset cognitif
   */
  setMode(mode: ChatMode, config?: Partial<ChatEngineConfig>): void {
    // Reset cognitif si changement de mode
    if (this.lastMode !== mode) {
      console.log(`🔄 RESET COGNITIF: ${this.lastMode} → ${mode}`);
      this.conversationContext.clear();
      this.lastMode = mode;
    }

    this.config = {
      mode,
      ...config,
    };
  }

  /**
   * Génère une réponse avec contexte enrichi
   */
  async generate(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<ChatEngineConfig>
  ): Promise<ChatEngineResponse> {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  CHAT ENGINE: Starting generation                            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    const finalConfig = { ...this.config, ...config };
    console.log(`🎯 Mode: ${finalConfig.mode}`);
    console.log(`📝 Message: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`);

    // 1. Validation & sécurité
    console.log('🔒 Step 1: Validating input...');
    const validatedMessage = inputValidator.validate(message);
    console.log(`   ✅ Validated (${validatedMessage.length} chars)`);

    // 2. Enrichissement contextuel depuis Memory Core
    console.log('🧠 Step 2: Loading Memory Core context...');
    const memoryContext = await memoryIntegration.loadContext(finalConfig.contextSources || {});
    const context = this.formatMemoryContext(memoryContext);
    console.log(`   ✅ Context loaded (${context.sources.length} sources)`);

    // 3. Construction du prompt selon le mode
    console.log(`🎨 Step 3: Building prompt for mode "${finalConfig.mode}"...`);
    const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
    const enrichedHistory = this.buildEnrichedHistory(
      history,
      context,
      modeConfig
    );
    console.log(`   ✅ Enriched history built (${enrichedHistory.length} messages)`);

    // 4. Appel orchestrateur
    console.log('🚀 Step 4: Calling orchestrator...\n');
    const response = await aiOrchestrator.generate(
      validatedMessage,
      enrichedHistory,
      finalConfig.aiConfig
    );
    console.log('   ✅ Orchestrator response received');

    // 4.5. NEXUS & SENTINEL - Validation cohérence
    console.log('🛡️  Step 4.5: Validating response with Nexus/Sentinel...');
    const validation = chatValidator.validate(response.content, finalConfig.mode, validatedMessage);
    console.log(`   ✅ Validation score: ${(validation.score * 100).toFixed(0)}% (coherence: ${(validation.coherenceScore * 100).toFixed(0)}%, anomaly: ${(validation.anomalyScore * 100).toFixed(0)}%)`);

    if (validation.issues.length > 0) {
      console.log(`   ⚠️  Issues detected: ${validation.issues.length}`);
      validation.issues.forEach(issue => {
        console.log(`      - [${issue.severity}] ${issue.type}: ${issue.message}`);
      });
    }

    // Si validation échoue, utiliser réponse nettoyée
    if (!validation.isValid && validation.cleaned) {
      console.log('   🧹 Using cleaned response');
      response.content = validation.cleaned;
    }

    // 5. Post-traitement selon mode
    console.log('⚙️  Step 5: Post-processing...');
    const processedResponse = this.postProcess(response, finalConfig);
    console.log('   ✅ Response processed');

    // 6. Sauvegarde dans Memory Core
    console.log('💾 Step 6: Saving to Memory Core...');
    await memoryIntegration.saveInteraction({
      mode: finalConfig.mode,
      userMessage: validatedMessage,
      aiResponse: processedResponse.content,
      emotionState: finalConfig.emotionState,
      context: memoryContext,
    });
    console.log('   ✅ Interaction saved');

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  CHAT ENGINE: Generation complete!                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    return {
      ...processedResponse,
      mode: finalConfig.mode,
      contextUsed: context.sources,
      suggestions: this.generateSuggestions(finalConfig.mode),
    };
  }

  /**
   * Stream avec contexte enrichi
   */
  async *stream(
    message: string,
    history: AIMessage[] = [],
    config?: Partial<ChatEngineConfig>
  ): AsyncGenerator<string, ChatEngineResponse> {
    const finalConfig = { ...this.config, ...config };

    // Validation
    const validatedMessage = inputValidator.validate(message);

    // Contexte Memory Core
    const memoryContext = await memoryIntegration.loadContext(finalConfig.contextSources || {});
    const context = this.formatMemoryContext(memoryContext);

    // Prompt selon mode
    const modeConfig = (chatModes[finalConfig.mode] ?? chatModes.default) as ChatModeConfig;
    const enrichedHistory = this.buildEnrichedHistory(
      history,
      context,
      modeConfig
    );

    // Stream
    let fullContent = '';
    for await (const chunk of aiOrchestrator.stream(validatedMessage, enrichedHistory)) {
      fullContent += chunk;
      yield chunk;
    }

    // Validation Nexus/Sentinel
    const validation = chatValidator.validate(fullContent, finalConfig.mode, validatedMessage);
    if (!validation.isValid && validation.cleaned) {
      fullContent = validation.cleaned;
    }

    // Post-traitement
    const response: ChatEngineResponse = {
      content: fullContent,
      provider: 'gemini', // sera corrigé par l'orchestrateur
      timestamp: Date.now(),
      mode: finalConfig.mode,
      contextUsed: context.sources,
      suggestions: this.generateSuggestions(finalConfig.mode),
    };

    // Sauvegarde
    await memoryIntegration.saveInteraction({
      mode: finalConfig.mode,
      userMessage: validatedMessage,
      aiResponse: fullContent,
      emotionState: finalConfig.emotionState,
      context: memoryContext,
    });

    return response;
  }

  /**
   * Construit l'historique enrichi avec contexte
   */
  private buildEnrichedHistory(
    history: AIMessage[],
    context: { sources: string[]; data: Record<string, unknown> },
    modeConfig: ChatModeConfig
  ): AIMessage[] {
    const enrichedHistory: AIMessage[] = [];

    // Message système avec mode & contexte
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
  }

  /**
   * Convertit MemoryContext en format compatible
   */
  private formatMemoryContext(memory: MemoryContext): { sources: string[]; data: Record<string, unknown> } {
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
  }

  /**
   * Construit le prompt système selon mode
   */
  private buildSystemPrompt(
    modeConfig: ChatModeConfig,
    context: { sources: string[]; data: Record<string, unknown> }
  ): string {
    // Signature TITANE∞ obligatoire
    let prompt = `═══════════════════════════════════════════════════════════════════
TITANE∞ v14 — Système Cognitif Auto-Évolutif
Mode actif: ${modeConfig.name} (${modeConfig.icon})
═══════════════════════════════════════════════════════════════════

`;

    // Ajout du prompt spécifique au mode (isolé)
    prompt += modeConfig.systemPrompt;

    // Isolation: Rappel du mode pour éviter contamination
    prompt += `

⚠️ ISOLATION MODE: Tu es actuellement en mode ${modeConfig.name}. Reste fidèle à ce mode, ne dérive pas vers d'autres styles de réponse.`;

    // Adaptation émotionnelle
    if (this.config.emotionState) {
      const { valence, intensity, energy } = this.config.emotionState;

      if (intensity > 0.7 && energy < 0.3) {
        prompt += '\n\n⚠️ Kevin semble fatigué avec forte intensité émotionnelle. Adopte un ton apaisant, propose des pauses.';
      } else if (valence < -0.5) {
        prompt += '\n\n💙 État émotionnel négatif détecté. Sois empathique, écoute active, questions réflexives douces.';
      } else if (energy > 0.8 && valence > 0.5) {
        prompt += '\n\n🚀 Kevin est énergisé et positif. Encourage l\'action, propose des défis stimulants.';
      }
    }

    // Contexte Memory Core
    if (context.sources.length > 0) {
      prompt += '\n\n📚 Contexte actif:\n';
      prompt += context.sources.map(s => `  • ${s}`).join('\n');

      // Projets actifs
      if (context.data.activeProjects) {
        prompt += `\n\nProjets en cours: ${(context.data.activeProjects as string[]).join(', ')}`;
      }

      // Décisions récentes
      if (context.data.recentDecisions) {
        prompt += `\n\nDécisions récentes: ${(context.data.recentDecisions as string[]).join('; ')}`;
      }
    }

    // Signature de clôture TITANE∞
    prompt += `

═══════════════════════════════════════════════════════════════════
Fin du contexte système TITANE∞ v14
Réponds maintenant en mode ${modeConfig.name} uniquement.
═══════════════════════════════════════════════════════════════════`;

    return prompt;
  }

  /**
   * Post-traitement selon mode
   */
  private postProcess(
    response: AIResponse,
    config: ChatEngineConfig
  ): AIResponse {
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
          content = `**Synthèse**: ${content.split('.')[0]}.\n\n${content}`;
        }
        break;
    }

    return {
      ...response,
      content,
    };
  }

  /**
   * Génère suggestions contextuelles
   */
  private generateSuggestions(mode: ChatMode): string[] {
    const baseSuggestions: Record<ChatMode, string[]> = {
      default: [
        'Passe en mode Brainstorming pour explorer',
        'Active le mode Journal pour réfléchir',
        'Besoin de planifier ? Essaie le mode Planning',
      ],
      brainstorming: [
        'Et si on explorait une autre direction ?',
        'Quelles sont les contraintes à lever ?',
        'Passe en mode Synthèse pour organiser ces idées',
      ],
      synthesis: [
        'Quels liens entre ces éléments ?',
        'Quelle est la hiérarchie des priorités ?',
        'Prêt à structurer ? Essaie le mode Planning',
      ],
      planning: [
        'Quelle est la première action concrète ?',
        'Quels obstacles anticiper ?',
        'Définir les critères de succès ?',
      ],
      journal: [
        'Comment te sens-tu vraiment ?',
        'Qu\'as-tu appris aujourd\'hui ?',
        'Quel est ton besoin principal maintenant ?',
      ],
      debug_cognitive: [
        'Quelle est ta charge cognitive actuelle (0-10) ?',
        'Quel projet draine le plus d\'énergie ?',
        'As-tu pris une pause récemment ?',
      ],
    };

    return baseSuggestions[mode] || baseSuggestions.default;
  }

  /**
   * Helpers formatage
   */
  private addNumbering(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
  }

  private addBullets(text: string): string {
    const sentences = text.split('.').filter(s => s.trim());
    return sentences.map(s => `• ${s.trim()}`).join('\n');
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const chatEngine = new ChatEngine();

export default chatEngine;
