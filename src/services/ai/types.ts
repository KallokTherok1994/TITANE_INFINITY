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

/**
 * 🔒 STRICT PROVIDER ENUM (C1.2 CONTRACT)
 * Only known, vetted providers. No fallback variants.
 * Used by AIOrchestrator, response metadata, and type guards.
 * ═══════════════════════════════════════════════════════════════
 * Rationale: Legacy types had 19 variants including 5+ fallback aliases
 * that created ambiguity and undefined provider states in error paths.
 * This strict type ensures all provider names are known and type-safe.
 */
export type ProviderName =
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'copilot' // GitHub Copilot (v26.3+)
  | 'ollama'
  | 'titane-local'
  | 'fallback'; // Generic fallback only

/**
 * Type guard for ProviderName (C1.2 CONTRACT)
 * Validates that a string is a known provider.
 * @param name - String to validate
 * @returns true if name is a valid ProviderName
 */
export function isKnownProvider(name: unknown): name is ProviderName {
  if (typeof name !== 'string') return false;
  const knownProviders = new Set<ProviderName>([
    'gemini',
    'openai',
    'claude',
    'copilot',
    'ollama',
    'titane-local',
    'fallback',
  ]);
  return knownProviders.has(name as ProviderName);
}

/**
 * DEPRECATED: AIProviderName is kept for backward compatibility only.
 * New code should use ProviderName + isKnownProvider() type guard.
 * Migration path: Replace AIProviderName with ProviderName in new code.
 * @deprecated Use ProviderName instead
 */
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
  | 'glm46v' // ✨ v26.3 - GLM-4.6V local vision model
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

/**
 * 🔒 NEW C1.2 Contract: AIResponse with strict ProviderName (v27.0.0)
 * Guarantees provider is always a known value, never "unknown" or undefined.
 * ═════════════════════════════════════════════════════════════════════
 * Migration: New providers should return StrictAIResponse instead of AIResponse.
 * This ensures type safety through the entire response lifecycle.
 */
export interface StrictAIResponse {
  content: string;
  provider: ProviderName; // ← Strict provider (never unknown)
  timestamp: number;
  model?: string;
  tokens?: number;
  metadata?: AIResponseMetadata;
}

/**
 * @deprecated Use StrictAIResponse for new code.
 * Kept for backward compatibility with existing providers.
 */
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

// ═══════════════════════════════════════════════════════════════════
//   AI RESULT CONTRACT (v27.2Ω — OLLAMA PROXY SEAL)
// ═══════════════════════════════════════════════════════════════════

/**
 * Standard error structure for AI operations
 * Enforces "Always Respond" contract - NO silent failures
 */
export interface AiError {
  /** Machine-readable error code (e.g., 'OLLAMA_TIMEOUT', 'OLLAMA_UNREACHABLE') */
  code: string;
  
  /** Human-readable error message (French, user-facing) */
  message: string;
  
  /** Optional hint for user action (e.g., "Démarre Ollama puis réessaie") */
  hint?: string;
  
  /** Whether this error is retryable (true = show "Réessayer" button) */
  retryable: boolean;
  
  /** Optional technical details (for debugging, not shown to user) */
  details?: Record<string, unknown>;
}

/**
 * Success result with content
 */
export interface AiOk<T = string> {
  ok: true;
  provider: ProviderName;
  content: T;
  meta?: Record<string, unknown>;
}

/**
 * Error result with actionable information
 */
export interface AiErr {
  ok: false;
  provider: ProviderName;
  error: AiError;
}

/**
 * Universal AI result type (replaces throw-based error handling)
 * 
 * Usage:
 * ```typescript
 * const result = await ollamaGenerate(req);
 * if (result.ok) {
 *   console.log(result.content);
 * } else {
 *   displayError(result.error.message, result.error.hint);
 * }
 * ```
 */
export type AiResult<T = string> = AiOk<T> | AiErr;
