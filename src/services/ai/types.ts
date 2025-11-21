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
}

export interface AIResponse {
  content: string;
  provider: 'gemini' | 'ollama' | 'fallback';
  timestamp: number;
  model?: string;
}

export interface AIProvider {
  name: 'gemini' | 'ollama' | 'fallback';
  isAvailable: () => Promise<boolean>;
  generate: (message: string, history: AIMessage[]) => Promise<AIResponse>;
  stream?: (message: string, history: AIMessage[]) => AsyncGenerator<string>;
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  topK: 40,
  timeout: 30000,
};
