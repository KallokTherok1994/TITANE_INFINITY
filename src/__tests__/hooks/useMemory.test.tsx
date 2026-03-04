/**
 * Tests pour useMemory Hook
 * Coverage: CRUD mémoire, Tiers (STM/MTM/LTM), Recherche
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemory } from '@/hooks/useMemory';
import { tauriClient } from '@/lib/tauriClient';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    listConversations: vi.fn(),
    createConversation: vi.fn(),
    loadConversation: vi.fn(),
    deleteConversation: vi.fn(),
    clearAllMemory: vi.fn(),
  },
}));

describe('useMemory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tauriClient.listConversations).mockResolvedValue('[]');
    vi.mocked(tauriClient.createConversation).mockResolvedValue('conv-1');
    vi.mocked(tauriClient.loadConversation).mockResolvedValue(
      JSON.stringify({
        id: 'conv-1',
        title: 'Test',
        created_at: Date.now(),
        updated_at: Date.now(),
        entries: [],
        metadata: {
          total_tokens: 0,
          message_count: 0,
          tags: [],
          is_archived: false,
        },
      })
    );
    vi.mocked(tauriClient.deleteConversation).mockResolvedValue(undefined);
    vi.mocked(tauriClient.clearAllMemory).mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should initialize with empty conversation state', () => {
      const { result } = renderHook(() => useMemory());
      expect(result.current.currentConversation).toBeNull();
      expect(Array.isArray(result.current.conversations)).toBe(true);
    });

    it('should expose memory actions', () => {
      const { result } = renderHook(() => useMemory());
      expect(typeof result.current.loadConversations).toBe('function');
      expect(typeof result.current.createConversation).toBe('function');
      expect(typeof result.current.loadConversation).toBe('function');
    });
  });

  describe('Conversation operations', () => {
    it('should load conversations list', async () => {
      const { result } = renderHook(() => useMemory());

      await act(async () => {
        await result.current.loadConversations();
      });

      expect(tauriClient.listConversations).toHaveBeenCalled();
      expect(Array.isArray(result.current.conversations)).toBe(true);
    });

    it('should create conversation', async () => {
      const { result } = renderHook(() => useMemory());
      let id: string | null = null;

      await act(async () => {
        id = await result.current.createConversation('Demo');
      });

      expect(id).toBe('conv-1');
      expect(tauriClient.createConversation).toHaveBeenCalledWith({ title: 'Demo' });
    });

    it('should load conversation by id', async () => {
      const { result } = renderHook(() => useMemory());
      let conversation: unknown;

      await act(async () => {
        conversation = await result.current.loadConversation('conv-1');
      });

      expect(tauriClient.loadConversation).toHaveBeenCalledWith({
        conversationId: 'conv-1',
      });
      expect(conversation).toBeTruthy();
    });

    it('should delete conversation', async () => {
      const { result } = renderHook(() => useMemory());

      await act(async () => {
        await result.current.deleteConversation('conv-1');
      });

      expect(tauriClient.deleteConversation).toHaveBeenCalledWith({
        conversationId: 'conv-1',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear all memory', async () => {
      const { result } = renderHook(() => useMemory());

      await act(async () => {
        await result.current.clearAllMemory();
      });

      expect(tauriClient.clearAllMemory).toHaveBeenCalled();
      expect(result.current.currentConversation).toBeNull();
    });
  });
});
