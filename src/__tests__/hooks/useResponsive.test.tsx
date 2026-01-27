/**
 * Tests pour useResponsive Hook
 * Coverage: Breakpoints, Resize events, Media queries
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '@/hooks';

describe('useResponsive Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should detect initial screen size', () => {
      global.innerWidth = 1024;
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isDesktop || result.current.isTablet).toBe(true);
    });

    it('should have breakpoint helpers', () => {
      const { result } = renderHook(() => useResponsive());
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.isTablet).toBe('boolean');
      expect(typeof result.current.isDesktop).toBe('boolean');
    });
  });

  describe('Breakpoints', () => {
    it('should detect mobile', () => {
      global.innerWidth = 375;
      const { result } = renderHook(() => useResponsive());
      
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(result.current.isMobile).toBe(true);
    });

    it('should detect tablet', () => {
      global.innerWidth = 768;
      const { result } = renderHook(() => useResponsive());
      
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(result.current.isTablet).toBe(true);
    });

    it('should detect desktop', () => {
      global.innerWidth = 1920;
      const { result } = renderHook(() => useResponsive());
      
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('Resize Handling', () => {
    it('should update on window resize', () => {
      global.innerWidth = 1920;
      const { result } = renderHook(() => useResponsive());
      
      expect(result.current.isDesktop).toBe(true);
      
      global.innerWidth = 375;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      
      // Should update to mobile
      expect(result.current.width).toBe(375);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useResponsive());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
