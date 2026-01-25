import { useMemo } from 'react';
import { beforeEach, afterEach } from 'vitest';

export const __TITANE_TEST_MOCK__ = true;

const STABLE_COMPACT_RESULT = { cleaned: false, sizeMB: 0 };

type PersistedAssistantMessage = {
  role?: string;
} & Record<string, unknown>;

// Minimal in-memory persistence across hook instances (simulates stored assistant replies).
// Intentionally module-scoped so a new renderHook() can "restore" previous assistant messages.
let PERSISTED_ASSISTANT_MESSAGES: PersistedAssistantMessage[] = [];

beforeEach(() => {
  PERSISTED_ASSISTANT_MESSAGES = [];
});

afterEach(() => {
  PERSISTED_ASSISTANT_MESSAGES = [];
});

type UseChatMemoryReturn = {
  messagesForMode: PersistedAssistantMessage[];
  memoryStats: { count: number; sizeMB: number; compressed: boolean };
  loadHistory: (...args: unknown[]) => PersistedAssistantMessage[];
  saveMessage: (...args: unknown[]) => void;
  clearMode: (...args: unknown[]) => void;
  compactIfNeeded: (...args: unknown[]) => { cleaned: boolean; sizeMB: number };
  awardXP: (...args: unknown[]) => Promise<void>;
};

export function useChatMemory(): UseChatMemoryReturn {
  const messagesForMode = useMemo(() => PERSISTED_ASSISTANT_MESSAGES.slice(), []);

  return {
    messagesForMode,
    memoryStats: {
      count: messagesForMode.length,
      sizeMB: 0,
      compressed: false,
    },
    loadHistory: () => messagesForMode,
    saveMessage: (message: unknown) => {
      if (!message || typeof message !== 'object') return;
      const candidate = message as PersistedAssistantMessage;
      if (candidate.role === 'assistant') {
        PERSISTED_ASSISTANT_MESSAGES.push(candidate);
      }
    },
    clearMode: () => {
      PERSISTED_ASSISTANT_MESSAGES = [];
    },
    compactIfNeeded: () => STABLE_COMPACT_RESULT,
    awardXP: async () => {},
  };
}
