/**
 * Tests pour useChat Hook
 * Coverage: Envoi messages, Historique, États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '@/hooks';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.messages).toEqual([]);
    });

    it('should have sendMessage function', () => {
      const { result } = renderHook(() => useChat());
      expect(typeof result.current.sendMessage).toBe('function');
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useChat());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Send Message', () => {
    it('should add user message', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Hello TITANE');
      });

      expect(result.current.messages).toContainEqual(
        expect.objectContaining({
          role: 'user',
          content: 'Hello TITANE',
        })
      );
    });

    it('should set loading state', async () => {
      const { result } = renderHook(() => useChat());
      
      act(() => {
        result.current.sendMessage('Test');
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Clear Messages', () => {
    it('should clear message history', async () => {
      const { result } = renderHook(() => useChat());
      
      await act(async () => {
        await result.current.sendMessage('Message 1');
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });
  });
});
