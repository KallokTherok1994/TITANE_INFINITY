/**
 * Tests pour useMediaQuery Hook
 * Coverage: Media query matching, Updates, Cleanup
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks';

describe('useMediaQuery Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with query match', () => {
      const mockMatch = { matches: true, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(true);
    });

    it('should initialize false when not matching', () => {
      const mockMatch = { matches: false, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(min-width: 2000px)'));
      expect(result.current).toBe(false);
    });
  });

  describe('Query Matching', () => {
    it('should match desktop query', () => {
      const mockMatch = { matches: true, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
      expect(result.current).toBe(true);
    });

    it('should match mobile query', () => {
      const mockMatch = { matches: true, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
      expect(result.current).toBe(true);
    });

    it('should match dark mode query', () => {
      const mockMatch = { matches: true, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));
      expect(result.current).toBe(true);
    });
  });

  describe('Updates', () => {
    it('should update on media query change', () => {
      let listener: ((e: any) => void) | undefined;
      const mockMatch = {
        matches: false,
        media: '',
        addEventListener: vi.fn((_, cb) => { listener = cb; }),
        removeEventListener: vi.fn()
      };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(false);

      act(() => {
        if (listener) {
          listener({ matches: true });
        }
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup listener on unmount', () => {
      const removeListener = vi.fn();
      const mockMatch = {
        matches: true,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: removeListener
      };
      vi.spyOn(window, 'matchMedia').mockReturnValue(mockMatch as any);

      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      unmount();

      expect(removeListener).toHaveBeenCalled();
    });
  });
});
