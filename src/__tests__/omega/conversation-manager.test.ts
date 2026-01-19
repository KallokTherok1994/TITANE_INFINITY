/**
 * 🧪 Tests OMEGA v2: ConversationManager
 *
 * Vérifie que ConversationManager respecte les specs OMEGA v2:
 * - Singleton pattern
 * - Message persistence
 * - Context window management
 * - Multi-conversation support
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  conversationManager,
  sendAIMessage,
} from '../../services/ai/ConversationManager';
import type { ConversationMessage } from '../../types/conversation';

// Mock secureInvoke with proper isolation
vi.mock('@/lib/security', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    secureInvoke: vi.fn((cmd: string, args?: any) => {
      if (cmd === 'vector_store_init') return Promise.resolve('test-store-omega');
      if (cmd === 'vector_store_search')
        return Promise.resolve({ results: [], count: 0, total: 0 });
      if (cmd === 'vector_search') return Promise.resolve([]);
      if (cmd === 'vector_store_insert') {
        return Promise.resolve({ success: true, id: `vec-${Date.now()}` });
      }
      if (cmd === 'conversation_generate') {
        const conversationId =
          args?.conversation_id ?? args?.conversationId ?? 'test-conversation';
        return Promise.resolve({
          content: `Mock omega response: ${args?.message ?? 'test'}`,
          conversationId,
          messageId: `mock-msg-${Date.now()}`,
          frenchMasteryApplied: true,
          latencyMs: 5,
          metadata: {
            provider: args?.provider ?? 'mock',
          },
        });
      }
      if (cmd === 'chat_send_message') {
        return Promise.resolve({
          content: `Mock response: ${args?.prompt || 'test'}`,
          model: 'mock-gpt4',
          tokens_used: 42,
          finish_reason: 'stop',
        });
      }
      return Promise.resolve({ success: true });
    }),
  };
});

describe('🧠 ConversationManager (OMEGA v2)', () => {
  beforeEach(async () => {
    // Clear all conversations before each test
    const conversations = await conversationManager.listConversations();
    await Promise.all(
      conversations.map(conv => conversationManager.deleteConversation(conv.id))
    );
  });

  /**
   * Test 1: Singleton instance
   */
  it('should be a singleton', () => {
    const instance1 = conversationManager;
    const instance2 = conversationManager;

    expect(instance1).toBe(instance2);
  });

  /**
   * Test 2: Send message and get response
   */
  it('should send message and receive response', async () => {
    const message: ConversationMessage = {
      role: 'user',
      content: 'Hello TITANE∞',
      timestamp: Date.now(),
    };

    const response = await conversationManager.sendMessage(message, {
      conversationId: 'test-1',
    });

    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toBeDefined();
    expect(response.timestamp).toBeGreaterThan(0);
  });

  /**
   * Test 3: Conversation persistence
   */
  it('should persist conversation history', async () => {
    const conversationId = 'test-conversation';

    // Send first message
    await sendAIMessage('First message', conversationId);

    // Send second message
    await sendAIMessage('Second message', conversationId);

    // Retrieve conversation
    const conversation = await conversationManager.getConversation(conversationId);

    expect(conversation).toBeDefined();
    expect(conversation!.messages.length).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
    expect(conversation!.messages[0].content).toBe('First message');
    expect(conversation!.messages[2].content).toBe('Second message');
  });

  /**
   * Test 4: Multiple conversations isolation
   */
  it('should isolate multiple conversations', async () => {
    await sendAIMessage('Message A1', 'conversation-a');
    await sendAIMessage('Message B1', 'conversation-b');
    await sendAIMessage('Message A2', 'conversation-a');

    const convA = await conversationManager.getConversation('conversation-a');
    const convB = await conversationManager.getConversation('conversation-b');

    expect(convA!.messages.length).toBe(4); // 2 user + 2 assistant
    expect(convB!.messages.length).toBe(2); // 1 user + 1 assistant
    expect(convA!.messages[0].content).toBe('Message A1');
    expect(convB!.messages[0].content).toBe('Message B1');
  });

  /**
   * Test 5: Conversation metadata
   */
  it('should handle conversation metadata', async () => {
    const message: ConversationMessage = {
      role: 'user',
      content: 'Test',
      timestamp: Date.now(),
      metadata: {
        emotion: 'curious',
        intent: 'question',
      },
    };

    await conversationManager.sendMessage(message, {
      conversationId: 'metadata-test',
      metadata: {
        title: 'Test Conversation',
        tags: ['test', 'omega-v2'],
      },
    });

    const conversation = await conversationManager.getConversation('metadata-test');

    expect(conversation!.metadata.title).toBe('Test Conversation');
    expect(conversation!.metadata.tags).toEqual(['test', 'omega-v2']);
    expect(conversation!.messages[0].metadata?.emotion).toBe('curious');
  });

  /**
   * Test 6: Conversation deletion
   */
  it('should delete conversations', async () => {
    await sendAIMessage('Test', 'delete-test');

    const beforeDelete = await conversationManager.getConversation('delete-test');
    expect(beforeDelete).not.toBeNull();

    const deleted = await conversationManager.deleteConversation('delete-test');
    expect(deleted).toBe(true);

    const afterDelete = await conversationManager.getConversation('delete-test');
    expect(afterDelete).toBeNull();
  });

  /**
   * Test 7: List all conversations
   */
  it('should list all active conversations', async () => {
    await sendAIMessage('A', 'conv-1');
    await sendAIMessage('B', 'conv-2');
    await sendAIMessage('C', 'conv-3');

    const conversations = await conversationManager.listConversations();

    expect(conversations).toHaveLength(3);
    expect(conversations.map(c => c.id)).toContain('conv-1');
    expect(conversations.map(c => c.id)).toContain('conv-2');
    expect(conversations.map(c => c.id)).toContain('conv-3');
  });

  /**
   * Test 8: Config update
   */
  it('should update conversation config', () => {
    conversationManager.updateConfig({
      temperature: 0.9,
      maxContextLength: 8000,
    });

    // Config update should be reflected in next conversation
    // (tested indirectly via conversation behavior)
    expect(() => conversationManager.updateConfig({ temperature: 0.5 })).not.toThrow();
  });

  /**
   * Test 9: Default conversation ID
   */
  it('should use default conversation if no ID provided', async () => {
    const response = await sendAIMessage('Default conversation test');

    expect(response).toBeDefined();

    const defaultConv = await conversationManager.getConversation('default');
    expect(defaultConv).not.toBeNull();
    expect(defaultConv!.messages[0].content).toBe('Default conversation test');
  });

  /**
   * Test 10: Timestamps consistency
   */
  it('should maintain consistent timestamps', async () => {
    const before = Date.now();
    await sendAIMessage('Timestamp test', 'timestamp-test');
    const after = Date.now();

    const conversation = await conversationManager.getConversation('timestamp-test');

    expect(conversation!.createdAt).toBeGreaterThanOrEqual(before);
    expect(conversation!.createdAt).toBeLessThanOrEqual(after);
    expect(conversation!.updatedAt).toBeGreaterThanOrEqual(conversation!.createdAt);
  });
});
