/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Index & Orchestrator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Point d'entrée unifié pour le Prompt Engine.
 * Expose l'API principale et les sous-modules.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// =============================================================================
// EXPORTS - CONFIGURATION & TYPES
// =============================================================================

export type {
  // Types de base
  LayerId,
  IAMode,
  ContextSourceType,
  IntentCategory,
  CompressionLevel,
  ValidationStatus,
  ContextNodeType,
  PriorityLevel,
  ConversationTone,
  EnergyLevel,

  // Interfaces - Context Nodes
  ContextSource,
  ContextNode,
  NodeMetadata,
  ContextBundle,

  // Interfaces - Layers
  LayerMetadata,
  FusionRule,
  FusionCondition,
  FusionAction,
  ContextLayer,
  LayerStats,

  // Interfaces - Intent
  ParsedIntent,
  IntentEntity,
  IntentProfile,

  // Interfaces - Mode & Profile
  PersonalityConfig,
  ModeConstraints,
  RateLimitConfig,
  FallbackChain,
  FallbackStep,
  ModeProfile,

  // Interfaces - Permissions
  ContextAccess,
  AccessCondition,
  PermissionSet,
  PermissionPolicy,

  // Interfaces - Merged Context
  ConflictReport,
  ConflictResolution,
  MergedContext,

  // Interfaces - Prompt Blueprint
  PromptSection,
  BlueprintMetadata,
  TokenBudget,
  OptimizationHint,
  PromptBlueprint,

  // Interfaces - Singularity Prompt
  AuditEntry,
  PromptMetadata,
  SingularityPrompt,

  // Interfaces - Engine Config
  CollectorConfig,
  FilterConfig,
  CompressionConfig,
  PromptEngineConfig,

  // Interfaces - Request/Response
  PromptRequest,
  PromptRequestOptions,
  PromptResponse,
  PromptError,
  PromptDebugInfo,
  DebugTimelineEntry,
} from './promptEngine.config';

export {
  // Constantes
  DEFAULT_LAYER_METADATA,
  DEFAULT_MODE_PROFILES,
  PROMPT_SECTION_NAMES,
  DEFAULT_PROMPT_ENGINE_CONFIG,
  INTENT_KEYWORDS,
  SOURCE_PRIORITY,
  LAYER_METADATA,
  MODE_PROFILES,
  PROMPT_ENGINE_CONFIG,

  // Fonctions utilitaires
  generateContextId,
  hashContent,
  estimateTokens,
  validatePromptRequest,
  getSourcePriority,
  isSourceAllowedForMode,
  createEmptyContextNode,
  createEmptyContextLayer,
} from './promptEngine.config';

// =============================================================================
// EXPORTS - CLASSES
// =============================================================================

export { IntentParser, intentParser } from './intentParser';
export { ContextCollector, contextCollector } from './contextCollector';
export { PromptAssembler, promptAssembler } from './promptAssembler';

// =============================================================================
// ORCHESTRATEUR UNIFIÉ
// =============================================================================

import type {
  PromptRequest,
  PromptResponse,
  IAMode,
  IntentProfile,
  PromptEngineConfig,
} from './promptEngine.config';

import { IntentParser } from './intentParser';
import { ContextCollector } from './contextCollector';
import { PromptAssembler } from './promptAssembler';
import { generateContextId } from './promptEngine.config';

/**
 * Orchestrateur du Prompt Engine TITANE∞
 * Point d'entrée principal pour la génération de prompts
 */
export class PromptEngineOrchestrator {
  private static instance: PromptEngineOrchestrator | null = null;

  private intentParser: IntentParser;
  private contextCollector: ContextCollector;
  private promptAssembler: PromptAssembler;
  private currentMode: IAMode = 'standard';
  private initialized = false;

  private constructor() {
    this.intentParser = IntentParser.getInstance();
    this.contextCollector = ContextCollector.getInstance();
    this.promptAssembler = PromptAssembler.getInstance();
    console.log('[PromptEngineOrchestrator] 🚀 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): PromptEngineOrchestrator {
    if (!PromptEngineOrchestrator.instance) {
      PromptEngineOrchestrator.instance = new PromptEngineOrchestrator();
    }
    return PromptEngineOrchestrator.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    IntentParser.resetInstance();
    ContextCollector.resetInstance();
    PromptAssembler.resetInstance();
    PromptEngineOrchestrator.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API PRINCIPALE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialise le moteur
   */
  async initialize(config?: Partial<PromptEngineConfig>): Promise<void> {
    if (config) {
      this.promptAssembler.configure(config);
    }
    this.initialized = true;
    console.log('[PromptEngineOrchestrator] ✅ Engine initialized');
  }

  /**
   * Génère un prompt complet
   */
  async generatePrompt(userInput: string, mode?: IAMode): Promise<PromptResponse> {
    const request: PromptRequest = {
      id: generateContextId('request'),
      userInput,
      mode: mode || this.currentMode,
      timestamp: Date.now(),
    };

    return this.promptAssembler.assemblePrompt(request);
  }

  /**
   * Génère un prompt avec options avancées
   */
  async generatePromptAdvanced(request: PromptRequest): Promise<PromptResponse> {
    return this.promptAssembler.assemblePrompt(request);
  }

  /**
   * Parse une intention rapidement
   */
  parseIntent(userInput: string): IntentProfile {
    return this.intentParser.parseIntent(userInput);
  }

  /**
   * Catégorise rapidement une entrée
   */
  quickCategorize(userInput: string): string {
    return this.intentParser.quickCategorize(userInput);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION DU MODE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Définit le mode IA
   */
  setMode(mode: IAMode): void {
    this.currentMode = mode;
    console.log(`[PromptEngineOrchestrator] 🔄 Mode changed to: ${mode}`);
  }

  /**
   * Retourne le mode actuel
   */
  getMode(): IAMode {
    return this.currentMode;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCÈS AUX SOUS-MODULES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Accès au parser d'intentions
   */
  getIntentParser(): IntentParser {
    return this.intentParser;
  }

  /**
   * Accès au collecteur de contexte
   */
  getContextCollector(): ContextCollector {
    return this.contextCollector;
  }

  /**
   * Accès à l'assembleur de prompts
   */
  getPromptAssembler(): PromptAssembler {
    return this.promptAssembler;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATISTIQUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les statistiques combinées
   */
  getStats(): {
    intent: ReturnType<IntentParser['getStats']>;
    collector: ReturnType<ContextCollector['getStats']>;
    assembler: ReturnType<PromptAssembler['getStats']>;
  } {
    return {
      intent: this.intentParser.getStats(),
      collector: this.contextCollector.getStats(),
      assembler: this.promptAssembler.getStats(),
    };
  }

  /**
   * Réinitialise toutes les statistiques
   */
  resetStats(): void {
    this.intentParser.resetStats();
    this.contextCollector.resetStats();
    this.promptAssembler.resetStats();
  }

  /**
   * Vide tous les caches
   */
  clearCaches(): void {
    this.intentParser.clearCache();
    this.contextCollector.clearCache();
  }

  /**
   * Retourne le statut du moteur
   */
  getStatus(): {
    initialized: boolean;
    mode: IAMode;
    healthy: boolean;
  } {
    return {
      initialized: this.initialized,
      mode: this.currentMode,
      healthy: true,
    };
  }
}

// =============================================================================
// INSTANCE SINGLETON EXPORTÉE
// =============================================================================

export const promptEngine = PromptEngineOrchestrator.getInstance();

// Export par défaut
export default promptEngine;
