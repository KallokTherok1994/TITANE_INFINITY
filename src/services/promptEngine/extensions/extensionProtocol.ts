/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Extension Protocol
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        extensionProtocol.ts
 * @version     vΩ∞Ω
 * @phase       D.3 — Protocole d'Extension
 *
 * Ce module définit le protocole standard pour étendre le Prompt Engine:
 * - Custom Context Sources (nouveaux adaptateurs de contexte)
 * - Custom Intent Handlers (nouveaux parsers d'intention)
 * - Custom Assemblers (nouveaux assembleurs de sections)
 * - Lifecycle Hooks (points d'interception)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type {
  LayerId as _LayerId,
  IAMode as _IAMode,
  ContextNode as _ContextNode,
  IntentProfile as _IntentProfile,
  PromptSection as _PromptSection,
  ContextSourceType as _ContextSourceType,
  ValidationStatus as _ValidationStatus,
} from '../promptEngine.config';

// Re-export pour usage dans les interfaces
export type LayerId = _LayerId;
export type IAMode = _IAMode;
export type ContextNode = _ContextNode;
export type IntentProfile = _IntentProfile;
export type PromptSection = _PromptSection;
export type ContextSourceType = _ContextSourceType;
export type ValidationStatus = _ValidationStatus;

// =============================================================================
// TYPES D'EXTENSION
// =============================================================================

/**
 * Type d'extension supporté
 */
export type ExtensionType =
  | 'context-source'
  | 'intent-handler'
  | 'section-assembler'
  | 'lifecycle-hook'
  | 'validator'
  | 'transformer';

/**
 * Priorité d'exécution de l'extension
 */
export type ExtensionPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

/**
 * État de l'extension
 */
export type ExtensionState = 'registered' | 'active' | 'disabled' | 'error' | 'unloaded';

// =============================================================================
// INTERFACES - EXTENSION DE BASE
// =============================================================================

/**
 * Métadonnées d'une extension
 */
export interface ExtensionMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: ExtensionType;
  priority: ExtensionPriority;
  dependencies?: string[];
  requiredModes?: IAMode[];
  targetLayers?: LayerId[];
}

/**
 * Configuration d'une extension
 */
export interface ExtensionConfig {
  enabled: boolean;
  priority: ExtensionPriority;
  timeout: number;
  retryOnError: boolean;
  maxRetries: number;
  fallbackBehavior: 'skip' | 'error' | 'default';
  customSettings?: Record<string, unknown>;
}

/**
 * Résultat d'exécution d'une extension
 */
export interface ExtensionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ExtensionError;
  executionTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * Erreur d'extension
 */
export interface ExtensionError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}

/**
 * Interface de base pour toutes les extensions
 */
export interface IPromptExtension {
  readonly metadata: ExtensionMetadata;
  readonly config: ExtensionConfig;
  state: ExtensionState;

  // Lifecycle
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;

  // Health
  healthCheck(): Promise<boolean>;
  getStats(): ExtensionStats;
}

/**
 * Statistiques d'une extension
 */
export interface ExtensionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  lastError?: ExtensionError;
}

// =============================================================================
// INTERFACES - CONTEXT SOURCE EXTENSION
// =============================================================================

/**
 * Contexte de collecte
 */
export interface CollectionContext {
  mode: IAMode;
  userId?: string;
  sessionId: string;
  timestamp: number;
  previousNodes?: ContextNode[];
}

/**
 * Résultat de collecte de contexte
 */
export interface ContextCollectionResult {
  sourceId: string;
  nodes: ContextNode[];
  metadata?: {
    fetchTime: number;
    cached: boolean;
    stale: boolean;
  };
}

/**
 * Extension de source de contexte
 */
export interface IContextSourceExtension extends IPromptExtension {
  readonly sourceType: ContextSourceType;
  readonly targetLayer: LayerId;

  /**
   * Collecte les nodes de contexte
   */
  collect(context: CollectionContext): Promise<ContextCollectionResult>;

  /**
   * Vérifie si la source est disponible
   */
  isAvailable(): Promise<boolean>;

  /**
   * Invalide le cache de la source
   */
  invalidateCache(): void;
}

// =============================================================================
// INTERFACES - INTENT HANDLER EXTENSION
// =============================================================================

/**
 * Contexte de parsing d'intention
 */
export interface IntentParsingContext {
  rawInput: string;
  mode: IAMode;
  previousIntents?: IntentProfile[];
  hints?: string[];
}

/**
 * Résultat de parsing d'intention
 */
export interface IntentParsingResult {
  handled: boolean;
  intent?: Partial<IntentProfile>;
  confidence: number;
  shouldContinue: boolean;
}

/**
 * Extension de handler d'intention
 */
export interface IIntentHandlerExtension extends IPromptExtension {
  readonly intentCategories: string[];
  readonly patterns: RegExp[];

  /**
   * Tente de parser l'intention
   */
  parse(context: IntentParsingContext): Promise<IntentParsingResult>;

  /**
   * Vérifie si l'extension peut gérer cet input
   */
  canHandle(input: string): boolean;
}

// =============================================================================
// INTERFACES - SECTION ASSEMBLER EXTENSION
// =============================================================================

/**
 * Contexte d'assemblage de section
 */
export interface SectionAssemblyContext {
  sectionName: string;
  mode: IAMode;
  intent: IntentProfile;
  availableNodes: ContextNode[];
  tokenBudget: number;
}

/**
 * Résultat d'assemblage de section
 */
export interface SectionAssemblyResult {
  section: PromptSection;
  tokensUsed: number;
  nodesIncluded: string[];
}

/**
 * Extension d'assembleur de section
 */
export interface ISectionAssemblerExtension extends IPromptExtension {
  readonly targetSections: string[];

  /**
   * Assemble une section du prompt
   */
  assemble(context: SectionAssemblyContext): Promise<SectionAssemblyResult>;

  /**
   * Estime le nombre de tokens nécessaires
   */
  estimateTokens(context: SectionAssemblyContext): number;
}

// =============================================================================
// INTERFACES - LIFECYCLE HOOK EXTENSION
// =============================================================================

/**
 * Points d'interception du lifecycle
 */
export type LifecycleHookPoint =
  | 'pre-parse'
  | 'post-parse'
  | 'pre-collect'
  | 'post-collect'
  | 'pre-assemble'
  | 'post-assemble'
  | 'pre-validate'
  | 'post-validate'
  | 'on-error'
  | 'on-complete';

/**
 * Contexte du hook
 */
export interface HookContext {
  hookPoint: LifecycleHookPoint;
  timestamp: number;
  mode: IAMode;
  data: unknown;
  previousHookResults?: unknown[];
}

/**
 * Résultat du hook
 */
export interface HookResult {
  modified: boolean;
  data?: unknown;
  abort?: boolean;
  abortReason?: string;
}

/**
 * Extension de hook lifecycle
 */
export interface ILifecycleHookExtension extends IPromptExtension {
  readonly hookPoints: LifecycleHookPoint[];

  /**
   * Exécute le hook
   */
  execute(context: HookContext): Promise<HookResult>;

  /**
   * Vérifie si le hook doit s'exécuter
   */
  shouldExecute(context: HookContext): boolean;
}

// =============================================================================
// INTERFACES - VALIDATOR EXTENSION
// =============================================================================

/**
 * Contexte de validation
 */
export interface ValidationContext {
  target: 'input' | 'context' | 'prompt' | 'output';
  data: unknown;
  mode: IAMode;
  rules?: string[];
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
  valid: boolean;
  status: ValidationStatus;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sanitized?: unknown;
}

/**
 * Erreur de validation
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'critical';
}

/**
 * Avertissement de validation
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * Extension de validateur
 */
export interface IValidatorExtension extends IPromptExtension {
  readonly validationTargets: ValidationContext['target'][];

  /**
   * Valide les données
   */
  validate(context: ValidationContext): Promise<ValidationResult>;

  /**
   * Sanitize les données (optionnel)
   */
  sanitize?(data: unknown): unknown;
}

// =============================================================================
// INTERFACES - TRANSFORMER EXTENSION
// =============================================================================

/**
 * Contexte de transformation
 */
export interface TransformContext {
  stage: 'input' | 'context' | 'assembly' | 'output';
  data: unknown;
  mode: IAMode;
  options?: Record<string, unknown>;
}

/**
 * Résultat de transformation
 */
export interface TransformResult {
  transformed: boolean;
  data: unknown;
  changes?: string[];
}

/**
 * Extension de transformateur
 */
export interface ITransformerExtension extends IPromptExtension {
  readonly transformStages: TransformContext['stage'][];

  /**
   * Transforme les données
   */
  transform(context: TransformContext): Promise<TransformResult>;

  /**
   * Vérifie si la transformation est applicable
   */
  isApplicable(context: TransformContext): boolean;
}

// =============================================================================
// REGISTRE D'EXTENSIONS
// =============================================================================

/**
 * Événement du registre
 */
export interface RegistryEvent {
  type: 'registered' | 'activated' | 'deactivated' | 'unregistered' | 'error';
  extensionId: string;
  timestamp: number;
  details?: unknown;
}

/**
 * Listener d'événements
 */
export type RegistryEventListener = (event: RegistryEvent) => void;

/**
 * Interface du registre d'extensions
 */
export interface IExtensionRegistry {
  // Registration
  register<T extends IPromptExtension>(extension: T): Promise<void>;
  unregister(extensionId: string): Promise<void>;

  // Query
  get<T extends IPromptExtension>(extensionId: string): T | undefined;
  getAll(): IPromptExtension[];
  getByType<T extends IPromptExtension>(type: ExtensionType): T[];
  getActive(): IPromptExtension[];

  // Lifecycle
  activateAll(): Promise<void>;
  deactivateAll(): Promise<void>;

  // Events
  on(event: RegistryEvent['type'], listener: RegistryEventListener): void;
  off(event: RegistryEvent['type'], listener: RegistryEventListener): void;

  // Health
  healthCheck(): Promise<Map<string, boolean>>;
  getStats(): Map<string, ExtensionStats>;
}

// =============================================================================
// CLASSE ABSTRAITE DE BASE
// =============================================================================

/**
 * Classe de base pour les extensions
 */
export abstract class BasePromptExtension implements IPromptExtension {
  abstract readonly metadata: ExtensionMetadata;
  config: ExtensionConfig;
  state: ExtensionState = 'registered';

  protected stats: ExtensionStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    lastExecutionTime: 0,
  };

  constructor(config?: Partial<ExtensionConfig>) {
    this.config = {
      enabled: true,
      priority: 'normal',
      timeout: 5000,
      retryOnError: true,
      maxRetries: 3,
      fallbackBehavior: 'skip',
      ...config,
    };
  }

  async initialize(): Promise<void> {
    console.log(`[Extension:${this.metadata?.id}] Initializing...`);
    this.state = 'registered';
  }

  async activate(): Promise<void> {
    if (this.state === 'error') {
      throw new Error(`Cannot activate extension in error state: ${this.metadata?.id}`);
    }
    console.log(`[Extension:${this.metadata?.id}] Activating...`);
    this.state = 'active';
  }

  async deactivate(): Promise<void> {
    console.log(`[Extension:${this.metadata?.id}] Deactivating...`);
    this.state = 'disabled';
  }

  async dispose(): Promise<void> {
    console.log(`[Extension:${this.metadata?.id}] Disposing...`);
    this.state = 'unloaded';
  }

  async healthCheck(): Promise<boolean> {
    return this.state === 'active' && this.config.enabled;
  }

  getStats(): ExtensionStats {
    return { ...this.stats };
  }

  /**
   * Wrapper pour exécuter avec tracking des stats
   */
  protected async executeWithStats<T>(
    operation: () => Promise<T>
  ): Promise<ExtensionResult<T>> {
    const startTime = performance.now();
    this.stats.totalExecutions++;

    try {
      const data = await operation();
      const executionTime = performance.now() - startTime;

      this.stats.successfulExecutions++;
      this.updateAverageTime(executionTime);

      return {
        success: true,
        data,
        executionTime,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.stats.failedExecutions++;
      this.updateAverageTime(executionTime);

      const extensionError: ExtensionError = {
        code: 'EXTENSION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
      };

      this.stats.lastError = extensionError;

      return {
        success: false,
        error: extensionError,
        executionTime,
      };
    }
  }

  private updateAverageTime(newTime: number): void {
    const total = this.stats.totalExecutions;
    const currentAvg = this.stats.averageExecutionTime;
    this.stats.averageExecutionTime = (currentAvg * (total - 1) + newTime) / total;
    this.stats.lastExecutionTime = newTime;
  }
}

// =============================================================================
// REGISTRE D'EXTENSIONS - IMPLÉMENTATION
// =============================================================================

/**
 * Registre singleton des extensions
 */
export class ExtensionRegistry implements IExtensionRegistry {
  private static instance: ExtensionRegistry | null = null;

  private extensions: Map<string, IPromptExtension> = new Map();
  private listeners: Map<RegistryEvent['type'], Set<RegistryEventListener>> = new Map();

  private constructor() {
    console.log('[ExtensionRegistry] 🔌 Initialized');
  }

  static getInstance(): ExtensionRegistry {
    if (!ExtensionRegistry.instance) {
      ExtensionRegistry.instance = new ExtensionRegistry();
    }
    return ExtensionRegistry.instance;
  }

  static resetInstance(): void {
    if (ExtensionRegistry.instance) {
      ExtensionRegistry.instance.extensions.clear();
      ExtensionRegistry.instance.listeners.clear();
    }
    ExtensionRegistry.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTRATION
  // ─────────────────────────────────────────────────────────────────────────

  async register<T extends IPromptExtension>(extension: T): Promise<void> {
    const id = extension.metadata?.id;
    const dependencies = extension.metadata?.dependencies ?? [];

    if (this.extensions.has(id)) {
      throw new Error(`Extension already registered: ${id}`);
    }

    // Check dependencies
    for (const dep of dependencies) {
      if (!this.extensions.has(dep)) {
        throw new Error(`Missing dependency: ${dep} for extension: ${id}`);
      }
    }

    await extension.initialize();
    this.extensions.set(id, extension);
    this.emit('registered', id);

    console.log(`[ExtensionRegistry] ✅ Registered: ${id}`);
  }

  async unregister(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      return;
    }

    await extension.dispose();
    this.extensions.delete(extensionId);
    this.emit('unregistered', extensionId);

    console.log(`[ExtensionRegistry] 🗑️ Unregistered: ${extensionId}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUERY
  // ─────────────────────────────────────────────────────────────────────────

  get<T extends IPromptExtension>(extensionId: string): T | undefined {
    return this.extensions.get(extensionId) as T | undefined;
  }

  getAll(): IPromptExtension[] {
    return Array.from(this.extensions.values());
  }

  getByType<T extends IPromptExtension>(type: ExtensionType): T[] {
    return this.getAll().filter(ext => ext.metadata?.type === type) as T[];
  }

  getActive(): IPromptExtension[] {
    return this.getAll().filter(ext => ext.state === 'active' && ext.config.enabled);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  async activateAll(): Promise<void> {
    const sorted = this.sortByPriority(this.getAll());

    for (const extension of sorted) {
      try {
        await extension.activate();
        this.emit('activated', extension.metadata?.id);
      } catch (error) {
        console.error(
          `[ExtensionRegistry] Failed to activate: ${extension.metadata?.id}`,
          error
        );
        this.emit('error', extension.metadata?.id, { error });
      }
    }
  }

  async deactivateAll(): Promise<void> {
    const sorted = this.sortByPriority(this.getAll()).reverse();

    for (const extension of sorted) {
      try {
        await extension.deactivate();
        this.emit('deactivated', extension.metadata?.id);
      } catch (error) {
        console.error(
          `[ExtensionRegistry] Failed to deactivate: ${extension.metadata?.id}`,
          error
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  on(event: RegistryEvent['type'], listener: RegistryEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  off(event: RegistryEvent['type'], listener: RegistryEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(
    type: RegistryEvent['type'],
    extensionId: string,
    details?: unknown
  ): void {
    const event: RegistryEvent = {
      type,
      extensionId,
      timestamp: Date.now(),
      details,
    };

    this.listeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[ExtensionRegistry] Listener error:', error);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HEALTH
  // ─────────────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      this.getAll().map(async ext => {
        try {
          const healthy = await ext.healthCheck();
          results.set(ext.metadata?.id, healthy);
        } catch {
          results.set(ext.metadata?.id, false);
        }
      })
    );

    return results;
  }

  getStats(): Map<string, ExtensionStats> {
    const stats = new Map<string, ExtensionStats>();
    this.getAll().forEach(ext => {
      stats.set(ext.metadata?.id, ext.getStats());
    });
    return stats;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private sortByPriority(extensions: IPromptExtension[]): IPromptExtension[] {
    const priorityOrder: Record<ExtensionPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
      background: 4,
    };

    return [...extensions].sort(
      (a, b) => priorityOrder[a.config.priority] - priorityOrder[b.config.priority]
    );
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const extensionRegistry = ExtensionRegistry.getInstance();
