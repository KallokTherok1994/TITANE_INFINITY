/**
 * TITANE∞ vΩ∞ — TYPES PROMPT ENGINE
 * Super Prompt #7: Gestion dynamique des prompts système
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// PROMPTS
// ============================================================================

export type PromptCategory =
  | 'system'      // Prompts système de base
  | 'persona'     // Personnalités IA
  | 'task'        // Tâches spécifiques
  | 'context'     // Contexte additionnel
  | 'format'      // Formatage des réponses
  | 'safety';     // Consignes de sécurité

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  category: PromptCategory;

  // Contenu
  template: string;
  variables: PromptVariable[];

  // Versioning
  version: string;
  createdAt: number;
  updatedAt: number;

  // Métadonnées
  author?: string;
  tags: string[];
  isDefault: boolean;
  isActive: boolean;

  // Statistiques
  usageCount: number;
  lastUsedAt?: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: unknown;
  validation?: PromptVariableValidation;
}

export interface PromptVariableValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: unknown[];
}

// ============================================================================
// CHAÎNES DE PROMPTS
// ============================================================================

export interface PromptChain {
  id: string;
  name: string;
  description?: string;

  // Étapes
  steps: PromptChainStep[];

  // Configuration
  stopOnError: boolean;
  maxIterations: number;

  // État
  isActive: boolean;
}

export interface PromptChainStep {
  id: string;
  order: number;
  promptId: string;

  // Conditions
  condition?: string;

  // Transformation
  inputTransform?: string;
  outputTransform?: string;

  // Options
  optional: boolean;
  retryOnFail: boolean;
  maxRetries: number;
}

export interface PromptChainExecution {
  id: string;
  chainId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';

  // Résultats par étape
  stepResults: PromptChainStepResult[];

  // Timing
  startedAt: number;
  completedAt?: number;
  totalDurationMs?: number;
}

export interface PromptChainStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  input: unknown;
  output?: unknown;
  error?: string;
  durationMs?: number;
}

// ============================================================================
// GÉNÉRATION DYNAMIQUE
// ============================================================================

export interface PromptContext {
  // Contexte utilisateur
  userId?: string;
  sessionId: string;
  chatMode?: string;

  // Contexte conversation
  recentMessages: { role: string; content: string }[];
  workingMemory: string[];

  // Contexte système
  timestamp: number;
  locale: string;
  capabilities: string[];
}

export interface CompiledPrompt {
  id: string;
  originalPromptId: string;
  content: string;
  tokenCount: number;
  compiledAt: number;
  context: PromptContext;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface PromptEngineConfig {
  // Limites
  maxPromptLength: number;
  maxChainSteps: number;
  maxConcurrentCompilations: number;

  // Cache
  cacheEnabled: boolean;
  cacheTTL: number;

  // Sécurité
  sanitizeOutput: boolean;
  blockDangerousPatterns: boolean;
}

export interface PromptEngineState {
  isInitialized: boolean;

  // Prompts
  prompts: Map<string, Prompt>;
  activePrompts: string[];

  // Chaînes
  chains: Map<string, PromptChain>;
  activeExecutions: PromptChainExecution[];

  // Cache
  compiledCache: Map<string, CompiledPrompt>;
}
