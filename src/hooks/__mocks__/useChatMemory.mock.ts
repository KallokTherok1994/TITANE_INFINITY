import type { UseChatMemoryReturn } from '../useChatMemory';

export function useChatMemory(): UseChatMemoryReturn {
  return {
    messagesForMode: [],
    memoryStats: { count: 0, sizeMB: 0, compressed: false },
    loadHistory: () => [],
    saveMessage: () => {},
    clearMode: () => {},
    compactIfNeeded: () => ({ cleaned: false, sizeMB: 0 }),
    awardXP: async () => {},
  };
}
