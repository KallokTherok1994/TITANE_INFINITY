/**
 * Chat Memory Management — Handle memory caching and compression
 * Extracted from useChat.ts (Phase 4 refactoring)
 */

import { useCallback, useRef } from 'react';
import type { AIMessage } from '@/services/ai/types';

export interface ChatMemoryCacheEntry {
  timestamp: number;
  messages: AIMessage[];
  checksum: string;
}

/**
 * Calculate simple checksum for messages
 */
const calculateChecksum = (messages: AIMessage[]): string => {
  const combined = messages.map(m => `${m.role}:${m.content}`).join('|');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Keep 32-bit
  }
  return `${hash}`;
};

/**
 * Compress messages by removing duplicates and old messages
 */
export const compressMessages = (messages: AIMessage[], maxMessages: number = 100): AIMessage[] => {
  const seen = new Set<string>();
  const compressed: AIMessage[] = [];

  // Keep messages in reverse order (newest first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const key = `${msg.role}:${msg.content.substring(0, 50)}`;

    if (!seen.has(key) && compressed.length < maxMessages) {
      seen.add(key);
      compressed.push(msg);
    }
  }

  return compressed.reverse();
};

/**
 * Hook for managing chat memory cache
 */
export const useChatMemoryCache = () => {
  const cacheRef = useRef<ChatMemoryCacheEntry[]>([]);
  const maxCacheSize = 10;

  const addToCache = useCallback((messages: AIMessage[]): void => {
    const checksum = calculateChecksum(messages);
    const existing = cacheRef.current.find(entry => entry.checksum === checksum);

    if (existing) {
      existing.timestamp = Date.now();
      return;
    }

    cacheRef.current.push({
      timestamp: Date.now(),
      messages: [...messages],
      checksum,
    });

    // Keep cache size limited
    if (cacheRef.current.length > maxCacheSize) {
      cacheRef.current.sort((a, b) => a.timestamp - b.timestamp);
      cacheRef.current = cacheRef.current.slice(-maxCacheSize);
    }
  }, []);

  const getFromCache = useCallback((checksum: string): AIMessage[] | null => {
    const entry = cacheRef.current.find(e => e.checksum === checksum);
    return entry ? entry.messages : null;
  }, []);

  const clearCache = useCallback((): void => {
    cacheRef.current = [];
  }, []);

  const getCacheSize = useCallback((): number => {
    return cacheRef.current.reduce((sum, entry) => 
      sum + JSON.stringify(entry).length, 0
    );
  }, []);

  return {
    addToCache,
    getFromCache,
    clearCache,
    getCacheSize,
  };
};

/**
 * Export message history to JSON
 */
export const exportChatHistory = (messages: AIMessage[], filename: string = 'chat-history.json'): void => {
  const data = JSON.stringify(messages, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export to markdown format
 */
export const exportChatMarkdown = (messages: AIMessage[], filename: string = 'chat-history.md'): void => {
  let markdown = '# Chat History\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;

  for (const msg of messages) {
    const role = msg.role === 'user' ? '👤 You' : '🤖 Assistant';
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;
    markdown += `---\n\n`;
  }

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
