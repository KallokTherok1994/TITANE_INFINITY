/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.19.3Ω — IA SERVICE TYPES
 * Types pour l'intégration OpenAI GPT + Anthropic Claude
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Providers IA supportés
 */
export type IAProvider = 'gemini' | 'openai' | 'claude' | 'ollama' | 'local';

/**
 * Alias de providers (any: any)
 */
export const ProviderAliases: Record<string, IAProvider> = {
  gpt: 'openai',
  'gpt-4': 'openai',
  anthropic: 'claude',
  'claude-3': 'claude',
};

/**
 * Requête pour définir une clé API
 */
export interface SetAPIKeyRequest {
  service: IAProvider;
  key: string;
}

/**
 * Résultat de commande générique
 */
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Statut d'un provider IA
 */
export interface ProviderStatus {
  service: IAProvider;
  name: string;
  icon: string;
  active: boolean;
  valid?: boolean;
}

/**
 * Requête de génération IA
 */
export interface IAGenerateRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
  system_prompt???: string | null;
  temperature?: number;
  max_tokens?: number | null;
  preferred_engine???: string | null;
}

/**
 * Réponse de génération IA
 */
export interface IAGenerateResponse {
  content: string;
  engine_used: string;
  model: string;
  tokens_used: number;
  latency_ms: number;
  fallback_used: boolean;
}

/**
 * Engines IA disponibles
 */
export type IAEngine = 'TitaneLocal' | 'Gemini' | 'OpenAI' | 'Claude';

/**
 * Mapping des noms d'engines pour affichage
 */
export const EngineDisplayNames: Record<string, string> = {
  TitaneLocal: 'TITANE Local',
  Gemini: 'Google Gemini',
  OpenAI: 'OpenAI GPT-4',
  Claude: 'Anthropic Claude',
};

/**
 * Icônes des providers
 */
export const ProviderIcons: Record<IAProvider, string> = {
  gemini: '🔷',
  openai: '🟢',
  claude: '🟣',
  ollama: '🦙',
  local: '🏠',
};

/**
 * Noms complets des providers
 */
export const ProviderNames: Record<IAProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI GPT-4',
  claude: 'Anthropic Claude 3.5',
  ollama: 'Ollama Local',
  local: 'TITANE Local',
};

/**
 * Validation de clé API
 */
export interface APIKeyValidation {
  valid: boolean;
  error?: string;
}

/**
 * Informations sur une clé API
 */
export interface APIKeyInfo {
  service: IAProvider;
  masked: string; // Ex: "sk-proj-****"
  configured: boolean;
  valid?: boolean;
}
