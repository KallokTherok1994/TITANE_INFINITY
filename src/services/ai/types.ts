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
  metadata?: {
    [key: string]: any;
  };
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
  | 'fallback'
  | 'emergency-fallback'
  | 'ultimate-fallback'
  | 'omnis-emergency'
  | 'omnis-fallback';

export interface AIResponse {
  content: string;
  provider: AIProviderName;
  timestamp: number;
  model?: string;
  tokens?: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface AIProvider {
  name: AIProviderName;
  isAvailable: () => Promise<boolean>;
  generate: (message: string, history: AIMessage[]) => Promise<AIResponse>;
  stream?: (message: string, history: AIMessage[]) => AsyncGenerator<string>;
  resetErrors?: () => void;
  getStats?: () => Record<string, unknown>;
  description?: string;
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
  promptProfileId?: string;
  promptContext?: PromptContext;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  topK: 40,
  timeout: 30000,
};
