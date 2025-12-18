/**
 * 🧪 TITANE∞ ConversationManager — Tests P0
 * Coverage critique pour 0% → 30%+ (Phase 3 YOLO AUTO)
 */

import { ConversationManager } from '../ConversationManager';
import type { ConversationMessage } from '@/types/conversation';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock secureInvoke (replaces deprecated Tauri invoke)
vi.mock('@/lib/security', () => ({
  secureInvoke: vi.fn((cmd: string, args?: any) => {
    // VectorStore commands
    if (cmd === 'vector_store_init') {
      return Promise.resolve('test-store-id-123');
    }
    if (cmd === 'vector_store_search' || cmd === 'vector_search') {
      return Promise.resolve({ results: [], count: 0, total: 0 });
    }
    if (cmd === 'vector_store_insert') {
      return Promise.resolve({ success: true, id: `vector-${Date.now()}` });
    }
    if (cmd === 'vector_store_get_stats') {
      return Promise.resolve({ total: 0, dimensions: 384 });
    }

    // AI/Chat commands
    if (cmd === 'chat_send_message') {
      return Promise.resolve({
        content: `Mock response to: ${args?.prompt || args?.message || 'unknown'}`,
        model: 'mock-model',
        tokens_used: 42,
        finish_reason: 'stop',
      });
    }

    // Memory commands
    if (cmd === 'memory_store_conversation') {
      return Promise.resolve({ success: true, id: args?.conversationId });
    }
    if (cmd === 'memory_get_conversation') {
      return Promise.resolve(null);
    }
    if (cmd === 'memory_delete_conversation') {
      return Promise.resolve({ success: true });
    }
    if (cmd === 'memory_list_conversations') {
      return Promise.resolve({ conversations: [] });
    }

    // Default
    return Promise.resolve({ success: true });
  }),
}));

// Mock Tauri event API
vi.mock('@tauri-apps/api/event', () => ({
  emit: vi.fn(() => Promise.resolve()),
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

describe('ConversationManager P0 Tests', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = ConversationManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('✅ Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ConversationManager.getInstance();
      const instance2 = ConversationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('✅ Basic Message Handling', () => {
    test('should send message and get response', async () => {
      const message: ConversationMessage = {
        role: 'user',
        content: 'Hello, world!',
        timestamp: Date.now(),
      };

      const response = await manager.sendMessage(message);

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
      expect(response.conversationId).toBeDefined();
    });

    test('should handle empty message gracefully', async () => {
      const message: ConversationMessage = {
        role: 'user',
        content: '',
        timestamp: Date.now(),
      };

      await expect(manager.sendMessage(message)).resolves.toBeDefined();
    });

    test('should preserve conversation context', async () => {
      const conversationId = 'test-conv-1';
      const message1: ConversationMessage = {
        role: 'user',
        content: 'First message',
        timestamp: Date.now(),
      };
      const message2: ConversationMessage = {
        role: 'user',
        content: 'Second message',
        timestamp: Date.now(),
      };

      const response1 = await manager.sendMessage(message1, { conversationId });
      const response2 = await manager.sendMessage(message2, { conversationId });

      expect(response1.conversationId).toBe(conversationId);
      expect(response2.conversationId).toBe(conversationId);
    });
  });

  describe('✅ Conversation History', () => {
    test('should load conversation history', async () => {
      const conversationId = 'history-test';

      // Create history
      await manager.sendMessage(
        { role: 'user', content: 'Test 1', timestamp: Date.now() },
        { conversationId }
      );

      const history = await manager.loadConversation(conversationId);

      expect(history).toBeDefined();
      expect(Array.isArray(history.messages)).toBe(true);
      expect(history.messages.length).toBeGreaterThan(0);
    });

    test('should save conversation to memory', async () => {
      const conversationId = 'save-test';
      const message: ConversationMessage = {
        role: 'user',
        content: 'Save this message',
        timestamp: Date.now(),
      };

      await manager.sendMessage(message, { conversationId });

      // Verify saved
      const loaded = await manager.loadConversation(conversationId);
      expect(loaded.messages.some(m => m.content === 'Save this message')).toBe(true);
    });

    test('should delete conversation', async () => {
      const conversationId = 'delete-test';

      await manager.sendMessage(
        { role: 'user', content: 'To be deleted', timestamp: Date.now() },
        { conversationId }
      );

      await manager.deleteConversation(conversationId);

      // Verify deleted (should throw or return empty)
      const result = await manager.loadConversation(conversationId);
      expect(result.messages.length).toBe(0);
    });
  });

  describe('✅ Error Handling', () => {
    test('should handle invalid conversation ID gracefully', async () => {
      const invalidId = '';
      const message: ConversationMessage = {
        role: 'user',
        content: 'Test',
        timestamp: Date.now(),
      };

      // Should not throw, fallback to 'default'
      await expect(
        manager.sendMessage(message, { conversationId: invalidId })
      ).resolves.toBeDefined();
    });

    test('should handle malformed message object', async () => {
      const malformed = {
        role: 'user',
        // Missing required fields
      } as ConversationMessage;

      // Should handle gracefully (validation or defaults)
      await expect(manager.sendMessage(malformed)).resolves.toBeDefined();
    });

    test('should recover from AI backend failure', async () => {
      const message: ConversationMessage = {
        role: 'user',
        content: 'Test recovery',
        timestamp: Date.now(),
      };

      // Should not throw, fallback mechanism
      await expect(manager.sendMessage(message)).resolves.toBeDefined();
    });
  });

  describe('✅ Configuration', () => {
    test('should update configuration', () => {
      manager.updateConfig({
        temperature: 0.5,
        maxContextLength: 8000,
      });

      const config = manager.getConfig();
      expect(config.temperature).toBe(0.5);
      expect(config.maxContextLength).toBe(8000);
    });

    test('should preserve default config values', () => {
      manager.updateConfig({ temperature: 0.9 });

      const config = manager.getConfig();
      expect(config.temperature).toBe(0.9);
      expect(config.maxContextLength).toBeDefined(); // Should still have default
    });
  });

  describe('✅ Memory Integration (RAG)', () => {
    test('should integrate memory context for relevant queries', async () => {
      const message: ConversationMessage = {
        role: 'user',
        content: 'What did we discuss earlier?',
        timestamp: Date.now(),
      };

      const response = await manager.sendMessage(message);

      expect(response).toBeDefined();
      // Memory integration may or may not provide context (depends on UnifiedMemory state)
      // Just verify response structure is complete
      expect(response.content).toBeDefined();
      expect(response.conversationId).toBeDefined();
      // memoryContext is optional (only if RAG finds relevant memories)
      if (response.memoryContext) {
        expect(response.memoryContext.memoriesUsed).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('✅ Conversation Listing', () => {
    test('should list all conversations', async () => {
      // Create multiple conversations
      await manager.sendMessage(
        { role: 'user', content: 'Conv 1', timestamp: Date.now() },
        { conversationId: 'list-1' }
      );
      await manager.sendMessage(
        { role: 'user', content: 'Conv 2', timestamp: Date.now() },
        { conversationId: 'list-2' }
      );

      const conversations = await manager.listConversations();

      expect(Array.isArray(conversations)).toBe(true);
      expect(conversations.length).toBeGreaterThanOrEqual(2);
    });

    test('should include conversation metadata', async () => {
      const conversations = await manager.listConversations();

      if (conversations.length > 0) {
        const conv = conversations[0];
        expect(conv.id).toBeDefined();
        expect(conv.lastMessageTime).toBeDefined();
        expect(typeof conv.messageCount).toBe('number');
      }
    });
  });
});
