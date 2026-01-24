import { useMemo } from 'react';

export const __TITANE_TEST_MOCK__ = true;

const STABLE_COMPACT_RESULT = { cleaned: false, sizeMB: 0 };

// Minimal in-memory persistence across hook instances (simulates stored assistant replies).
// Intentionally module-scoped so a new renderHook() can "restore" previous assistant messages.
let PERSISTED_ASSISTANT_MESSAGES: any[] = [];

type UseChatMemoryReturn = {
  messagesForMode: any[];
  memoryStats: { count: number; sizeMB: number; compressed: boolean };
  loadHistory: (...args: any[]) => any[];
  saveMessage: (...args: any[]) => void;
  clearMode: (...args: any[]) => void;
  compactIfNeeded: (...args: any[]) => { cleaned: boolean; sizeMB: number };
  awardXP: (...args: any[]) => Promise<void>;
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
    saveMessage: (message: any) => {
      if (message && message.role === 'assistant') {
        PERSISTED_ASSISTANT_MESSAGES.push(message);
      }
    },
    clearMode: () => {
      PERSISTED_ASSISTANT_MESSAGES = [];
    },
    compactIfNeeded: () => STABLE_COMPACT_RESULT,
    awardXP: async () => {},
  };
}
