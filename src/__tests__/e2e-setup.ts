/**
 * TITANE∞ v30.0.0 — E2E Test Setup Helpers
 * Shared setup and teardown for e2e tests
 */

import { vi } from 'vitest';
import { resetChatState } from './e2e-test-utils';

const mockSendMessageLegacy = vi.fn(async () => {
  throw new Error('Mock backend unavailable');
});

vi.mock('@/services/api/chat', () => ({
  chatService: {
    sendMessageLegacy: (...args: unknown[]) => mockSendMessageLegacy(...args),
  },
}));

/**
 * Setup mock for Tauri backend chat service
 * Forces the hook to use its local streaming/generate fallback path
 */
export const setupChatServiceMock = () => {
  mockSendMessageLegacy.mockReset();
  mockSendMessageLegacy.mockRejectedValue(new Error('Mock backend unavailable'));
  return mockSendMessageLegacy;
};

/**
 * Setup test hooks: called before each test
 */
export const setupE2ETest = () => {
  vi.clearAllMocks();
  setupChatServiceMock();
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
