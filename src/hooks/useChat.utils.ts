/**
 * Chat Message Utilities — Message normalization and deduplication
 * Extracted from useChat.ts (Phase 4 refactoring)
 */

import type { AIMessage } from '@/services/ai/types';

export type ProviderPreference =
  | 'auto'
  | 'gemini'
  | 'claude'
  | 'openai'
  | 'ollama'
  | 'local';

export interface ChatDebugAttempt {
  timestamp: number;
  provider: string;
  error: string;
  recovery: string;
}

export interface ChatDebugEntry {
  messageId: string;
  attempts: ChatDebugAttempt[];
}

export const DEBUG_MAX_ENTRIES = 20;
export const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';

/**
 * Type guard for ProviderPreference
 */
export const isProviderPreference = (value: unknown): value is ProviderPreference =>
  typeof value === 'string' &&
  ['auto', 'gemini', 'claude', 'openai', 'ollama', 'local'].includes(value);

/**
 * Read stored provider preference from localStorage
 */
export const readStoredPreferredProvider = (): ProviderPreference => {
  try {
    const stored = localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY);
    return isProviderPreference(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
};

/**
 * Save provider preference to localStorage
 */
export const savePreferredProvider = (provider: ProviderPreference): void => {
  try {
    localStorage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, provider);
  } catch (error) {
    console.warn('Failed to save provider preference:', error);
  }
};

/**
 * Normalize messages for AI providers
 * Handles different message formats and ensures consistency
 */
export const normalizeMessages = (
  messages: AIMessage[] | any[],
  includeSystemContext: boolean = true
): AIMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(m => m && typeof m === 'object')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || ''),
      timestamp: m.timestamp || Date.now(),
    }))
    .slice(-50); // Keep last 50 messages for context
};

/**
 * Deduplicate messages by content hash
 */
export function deduplicateMessages(messages: AIMessage[]): AIMessage[] {
  const seen = new Set<string>();
  const deduped: AIMessage[] = [];

  for (const message of messages) {
    const hash = `${message.role}:${message.content}`.substring(0, 100);
    if (!seen.has(hash)) {
      seen.add(hash);
      deduped.push(message);
    }
  }

  return deduped;
}

/**
 * Filter messages by role
 */
export const filterMessagesByRole = (
  messages: AIMessage[],
  role: 'user' | 'assistant'
): AIMessage[] => {
  return messages.filter(m => m.role === role);
};

/**
 * Get last N messages
 */
export const getLastMessages = (messages: AIMessage[], count: number): AIMessage[] => {
  return messages.slice(Math.max(0, messages.length - count));
};

/**
 * Calculate total tokens in messages (rough estimate)
 */
export const estimateTokens = (messages: AIMessage[]): number => {
  return messages.reduce((total, msg) => {
    // Rough: ~4 characters = 1 token
    return total + Math.ceil(msg.content.length / 4);
  }, 0);
};
