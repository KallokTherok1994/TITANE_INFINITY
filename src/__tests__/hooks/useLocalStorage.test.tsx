/**
 * Tests pour useLocalStorage Hook
 * Coverage: Get/Set, Persistence, JSON, Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('should load existing value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('stored-value');
    });

    it('should handle JSON objects', () => {
      const obj = { name: 'test', value: 123 };
      localStorage.setItem('obj-key', JSON.stringify(obj));
      const { result } = renderHook(() => useLocalStorage('obj-key', {}));
      expect(result.current[0]).toEqual(obj);
    });
  });

  describe('Set Value', () => {
    it('should update value', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'));
      
      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('persist-key', 'value1'));
      
      act(() => {
        result.current[1]('value2');
      });

      expect(localStorage.getItem('persist-key')).toBe(JSON.stringify('value2'));
    });

    it('should handle function updater', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));
      
      act(() => {
        result.current[1]((prev: number) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });
  });

  describe('Complex Types', () => {
    it('should store arrays', () => {
      const { result } = renderHook(() => useLocalStorage('array-key', []));
      
      act(() => {
        result.current[1]([1, 2, 3]);
      });

      expect(result.current[0]).toEqual([1, 2, 3]);
      expect(JSON.parse(localStorage.getItem('array-key')!)).toEqual([1, 2, 3]);
    });

    it('should store objects', () => {
      const { result } = renderHook(() => useLocalStorage('obj-key', {}));
      
      const obj = { name: 'test', nested: { value: 42 } };
      act(() => {
        result.current[1](obj);
      });

      expect(result.current[0]).toEqual(obj);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('invalid-key', 'invalid-json{');
      const { result } = renderHook(() => useLocalStorage('invalid-key', 'fallback'));
      expect(result.current[0]).toBe('fallback');
    });

    it('should handle localStorage quota exceeded', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() => useLocalStorage('quota-key', 'value'));
      
      act(() => {
        result.current[1]('large-value');
      });

      // Should not crash
      expect(result.current[0]).toBe('large-value');
      setItemSpy.mockRestore();
    });
  });
});
