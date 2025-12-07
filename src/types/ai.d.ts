// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — AI Message Types
// ═══════════════════════════════════════════════════════════════

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  provider: string;
  timestamp: number;
  metadata?: {
    historyLength?: number;
    historyCount?: number;
    deterministic?: boolean;
    [key: string]: unknown;
  };
}

export interface AIConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeout?: number;
  model?: string;
  [key: string]: unknown;
}

export type ModalityOrigin = 'voice' | 'text' | 'gesture' | 'visual' | 'multimodal';

export interface UseChatOptions {
  initialMessages?: AIMessage[];
  onError?: (error: Error) => void;
  onSuccess?: (response: AIResponse) => void;
  [key: string]: unknown;
}
