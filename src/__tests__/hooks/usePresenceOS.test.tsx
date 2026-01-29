/**
 * Tests pour usePresenceOS Hook
 * Coverage: Presence detection, Status updates, Idle tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresenceOS } from '@/hooks';

describe('usePresenceOS Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default presence', () => {
      const { result } = renderHook(() => usePresenceOS());
      expect(result.current.status).toBe('online');
    });

    it('should have setStatus method', () => {
      const { result } = renderHook(() => usePresenceOS());
      expect(typeof result.current.setStatus).toBe('function');
    });
  });

  describe('Status Management', () => {
    it('should update status', () => {
      const { result } = renderHook(() => usePresenceOS());

      act(() => {
        result.current.setStatus('away');
      });

      expect(result.current.status).toBe('away');
    });

    it('should support all status types', () => {
      const { result } = renderHook(() => usePresenceOS());

      const statuses = ['online', 'away', 'busy', 'offline'];

      statuses.forEach(status => {
        act(() => {
          result.current.setStatus(status as any);
        });
        expect(result.current.status).toBe(status);
      });
    });
  });

  describe('Idle Detection', () => {
    it('should detect idle after timeout', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => usePresenceOS({ idleTimeout: 5000 }));

      expect(result.current.isIdle).toBe(false);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.isIdle).toBe(true);

      vi.useRealTimers();
    });

    it('should reset idle on activity', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => usePresenceOS({ idleTimeout: 5000 }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.isIdle).toBe(true);

      act(() => {
        result.current.resetIdle();
      });
      expect(result.current.isIdle).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Activity Tracking', () => {
    it('should track last activity', () => {
      const { result } = renderHook(() => usePresenceOS());

      const initialTime = result.current.lastActivity;

      act(() => {
        result.current.recordActivity();
      });

      expect(result.current.lastActivity).toBeGreaterThan(initialTime);
    });

    it('should update on user interaction', () => {
      const { result } = renderHook(() => usePresenceOS({ trackActivity: true }));

      act(() => {
        window.dispatchEvent(new Event('mousemove'));
      });

      expect(result.current.lastActivity).toBeDefined();
    });
  });

  describe('Callbacks', () => {
    it('should call onStatusChange', () => {
      const onStatusChange = vi.fn();
      const { result } = renderHook(() => usePresenceOS({ onStatusChange }));

      act(() => {
        result.current.setStatus('away');
      });

      expect(onStatusChange).toHaveBeenCalledWith('away');
    });

    it('should call onIdle', async () => {
      vi.useFakeTimers();
      const onIdle = vi.fn();
      renderHook(() => usePresenceOS({ idleTimeout: 5000, onIdle }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onIdle).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => usePresenceOS({ trackActivity: true }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
