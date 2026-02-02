/**
 * TITANE∞ v19.2Ω — E2E Test Setup Helpers
 * Shared setup and teardown for e2e tests
 */

import { vi } from 'vitest';
import { resetChatState } from './e2e-test-utils';

/**
 * Setup mock for Tauri backend chat service
 * Forces the hook to use its local streaming/generate fallback path
 */
export const setupChatServiceMock = () => {
  vi.mock('@/services/api/chat', () => ({
    chatService: {
      sendMessageLegacy: vi.fn(async () => {
        throw new Error('Mock backend unavailable');
      }),
    },
  }));
};

/**
 * Setup test hooks: called before each test
 */
export const setupE2ETest = () => {
  vi.clearAllMocks();
  resetChatState();
};

/**
 * Teardown test hooks: called after each test
 */
export const teardownE2ETest = () => {
  try {
    resetChatState();
  } catch {
    // Ignore errors
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
};
