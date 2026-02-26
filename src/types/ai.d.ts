// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — AI Message Types (Ring 1 local definitions)
//   AUTOFIX v19.3Ω: remove Types -> Services dependency
// ═══════════════════════════════════════════════════════════════

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
  | 'copilot'
  | 'glm46v'
  | 'fallback'
  | 'emergency-fallback'
  | 'ultimate-fallback'
  | 'omnis-emergency'
  | 'omnis-fallback'
  | 'titane-constitutional';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  provider: AIProviderName;
  timestamp: number;
  model?: string;
  tokens?: number;
  metadata?: Record<string, unknown>;
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
  preferredProvider?:
    | 'auto'
    | 'openai'
    | 'claude'
    | 'gemini'
    | 'ollama'
    | 'copilot'
    | 'local';
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
  testConnection?: () => Promise<{ success: boolean; message: string }>;
}

// Additional types specific to this module (not in canonical types)
export type ModalityOrigin = 'voice' | 'text' | 'gesture' | 'visual' | 'multimodal';

export interface UseChatOptions {
  initialMessages?: AIMessage[];
  onError?: (error: Error) => void;
  onSuccess?: (response: AIResponse) => void;
  [key: string]: unknown;
}
