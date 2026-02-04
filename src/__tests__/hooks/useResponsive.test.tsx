/**
 * Tests pour useResponsive Hook
 * Coverage: Breakpoints, reactive updates, cleanup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '@/hooks';
import {
  __setContext,
  __getListenerCount,
} from '@/engines/uiux/detectors/ContextDetector';

vi.mock('@/engines/uiux/detectors/ContextDetector', () => {
  let currentContext = {
    screenWidth: 1024,
    screenHeight: 768,
    pixelRatio: 1,
    orientation: 'landscape' as const,
    platform: 'desktop' as const,
    inputMode: 'mouse' as const,
    colorScheme: 'system' as const,
    reducedMotion: false,
    highContrast: false,
    timestamp: Date.now(),
  };

  const listeners = new Set<(context: typeof currentContext) => void>();

  class ContextDetector {
    init(): void {}

    detect() {
      return currentContext;
    }

    onChange(cb: (context: typeof currentContext) => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    }
  }

  const __setContext = (next: Partial<typeof currentContext>) => {
    currentContext = {
      ...currentContext,
      ...next,
      timestamp: Date.now(),
    };
    listeners.forEach(listener => listener(currentContext));
  };

  const __getListenerCount = () => listeners.size;

  return { ContextDetector, __setContext, __getListenerCount };
});

describe('useResponsive Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should detect initial screen size', () => {
      __setContext({ screenWidth: 1024, screenHeight: 768, platform: 'desktop' });
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
      __setContext({ screenWidth: 375, screenHeight: 812, platform: 'mobile' });
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isMobile).toBe(true);
    });

    it('should detect tablet', () => {
      __setContext({ screenWidth: 768, screenHeight: 1024, platform: 'tablet' });
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isTablet).toBe(true);
    });

    it('should detect desktop', () => {
      __setContext({ screenWidth: 1920, screenHeight: 1080, platform: 'desktop' });
      const { result } = renderHook(() => useResponsive());
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('Reactive Updates', () => {
    it('should update on context change', () => {
      __setContext({ screenWidth: 1920, screenHeight: 1080, platform: 'desktop' });
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        __setContext({ screenWidth: 375, screenHeight: 812, platform: 'mobile' });
      });

      expect(result.current.width).toBe(375);
      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup listeners on unmount', () => {
      const { unmount } = renderHook(() => useResponsive());
      expect(__getListenerCount()).toBe(1);

      unmount();

      expect(__getListenerCount()).toBe(0);
    });
  });
});
