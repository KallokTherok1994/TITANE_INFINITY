/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Prompt Assembler
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Assemble le prompt final à partir du contexte collecté et filtré.
 * Construit les 9 sections du prompt selon le format TITANE∞.
 *
 * Pipeline:
 * 1. Intent parsing
 * 2. Context collection
 * 3. Context filtering
 * 4. Layer fusion
 * 5. Blueprint construction
 * 6. Final prompt formatting
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type {
  ContextNode,
  ContextLayer,
  LayerId,
  IAMode,
  IntentProfile,
  MergedContext,
  PromptBlueprint,
  PromptSection,
  SingularityPrompt,
  PromptRequest,
  PromptResponse,
  PromptError,
  AuditEntry,
  TokenBudget,
  OptimizationHint,
  PromptEngineConfig,
} from './promptEngine.config';

import {
  generateContextId,
  hashContent,
  estimateTokens,
  validatePromptRequest,
  DEFAULT_PROMPT_ENGINE_CONFIG,
  DEFAULT_LAYER_METADATA,
  DEFAULT_MODE_PROFILES,
  PROMPT_SECTION_NAMES,
} from './promptEngine.config';

import { IntentParser } from './intentParser';
import { ContextCollector } from './contextCollector';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface FilteredContext {
  layers: Map<LayerId, ContextNode[]>;
  removed: number;
  duplicates: number;
  belowThreshold: number;
}

interface FusedLayers {
  layers: Map<LayerId, ContextLayer>;
  conflicts: string[];
  totalTokens: number;
}

// =============================================================================
// CLASSE PROMPT ASSEMBLER
// =============================================================================

/**
 * Assembleur de prompts TITANE∞
 * Orchestre tout le pipeline de génération de prompts
 */
export class PromptAssembler {
  private static instance: PromptAssembler | null = null;

  private config: PromptEngineConfig;
  private intentParser: IntentParser;
  private contextCollector: ContextCollector;
  private auditLog: AuditEntry[] = [];

  private stats = {
    totalPrompts: 0,
    successfulPrompts: 0,
    failedPrompts: 0,
    averageProcessingTime: 0,
    averageTokenCount: 0,
  };

  private constructor() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_PROMPT_ENGINE_CONFIG));
    this.intentParser = IntentParser.getInstance();
    this.contextCollector = ContextCollector.getInstance();
    console.log('[PromptAssembler] 🔧 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): PromptAssembler {
    if (!PromptAssembler.instance) {
      PromptAssembler.instance = new PromptAssembler();
    }
    return PromptAssembler.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    PromptAssembler.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure l'assembleur
   */
  configure(config: Partial<PromptEngineConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.collector) {
      this.contextCollector.configure(config.collector);
    }

    console.log('[PromptAssembler] ⚙️ Configuration updated');
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): PromptEngineConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PIPELINE PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Assemble un prompt complet à partir d'une requête
   */
  async assemblePrompt(request: PromptRequest): Promise<PromptResponse> {
    const startTime = performance.now();
    this.stats.totalPrompts++;

    // Validation
    const validation = validatePromptRequest(request);
    if (!validation.valid) {
      return this.createErrorResponse(
        'VALIDATION_ERROR',
        validation.errors.join(', '),
        true,
        startTime
      );
    }

    const mode = request.mode || this.config.defaultMode;
    this.addAuditEntry('start', undefined, `Starting prompt assembly for mode: ${mode}`);

    try {
      // 1. Parser l'intention
      this.addAuditEntry('intent_parse', undefined, 'Parsing user intent');
      const intent = this.intentParser.parseIntent(request.userInput);

      // 2. Collecter le contexte
      this.addAuditEntry('context_collect', undefined, 'Collecting context from sources');
      const rawContext = await this.contextCollector.collectAll(mode);

      // 3. Filtrer le contexte
      this.addAuditEntry('context_filter', undefined, 'Filtering context');
      const filteredContext = this.filterContext(rawContext, intent, mode);

      // 4. Fusionner les couches
      this.addAuditEntry('layer_fusion', undefined, 'Fusing context layers');
      const fusedLayers = this.fuseLayers(filteredContext.layers, intent);

      // 5. Construire le contexte fusionné
      const mergedContext = this.buildMergedContext(fusedLayers);

      // 6. Construire le blueprint
      this.addAuditEntry('blueprint_build', undefined, 'Building prompt blueprint');
      const blueprint = this.buildBlueprint(mergedContext, intent, mode);

      // 7. Optimiser si nécessaire
      const optimizedBlueprint = this.optimizeBlueprint(blueprint);

      // 8. Formater le prompt final
      this.addAuditEntry('format_final', undefined, 'Formatting final prompt');
      const singularityPrompt = this.formatFinalPrompt(
        optimizedBlueprint,
        intent,
        mode,
        startTime
      );

      // Succès
      this.stats.successfulPrompts++;
      this.updateAverages(singularityPrompt.tokenCount, performance.now() - startTime);

      this.addAuditEntry('complete', undefined, `Prompt assembled successfully (${singularityPrompt.tokenCount} tokens)`);

      return {
        success: true,
        prompt: singularityPrompt,
        debug: request.options?.debugInfo ? {
          layers: this.getLayerStats(fusedLayers.layers),
          conflicts: mergedContext.conflicts,
          optimizations: optimizedBlueprint.optimizationHints,
          timeline: this.getTimeline(startTime),
        } : undefined,
        timestamp: Date.now(),
        processingTime: performance.now() - startTime,
      };

    } catch (error) {
      this.stats.failedPrompts++;
      this.addAuditEntry('error', undefined, `Error: ${error instanceof Error ? error.message : 'Unknown'}`);

      return this.createErrorResponse(
        'ASSEMBLY_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        true,
        startTime
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FILTRAGE DU CONTEXTE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Filtre le contexte selon les règles configurées
   */
  private filterContext(
    rawContext: Map<LayerId, ContextNode[]>,
    intent: IntentProfile,
    _mode: IAMode
  ): FilteredContext {
    const filterConfig = this.config.filter;
    const filtered = new Map<LayerId, ContextNode[]>();
    let removed = 0;
    let duplicates = 0;
    let belowThreshold = 0;

    const seenHashes = new Set<string>();

    for (const [layerId, nodes] of rawContext) {
      const filteredNodes: ContextNode[] = [];

      for (const node of nodes) {
        // Déduplication
        if (filterConfig.deduplication && seenHashes.has(node.hash)) {
          duplicates++;
          removed++;
          continue;
        }
        seenHashes.add(node.hash);

        // Seuil de pertinence
        if (node.relevance < filterConfig.minRelevance) {
          belowThreshold++;
          removed++;
          continue;
        }

        // Booster la pertinence si lié à l'intention
        const boostedNode = this.boostRelevanceByIntent(node, intent);
        filteredNodes.push(boostedNode);
      }

      // Limiter le nombre de nœuds par couche
      const limited = filteredNodes
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, filterConfig.maxNodesPerLayer);

      filtered.set(layerId, limited);
    }

    return { layers: filtered, removed, duplicates, belowThreshold };
  }

  /**
   * Booste la pertinence selon l'intention
   */
  private boostRelevanceByIntent(node: ContextNode, intent: IntentProfile): ContextNode {
    let boost = 0;

    // Boost si la source est requise par l'intention
    if (intent.requiredContext.includes(node.source.type)) {
      boost += 0.2;
    }

    // Boost selon les tags correspondants
    const intentKeywords = intent.parsed.keywords;
    const nodeTags = node.metadata.tags;
    const matchingTags = nodeTags.filter(tag =>
      intentKeywords.some(kw => tag.toLowerCase().includes(kw.toLowerCase()))
    );
    boost += matchingTags.length * 0.05;

    const newRelevance = Math.min(1, node.relevance + boost);
    return { ...node, relevance: newRelevance };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FUSION DES COUCHES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fusionne les couches de contexte
   */
  private fuseLayers(
    filteredLayers: Map<LayerId, ContextNode[]>,
    _intent: IntentProfile
  ): FusedLayers {
    const layers = new Map<LayerId, ContextLayer>();
    const conflicts: string[] = [];
    let totalTokens = 0;

    const layerIds: LayerId[] = ['physical', 'cognitive', 'symbolic', 'adaptive', 'meta', 'singularity'];

    for (const layerId of layerIds) {
      const nodes = filteredLayers.get(layerId) || [];
      const layer = this.buildLayer(layerId, nodes);

      // Détecter les conflits internes
      const layerConflicts = this.detectConflicts(nodes);
      conflicts.push(...layerConflicts.map(c => `${layerId}: ${c}`));

      totalTokens += layer.stats.totalTokens;
      layers.set(layerId, layer);
    }

    return { layers, conflicts, totalTokens };
  }

  /**
   * Construit une couche à partir de nœuds
   */
  private buildLayer(layerId: LayerId, nodes: ContextNode[]): ContextLayer {
    const metadata = DEFAULT_LAYER_METADATA[layerId];

    const totalTokens = nodes.reduce((sum, n) => sum + (n.metadata.tokens || 0), 0);
    const avgRelevance = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.relevance, 0) / nodes.length
      : 0;

    return {
      id: layerId,
      metadata,
      nodes,
      bundles: [],
      fusionRules: [],
      stats: {
        nodeCount: nodes.length,
        totalTokens,
        averageRelevance: avgRelevance,
        compressionRatio: 1,
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * Détecte les conflits dans les nœuds
   */
  private detectConflicts(nodes: ContextNode[]): string[] {
    const conflicts: string[] = [];

    // Détecter les valeurs contradictoires pour les mêmes clés
    const valuesByType = new Map<string, Set<string>>();

    for (const node of nodes) {
      const key = `${node.type}_${node.source.type}`;
      if (!valuesByType.has(key)) {
        valuesByType.set(key, new Set());
      }
      const values = valuesByType.get(key);
      if (values) {
        values.add(JSON.stringify(node.content));
      }
    }

    for (const [key, values] of valuesByType) {
      if (values.size > 1) {
        conflicts.push(`Multiple values for ${key}`);
      }
    }

    return conflicts;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONSTRUCTION DU CONTEXTE FUSIONNÉ
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Construit le MergedContext final
   */
  private buildMergedContext(fusedLayers: FusedLayers): MergedContext {
    const conflictReports = fusedLayers.conflicts.map((desc, index) => ({
      id: `conflict_${index}`,
      type: 'data_conflict' as const,
      layers: [] as LayerId[],
      nodes: [] as string[],
      description: desc,
      resolved: false,
    }));

    return {
      id: generateContextId('merged'),
      layers: fusedLayers.layers,
      conflicts: conflictReports,
      compressionRatio: 1,
      totalTokens: fusedLayers.totalTokens,
      validationStatus: conflictReports.length === 0 ? 'valid' : 'warning',
      warnings: fusedLayers.conflicts,
      timestamp: Date.now(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONSTRUCTION DU BLUEPRINT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Construit le blueprint du prompt (9 sections)
   */
  private buildBlueprint(
    context: MergedContext,
    intent: IntentProfile,
    mode: IAMode
  ): PromptBlueprint {
    const sections: PromptSection[] = [];
    const modeProfile = DEFAULT_MODE_PROFILES[mode];

    // Section 1: Mode IA
    sections.push(this.buildSection(1, this.formatModeSection(mode, modeProfile)));

    // Section 2: Objectif utilisateur
    sections.push(this.buildSection(2, this.formatObjectiveSection(intent.raw)));

    // Section 3: Intention décodée
    sections.push(this.buildSection(3, this.formatIntentSection(intent)));

    // Section 4: Contexte courant
    sections.push(this.buildSection(4, this.formatCurrentContextSection(context)));

    // Section 5: Mémoire hiérarchisée
    sections.push(this.buildSection(5, this.formatMemorySection(context)));

    // Section 6: Informations complémentaires
    sections.push(this.buildSection(6, this.formatComplementarySection(context)));

    // Section 7: Règles & Restrictions
    sections.push(this.buildSection(7, this.formatRulesSection(mode, modeProfile)));

    // Section 8: Style / Tonalité
    sections.push(this.buildSection(8, this.formatStyleSection(modeProfile)));

    // Section 9: Instructions finales
    sections.push(this.buildSection(9, this.formatFinalInstructionsSection(intent, mode)));

    // Calculer le budget
    const tokenBudget = this.calculateTokenBudget(sections);

    return {
      id: generateContextId('blueprint'),
      sections,
      metadata: {
        version: 'vΩ∞Ω',
        generatedAt: Date.now(),
        mode,
        intentId: intent.id,
        contextHash: hashContent(context),
      },
      tokenBudget,
      optimizationHints: [],
    };
  }

  /**
   * Construit une section
   */
  private buildSection(id: number, content: string): PromptSection {
    return {
      id,
      name: PROMPT_SECTION_NAMES[id],
      content,
      tokens: estimateTokens(content),
      required: id <= 3 || id === 9,  // Sections 1-3 et 9 sont requises
      order: id,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORMATAGE DES SECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  private formatModeSection(mode: IAMode, profile: typeof DEFAULT_MODE_PROFILES[IAMode]): string {
    return `Mode: ${mode.toUpperCase()}
Niveau: ${profile.personality.technicalDepth > 0.7 ? 'Expert' : 'Standard'}
Permissions: ${Object.entries(profile.permissions).map(([k, v]) => `${k}:${v.level}`).join(', ')}`;
  }

  private formatObjectiveSection(raw: string): string {
    return raw;
  }

  private formatIntentSection(intent: IntentProfile): string {
    return `Catégorie: ${intent.category}
Confiance: ${(intent.confidence * 100).toFixed(0)}%
Actions requises: ${intent.requiredContext.slice(0, 5).join(', ')}
Complexité: ${intent.parsed.complexity > 0.7 ? 'Élevée' : intent.parsed.complexity > 0.4 ? 'Moyenne' : 'Faible'}`;
  }

  private formatCurrentContextSection(context: MergedContext): string {
    const physicalLayer = context.layers.get('physical');
    const _adaptiveLayer = context.layers.get('adaptive');

    const vitals = physicalLayer?.nodes.filter(n => n.type === 'vital') || [];
    const states = physicalLayer?.nodes.filter(n => n.type === 'state') || [];

    return `Système: ${vitals.length > 0 ? 'Actif' : 'N/A'}
Session: Active
Modules: ${states.length} états chargés
Couches: ${context.layers.size} actives`;
  }

  private formatMemorySection(context: MergedContext): string {
    const cognitiveLayer = context.layers.get('cognitive');
    if (!cognitiveLayer || cognitiveLayer.nodes.length === 0) {
      return '[Session] Aucune mémoire de session\n[Résumé] N/A\n[Long] N/A';
    }

    const memoryNodes = cognitiveLayer.nodes.filter(n => n.type === 'memory');
    const sessionMemory = memoryNodes.find(n => n.source.type === 'memory_session');
    const summarizedMemory = memoryNodes.find(n => n.source.type === 'memory_summarized');

    return `[Session] ${sessionMemory ? 'Contexte de session disponible' : 'Aucun'}
[Résumé] ${summarizedMemory ? 'Mémoire résumée disponible' : 'Aucun'}
[Long] Accès selon permissions du mode`;
  }

  private formatComplementarySection(context: MergedContext): string {
    const cognitiveLayer = context.layers.get('cognitive');
    const toolNodes = cognitiveLayer?.nodes.filter(n => n.type === 'tool') || [];
    const searchNodes = cognitiveLayer?.nodes.filter(n => n.type === 'search') || [];

    return `Outils: ${toolNodes.length > 0 ? 'Résultats disponibles' : 'Aucun résultat récent'}
Recherches: ${searchNodes.length > 0 ? 'Résultats disponibles' : 'Aucune recherche récente'}
Autres: Contexte enrichi selon les sources actives`;
  }

  private formatRulesSection(mode: IAMode, profile: typeof DEFAULT_MODE_PROFILES[IAMode]): string {
    const denied = profile.constraints.deniedSources;
    const limits = profile.constraints.rateLimits;

    return `Interdictions: ${denied.length > 0 ? denied.join(', ') : 'Aucune restriction majeure'}
Limites: ${limits.requestsPerMinute} req/min, ${limits.tokensPerMinute} tokens/min
Warnings: ${mode === 'autonomous' ? 'Mode autonome - toutes actions autorisées' : 'Respecter les limites du mode'}`;
  }

  private formatStyleSection(profile: typeof DEFAULT_MODE_PROFILES[IAMode]): string {
    const personality = profile.personality;
    return `Ton: ${personality.tone}
Style: ${personality.formality > 0.6 ? 'Formel' : personality.formality > 0.3 ? 'Semi-formel' : 'Décontracté'}
Énergie: ${personality.energy}
Personnalité IA: ${personality.name}`;
  }

  private formatFinalInstructionsSection(intent: IntentProfile, mode: IAMode): string {
    const urgencyNote = intent.parsed.urgency > 0.7 ? 'URGENT: Répondre rapidement et précisément.' : '';
    const complexityNote = intent.parsed.complexity > 0.7 ? 'Requête complexe: Structurer la réponse clairement.' : '';

    return `${urgencyNote}
${complexityNote}
- Répondre selon le mode ${mode}
- Respecter le ton et le style configurés
- Utiliser le contexte fourni de manière pertinente
- Être concis mais complet`.trim();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OPTIMISATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calcule le budget de tokens
   */
  private calculateTokenBudget(sections: PromptSection[]): TokenBudget {
    const allocated = new Map<number, number>();
    let total = 0;

    for (const section of sections) {
      allocated.set(section.id, section.tokens);
      total += section.tokens;
    }

    return {
      total,
      allocated,
      remaining: this.config.maxTotalTokens - total,
      overflow: total > this.config.maxTotalTokens,
    };
  }

  /**
   * Optimise le blueprint si nécessaire
   */
  private optimizeBlueprint(blueprint: PromptBlueprint): PromptBlueprint {
    if (!blueprint.tokenBudget.overflow) {
      return blueprint;
    }

    const hints: OptimizationHint[] = [];
    const optimizedSections = [...blueprint.sections];
    let currentTotal = blueprint.tokenBudget.total;
    const target = this.config.maxTotalTokens;

    // Trier les sections par priorité (non-requises d'abord)
    const sectionsByPriority = optimizedSections
      .map((s, index) => ({ section: s, index }))
      .sort((a, b) => {
        if (a.section.required !== b.section.required) {
          return a.section.required ? 1 : -1;
        }
        return b.section.tokens - a.section.tokens;
      });

    for (const { section, index } of sectionsByPriority) {
      if (currentTotal <= target) break;

      // Réduire les sections non-requises
      if (!section.required && section.tokens > 100) {
        const reduction = Math.min(section.tokens * 0.5, currentTotal - target);
        const newTokens = Math.max(50, section.tokens - reduction);

        hints.push({
          sectionId: section.id,
          type: 'compress',
          reason: 'Token budget exceeded',
          savings: section.tokens - newTokens,
        });

        optimizedSections[index] = {
          ...section,
          tokens: newTokens,
          content: this.truncateContent(section.content, newTokens),
        };

        currentTotal -= (section.tokens - newTokens);
      }
    }

    return {
      ...blueprint,
      sections: optimizedSections,
      tokenBudget: this.calculateTokenBudget(optimizedSections),
      optimizationHints: hints,
    };
  }

  /**
   * Tronque le contenu à un nombre de tokens cible
   */
  private truncateContent(content: string, targetTokens: number): string {
    const targetChars = targetTokens * 4;
    if (content.length <= targetChars) return content;

    return content.substring(0, targetChars - 3) + '...';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORMATAGE FINAL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Formate le prompt final (Singularité)
   */
  private formatFinalPrompt(
    blueprint: PromptBlueprint,
    intent: IntentProfile,
    mode: IAMode,
    startTime: number
  ): SingularityPrompt {
    // Construire le contenu textuel
    const lines: string[] = [];

    lines.push('╔═══════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                    TITANE∞ PROMPT — SINGULARITÉ                            ║');
    lines.push('╠═══════════════════════════════════════════════════════════════════════════╣');

    for (const section of blueprint.sections.sort((a, b) => a.order - b.order)) {
      lines.push('');
      lines.push(`┌─ ${section.id}. ${section.name} ${'─'.repeat(Math.max(0, 60 - section.name.length - 4))}┐`);

      const contentLines = section.content.split('\n');
      for (const line of contentLines) {
        lines.push(`│ ${line}`);
      }

      lines.push(`└${'─'.repeat(68)}┘`);
    }

    lines.push('');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════╝');

    const content = lines.join('\n');
    const tokenCount = estimateTokens(content);

    return {
      id: generateContextId('singularity'),
      content,
      sections: blueprint.sections,
      metadata: {
        version: 'vΩ∞Ω',
        mode,
        intent,
        generatedAt: Date.now(),
        processingTime: performance.now() - startTime,
        sourcesUsed: intent.requiredContext,
        compressionApplied: blueprint.optimizationHints.length > 0,
        fallbacksUsed: [],
      },
      tokenCount,
      hash: hashContent(content),
      auditTrail: [...this.auditLog],
      validationStatus: 'valid',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crée une réponse d'erreur
   */
  private createErrorResponse(
    code: string,
    message: string,
    recoverable: boolean,
    startTime: number
  ): PromptResponse {
    const error: PromptError = { code, message, recoverable };

    return {
      success: false,
      error,
      timestamp: Date.now(),
      processingTime: performance.now() - startTime,
    };
  }

  /**
   * Ajoute une entrée d'audit
   */
  private addAuditEntry(action: string, layer?: LayerId, details: string = ''): void {
    if (!this.config.auditLogging) return;

    this.auditLog.push({
      timestamp: Date.now(),
      action,
      layer,
      details,
      success: true,
    });

    // Limiter la taille du log
    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(-50);
    }
  }

  /**
   * Met à jour les moyennes
   */
  private updateAverages(tokens: number, processingTime: number): void {
    const n = this.stats.successfulPrompts;
    this.stats.averageTokenCount =
      (this.stats.averageTokenCount * (n - 1) + tokens) / n;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (n - 1) + processingTime) / n;
  }

  /**
   * Obtient les stats des couches
   */
  private getLayerStats(layers: Map<LayerId, ContextLayer>): Map<LayerId, { nodeCount: number; totalTokens: number; averageRelevance: number; compressionRatio: number; lastUpdated: number }> {
    const stats = new Map<LayerId, { nodeCount: number; totalTokens: number; averageRelevance: number; compressionRatio: number; lastUpdated: number }>();
    for (const [id, layer] of layers) {
      stats.set(id, { ...layer.stats });
    }
    return stats;
  }

  /**
   * Obtient la timeline de debug
   */
  private getTimeline(startTime: number): { timestamp: number; phase: string; duration: number; details: string }[] {
    return this.auditLog.map((entry, index) => ({
      timestamp: entry.timestamp,
      phase: entry.action,
      duration: index > 0 ? entry.timestamp - this.auditLog[index - 1].timestamp : entry.timestamp - startTime,
      details: entry.details,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les statistiques
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalPrompts: 0,
      successfulPrompts: 0,
      failedPrompts: 0,
      averageProcessingTime: 0,
      averageTokenCount: 0,
    };
  }

  /**
   * Vide le log d'audit
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Retourne le log d'audit
   */
  getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Parse rapidement une intention (sans assembler le prompt)
   */
  quickParseIntent(input: string): IntentProfile {
    return this.intentParser.parseIntent(input);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const promptAssembler = PromptAssembler.getInstance();
