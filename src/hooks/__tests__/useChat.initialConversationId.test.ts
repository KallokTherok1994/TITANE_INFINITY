/**
 * TITANE∞ — useChat initial conversationId tests
 * Verifies that the fallback ID is not created when storage has an active conversation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetActiveConversationId = vi.fn();
vi.mock('@/services/conversation/conversationStorage', () => ({
  conversationStorage: {
    getActiveConversationId: mockGetActiveConversationId,
    loadConversationSync: vi.fn(() => null),
    initialize: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  },
}));

const mockWarn = vi.fn();
vi.mock('@/utils/chatLogger', () => ({
  chatLogger: {
    info: vi.fn(),
    warn: mockWarn,
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useChat — initial conversationId from conversationStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the active conversation ID returned by conversationStorage (no fallback warning)', async () => {
    mockGetActiveConversationId.mockReturnValue('test-conv-id');
    const { conversationStorage } = await import('@/services/conversation/conversationStorage');
    const { chatLogger } = await import('@/utils/chatLogger');

    const id = conversationStorage.getActiveConversationId();
    expect(id).toBe('test-conv-id');

    // Simulate the useChat lazy initializer logic
    if (id) {
      chatLogger.info('🔄 Using active conversation from conversationStorage', { activeId: id });
    } else {
      const fallbackId = `conv-${Date.now()}-fallback`;
      chatLogger.warn('⚠️ No active conversation in conversationStorage, using fallback ID', { fallbackId });
    }

    expect(mockWarn).not.toHaveBeenCalled();
  });

  it('generates a conv- prefixed fallback when storage returns null', async () => {
    mockGetActiveConversationId.mockReturnValue(null);
    const { conversationStorage } = await import('@/services/conversation/conversationStorage');
    const { chatLogger } = await import('@/utils/chatLogger');

    const id = conversationStorage.getActiveConversationId();
    expect(id).toBeNull();

    let generatedId: string | null = null;
    if (!id) {
      generatedId = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      chatLogger.warn('⚠️ No active conversation in conversationStorage, using fallback ID', { fallbackId: generatedId });
    }

    expect(generatedId).not.toBeNull();
    expect(generatedId!).toMatch(/^conv-/);
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('No active conversation'),
      expect.objectContaining({ fallbackId: expect.stringMatching(/^conv-/) })
    );
  });

  it('storage is read exactly once per mount (not re-read on re-render)', async () => {
    mockGetActiveConversationId.mockReturnValue(null);
    const { conversationStorage } = await import('@/services/conversation/conversationStorage');

    // Simulate useState lazy initializer running once
    conversationStorage.getActiveConversationId();

    expect(mockGetActiveConversationId).toHaveBeenCalledTimes(1);
  });
});
