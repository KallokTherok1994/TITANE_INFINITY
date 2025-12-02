/**
 * TITANE∞ vΩ∞ — PROMPT ENGINE CONFIG
 * Super Prompt #7: Configuration pour Prompt Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type { PromptCategory } from '@/types/promptEngine';

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

export const CATEGORY_CONFIG: Record<PromptCategory, {
  name: string;
  description: string;
  icon: string;
  color: string;
}> = {
  system: {
    name: 'Système',
    description: 'Prompts système de base',
    icon: '⚙️',
    color: '#6366F1',
  },
  persona: {
    name: 'Persona',
    description: 'Personnalités IA',
    icon: '🎭',
    color: '#8B5CF6',
  },
  task: {
    name: 'Tâche',
    description: 'Tâches spécifiques',
    icon: '📋',
    color: '#10B981',
  },
  context: {
    name: 'Contexte',
    description: 'Contexte additionnel',
    icon: '📚',
    color: '#F59E0B',
  },
  format: {
    name: 'Format',
    description: 'Formatage des réponses',
    icon: '📝',
    color: '#EC4899',
  },
  safety: {
    name: 'Sécurité',
    description: 'Consignes de sécurité',
    icon: '🛡️',
    color: '#EF4444',
  },
};

// ============================================================================
// PROMPT LIMITS
// ============================================================================

export const PROMPT_LIMITS = {
  // Longueur
  maxTemplateLength: 10000,
  maxNameLength: 100,
  maxDescriptionLength: 500,
  maxVariableNameLength: 50,

  // Quantités
  maxVariablesPerPrompt: 20,
  maxPromptsPerChain: 10,
  maxChainsPerUser: 100,
  maxPromptsTotal: 500,

  // Compilation
  maxCompiledTokens: 4096,
  maxCompilationsPerMinute: 60,

  // Cache
  compiledCacheSize: 100,
  compiledCacheTTLMs: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// CHAIN CONFIGURATION
// ============================================================================

export const CHAIN_CONFIG = {
  // Exécution
  defaultMaxIterations: 10,
  defaultStopOnError: true,

  // Timeouts
  stepTimeoutMs: 30000, // 30s par étape
  chainTimeoutMs: 300000, // 5 min total

  // Retry
  maxRetries: 3,
  retryDelayMs: 1000,

  // Parallélisation
  allowParallel: false,
  maxParallelSteps: 5,
} as const;

// ============================================================================
// COMPILATION CONFIGURATION
// ============================================================================

export const COMPILATION_CONFIG = {
  // Variables
  variablePattern: /\{\{(\w+)\}\}/g,
  strictMode: false, // true = erreur si variable non résolue

  // Tokens
  tokenEstimateRatio: 0.25, // ~4 caractères par token

  // Optimisation
  trimWhitespace: true,
  collapseNewlines: true,
  maxNewlines: 2,

  // Validation
  validateOutput: true,
  checkBalancedBrackets: true,
} as const;

// ============================================================================
// DEFAULT PROMPTS
// ============================================================================

export interface DefaultPrompt {
  name: string;
  category: PromptCategory;
  template: string;
  description?: string;
  variables?: Array<{
    name: string;
    description: string;
    defaultValue?: string;
    required: boolean;
  }>;
}

export const DEFAULT_PROMPTS: DefaultPrompt[] = [
  {
    name: 'TITANE System',
    category: 'system',
    template: `Tu es TITANE∞, un assistant IA avancé créé pour Kevin. Tu possèdes une personnalité évolutive et des capacités cognitives adaptatives.

Mode actuel: {{mode}}
Date: {{date}}

Consignes:
- Réponds de manière concise et pertinente
- Adapte ton style au contexte
- Utilise ta mémoire pour personnaliser les réponses`,
    description: 'Prompt système principal de TITANE∞',
    variables: [
      { name: 'mode', description: 'Mode de chat actif', defaultValue: 'assistant', required: true },
      { name: 'date', description: 'Date actuelle', required: true },
    ],
  },
  {
    name: 'Context Injection',
    category: 'context',
    template: `Contexte supplémentaire:
{{context}}

Garde ce contexte en mémoire pour la conversation.`,
    description: 'Injection de contexte additionnel',
    variables: [
      { name: 'context', description: 'Contexte à injecter', required: true },
    ],
  },
  {
    name: 'Format Response',
    category: 'format',
    template: `Format de réponse requis: {{format}}

{{instructions}}`,
    description: 'Consignes de formatage',
    variables: [
      { name: 'format', description: 'Type de format (markdown, json, plain)', defaultValue: 'markdown', required: true },
      { name: 'instructions', description: 'Instructions spécifiques', defaultValue: '', required: false },
    ],
  },
  {
    name: 'Safety Guidelines',
    category: 'safety',
    template: `Consignes de sécurité:
- Ne jamais divulguer d'informations sensibles
- Respecter les limites éthiques
- Signaler tout comportement suspect
- Protéger la vie privée des utilisateurs`,
    description: 'Consignes de sécurité par défaut',
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const promptEngineConfig = {
  categories: CATEGORY_CONFIG,
  limits: PROMPT_LIMITS,
  chain: CHAIN_CONFIG,
  compilation: COMPILATION_CONFIG,
  defaultPrompts: DEFAULT_PROMPTS,
};

export default promptEngineConfig;
