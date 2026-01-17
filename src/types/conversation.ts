/**
 * Types pour ConversationManager (OMEGA v2)
 */

/**
 * Message dans une conversation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp: number;
  metadata?: {
    emotion?: string;
    intent?: string;
    toolCalls?: ToolCall[];
    [key: string]: unknown;
  };
}

/**
 * Réponse IA
 */
export interface ConversationResponse {
  content: string;
  role: 'assistant';
  timestamp: number;
  conversationId?: string;
  memoryContext?: {
    memoriesUsed: number;
    summary: string;
  };
  metadata?: {
    model?: string;
    tokensUsed?: number;
    finish_reason?: string;
    [key: string]: unknown;
  };
}

/**
 * Configuration conversation
 */
export interface ConversationConfig {
  maxContextLength: number; // tokens
  temperature: number;
  topP: number;
  enableStreaming: boolean;
  enableMemory: boolean;
  model?: string;
  systemPrompt?: string;
}

/**
 * Contexte conversation complète
 */
export interface ConversationContext {
  conversationId: string;
  messages: ConversationMessage[];
  metadata: {
    title?: string;
    tags?: string[];
    userId?: string;
    [key: string]: unknown;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Tool call (function calling)
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
