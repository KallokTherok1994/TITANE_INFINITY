/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.LOCAL — AI MODEL TYPES
 *   Types pour la gestion des modèles IA (local + cloud)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Providers IA supportés
 */
export type AIProvider = 'gemini' | 'gpt' | 'titane-local' | 'anthropic';

/**
 * Configuration d'un modèle IA
 */
export interface AIModelConfig {
  /** Provider du modèle */
  provider: AIProvider;

  /** Nom du modèle */
  modelName: string;

  /** Endpoint API */
  endpoint: string;

  /** Clé API (si cloud) */
  apiKey?: string;

  /** Modèle local uniquement */
  localOnly: boolean;

  /** Optimisé pour DEV MODE */
  devMode: boolean;

  /** Modèle de fallback si échec */
  fallback?: AIProvider;

  /** Paramètres de génération */
  parameters?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    stopSequences?: string[];
  };
}

/**
 * Option de modèle pour le sélecteur UI
 */
export interface AIModelOption {
  value: AIProvider;
  label: string;
  description: string;
  icon: string;
  localOnly: boolean;
  devMode?: boolean;
  badge?: string;
}

/**
 * Configuration de tous les modèles disponibles
 */
export const AI_MODELS: Record<AIProvider, AIModelConfig> = {
  'gemini': {
    provider: 'gemini',
    modelName: 'gemini-2.0-flash-exp',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    localOnly: false,
    devMode: false,
    fallback: 'titane-local',
    parameters: {
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 8192,
    },
  },

  'gpt': {
    provider: 'gpt',
    modelName: 'gpt-4-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    localOnly: false,
    devMode: false,
    fallback: 'titane-local',
    parameters: {
      temperature: 0.7,
      topP: 1.0,
      maxTokens: 4096,
    },
  },

  'titane-local': {
    provider: 'titane-local',
    modelName: 'titane-local',
    endpoint: 'http://localhost:11434',
    localOnly: true,
    devMode: true,
    fallback: 'gemini',
    parameters: {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      stopSequences: ['<|end|>', '<|eot_id|>'],
    },
  },

  'anthropic': {
    provider: 'anthropic',
    modelName: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    localOnly: false,
    devMode: false,
    fallback: 'titane-local',
    parameters: {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 4096,
    },
  },
};

/**
 * Options pour le sélecteur UI
 */
export const MODEL_OPTIONS: AIModelOption[] = [
  {
    value: 'gemini',
    label: 'Gemini 2.0 Flash',
    description: 'Google - Cloud - Rapide et polyvalent',
    icon: '🌐',
    localOnly: false,
    badge: 'CLOUD',
  },
  {
    value: 'gpt',
    label: 'GPT-4 Turbo',
    description: 'OpenAI - Cloud - Très performant',
    icon: '🤖',
    localOnly: false,
    badge: 'CLOUD',
  },
  {
    value: 'titane-local',
    label: 'TITANE Local',
    description: 'LLama 3.1 - Local - DEV MODE optimisé',
    icon: '🧠',
    localOnly: true,
    devMode: true,
    badge: 'LOCAL',
  },
  {
    value: 'anthropic',
    label: 'Claude 3.5 Sonnet',
    description: 'Anthropic - Cloud - Raisonnement avancé',
    icon: '🎭',
    localOnly: false,
    badge: 'CLOUD',
  },
];

/**
 * Récupère la config d'un modèle
 */
export function getModelConfig(provider: AIProvider): AIModelConfig {
  return AI_MODELS[provider];
}

/**
 * Récupère l'option UI d'un modèle
 */
export function getModelOption(provider: AIProvider): AIModelOption | undefined {
  return MODEL_OPTIONS.find(opt => opt.value === provider);
}

/**
 * Vérifie si un modèle est local
 */
export function isLocalModel(provider: AIProvider): boolean {
  return AI_MODELS[provider].localOnly;
}

/**
 * Vérifie si un modèle est optimisé pour DEV MODE
 */
export function isDevModeModel(provider: AIProvider): boolean {
  return AI_MODELS[provider].devMode;
}

/**
 * Récupère le fallback d'un modèle
 */
export function getFallbackModel(provider: AIProvider): AIProvider | undefined {
  return AI_MODELS[provider].fallback;
}

/**
 * Requête IA
 */
export interface AIRequest {
  prompt: string;
  provider: AIProvider;
  stream?: boolean;
  context?: string[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Réponse IA
 */
export interface AIResponse {
  content: string;
  provider: AIProvider;
  usedFallback: boolean;
  model: string;
  tokensUsed?: number;
  latency?: number;
  error?: string;
}

/**
 * Statut Ollama
 */
export interface OllamaStatus {
  available: boolean;
  version?: string;
  models: string[];
  lastCheck: number;
}

/**
 * Configuration IA globale
 */
export interface AIConfig {
  currentProvider: AIProvider;
  ollamaStatus: OllamaStatus;
  devMode: boolean;
  fallbackEnabled: boolean;
  autoSwitchOnError: boolean;
}
