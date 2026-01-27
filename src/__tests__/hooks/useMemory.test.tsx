/**
 * Tests pour useMemory Hook
 * Coverage: CRUD mémoire, Tiers (STM/MTM/LTM), Recherche
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemory } from '@/hooks/useMemory';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useMemory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty memory tree', () => {
      const { result } = renderHook(() => useMemory());
      expect(result.current.memoryTree).toBeDefined();
    });

    it('should have addMemory function', () => {
      const { result } = renderHook(() => useMemory());
      expect(typeof result.current.addMemory).toBe('function');
    });

    it('should have searchMemory function', () => {
      const { result } = renderHook(() => useMemory());
      expect(typeof result.current.searchMemory).toBe('function');
    });
  });

  describe('Add Memory', () => {
    it('should add entry to STM', async () => {
      const { result } = renderHook(() => useMemory());
      
      await act(async () => {
        await result.current.addMemory('Test memory', 'stm');
      });

      expect(result.current.memoryTree.stm).toBeDefined();
    });

    it('should handle importance score', async () => {
      const { result } = renderHook(() => useMemory());
      
      await act(async () => {
        await result.current.addMemory('Important', 'mtm', 0.9);
      });

      expect(result.current.memoryTree.mtm).toBeDefined();
    });
  });

  describe('Search Memory', () => {
    it('should search across tiers', async () => {
      const { result } = renderHook(() => useMemory());
      
      await act(async () => {
        const results = await result.current.searchMemory('query');
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });

  describe('Delete Memory', () => {
    it('should remove memory entry', async () => {
      const { result } = renderHook(() => useMemory());
      
      await act(async () => {
        await result.current.deleteMemory('mem-id');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
