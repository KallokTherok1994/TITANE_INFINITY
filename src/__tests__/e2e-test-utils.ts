/**
 * TITANE∞ v19.2Ω — E2E Test Utilities
 * Shared utilities for end-to-end testing
 */

import type { AIMessage } from '../services/ai/types';
import type { ChatEngineResponse } from '../services/ai';
import { chatMemoryCompactor } from '../services/chatMemoryCompactor';

/**
 * Create a mock response for testing
 */
export const createMockResponse = (
  content = 'Assistant response'
): ChatEngineResponse => ({
  content,
  provider: 'titane-local',
  timestamp: Date.now(),
  mode: 'default',
  contextUsed: [],
});

/**
 * Summarize messages for easier test assertions
 */
export const summarizeMessages = (messages: AIMessage[]) =>
  messages.map(message => ({ role: message.role, content: message.content }));

/**
 * Reset chat state for clean test environments
 */
export const resetChatState = () => {
  try {
    chatMemoryCompactor.clearAll();
    localStorage.clear();
  } catch {
    // Ignore storage errors in test environments
  }
};

/**
 * Wait for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
): Promise<void> => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

/**
 * Create a test message
 */
export const createTestMessage = (
  content: string,
  role: 'user' | 'assistant' = 'user'
): AIMessage => ({
  id: `msg-${Date.now()}-${Math.random()}`,
  role,
  content,
  timestamp: Date.now(),
  metadata: {},
});
