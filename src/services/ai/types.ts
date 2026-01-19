/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import type { PromptContext } from '@/core/prompts';

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — AI TYPES
 *   Types TypeScript pour système IA unifié
 * ═══════════════════════════════════════════════════════════════════
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export type AIProviderName =
  | 'gemini'
  | 'ollama'
  | 'titane-local'
  | 'tauri-backend'
  | 'tauri-gemini'
  | 'tauri-ollama'
  | 'tauri-local'
  | 'tauri-chat'
  | 'openai'
  | 'claude'
  | 'copilot' // ✨ v26.3 - GitHub Copilot provider
  | 'fallback'
  | 'emergency-fallback'
  | 'ultimate-fallback'
  | 'omnis-emergency'
  | 'omnis-fallback'
  | 'titane-constitutional';

// ✨ v21 - Provider choice for UI selection
// ✨ v26.3 - Added GitHub Copilot provider
export type ProviderChoice =
  | 'auto'
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'ollama'
  | 'copilot'
  | 'local';

/** Response metadata interface with known fields */
export interface AIResponseMetadata {
  latencyMs?: number;
  fallbackUsed?: boolean;
  retriesCount?: number;
  errorDetails?: string;
  model?: string;
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  finishReason?: string;
  cached?: boolean;
  [key: string]: unknown;
}

export interface AIResponse {
  content: string;
  provider: AIProviderName;
  timestamp: number;
  model?: string;
  tokens?: number;
  metadata?: AIResponseMetadata;
}

export interface AIProvider<TConfig = unknown> {
  name: AIProviderName;
  isAvailable: () => Promise<boolean>;
  generate: (
    message: string,
    history?: AIMessage[],
    config?: TConfig
  ) => Promise<AIResponse>;
  stream?: (
    message: string,
    history?: AIMessage[],
    config?: TConfig
  ) => AsyncGenerator<string>;
  resetErrors?: () => void;
  getStats?: () => Record<string, unknown>;
  description?: string;
  // AUTOFIX v19.3Ω: Added testConnection method
  testConnection?: () => Promise<{ success: boolean; message: string }>;
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
  promptProfileId?: string;
  promptContext?: PromptContext;
  preferredProvider?: ProviderChoice; // ✨ v21 - Force specific provider
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  topK: 40,
  timeout: 30000,
};

// ✨ v26.3 - Unified Provider Types for consistent integration
/**
 * Identifiant normalisé des providers IA
 * Utilisé pour router les requêtes, gérer les clés, et afficher l'UI
 */
export type AIProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'copilot'
  | 'local';

/**
 * Informations sur un modèle IA
 */
export interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  supportsVision?: boolean;
  supportsStreaming?: boolean;
  supportsFunctionCalling?: boolean;
  isDefault?: boolean;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

/**
 * Résultat d'un test de connexion
 */
export interface ProviderTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  error?: string;
  availableModels?: string[];
}

/**
 * Statut d'un provider
 */
export interface ProviderStatus {
  configured: boolean; // Clé API configurée
  available: boolean; // Provider accessible (test connexion OK)
  enabled: boolean; // Provider activé par l'utilisateur
  lastCheck?: number; // Timestamp dernière vérification
  error?: string; // Erreur si indisponible
  latencyMs?: number; // Latence dernière requête
}

/**
 * Capacités d'un provider
 */
export interface ProviderCapabilities {
  textGeneration: boolean;
  streaming: boolean;
  vision: boolean;
  functionCalling: boolean;
  codeGeneration: boolean;
  embeddings: boolean;
  longContext: boolean;
}

/**
 * Interface unifiée pour tous les providers IA
 * Garantit une intégration homogène (OpenAI, Anthropic, Gemini, Ollama, Copilot)
 */
export interface AIProviderAdapter {
  // Identité
  readonly id: AIProviderId;
  readonly name: string;
  readonly description?: string;

  // Capacités
  readonly capabilities: ProviderCapabilities;

  // Lifecycle & Health
  isAvailable(): Promise<boolean>;
  testConnection(): Promise<ProviderTestResult>;
  getStatus(): Promise<ProviderStatus>;

  // Modèles
  listModels(): Promise<ModelInfo[]>;
  getDefaultModel(): string;

  // Core Generation
  generate(
    message: string,
    history?: AIMessage[],
    config?: AIConfig
  ): Promise<AIResponse>;

  // Streaming (optionnel)
  stream?(
    message: string,
    history?: AIMessage[],
    config?: AIConfig
  ): AsyncGenerator<string>;

  // Stats & Debug
  getStats?(): Record<string, unknown>;
  resetErrors?(): void;
}
