/**
 * Tests pour useKeyboardShortcuts Hook
 * Coverage: Enregistrement shortcuts, Callbacks, Cleanup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks';

describe('useKeyboardShortcuts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize shortcuts', () => {
      const shortcuts = [
        { key: 'n', ctrl: true, action: vi.fn() },
        { key: 's', ctrl: true, action: vi.fn() },
      ];

      const { result } = renderHook(() => useKeyboardShortcuts({ shortcuts }));
      expect(result).toBeDefined();
    });

    it('should register multiple shortcuts', () => {
      const shortcuts = [
        { key: 'a', ctrl: true, action: vi.fn() },
        { key: 'b', ctrl: true, action: vi.fn() },
        { key: 'c', ctrl: true, action: vi.fn() },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, excludeInputs: false }));
      // All shortcuts should be registered
    });
  });

  describe('Shortcut Triggering', () => {
    it('should trigger callback on shortcut', () => {
      const callback = vi.fn();
      const shortcuts = [{ key: 'n', ctrl: true, action: callback }];

      renderHook(() => useKeyboardShortcuts({ shortcuts, excludeInputs: false }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Shift modifier', () => {
      const callback = vi.fn();
      const shortcuts = [{ key: 's', ctrl: true, shift: true, action: callback }];

      renderHook(() => useKeyboardShortcuts({ shortcuts, excludeInputs: false }));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'S',
          ctrlKey: true,
          shiftKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Alt modifier', () => {
      const callback = vi.fn();
      const shortcuts = [{ key: 'f', alt: true, action: callback }];

      renderHook(() => useKeyboardShortcuts({ shortcuts, excludeInputs: false }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'f', altKey: true });
        window.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const callback = vi.fn();
      const shortcuts = [{ key: 'x', ctrl: true, action: callback }];

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({ shortcuts, excludeInputs: false })
      );

      unmount();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
        window.dispatchEvent(event);
      });

      // Callback should not be called after unmount
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Dynamic Updates', () => {
    it('should update shortcuts dynamically', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { rerender } = renderHook(
        ({
          shortcuts,
        }: {
          shortcuts: { key: string; ctrl?: boolean; action: () => void }[];
        }) => useKeyboardShortcuts({ shortcuts, excludeInputs: false }),
        { initialProps: { shortcuts: [{ key: '1', ctrl: true, action: callback1 }] } }
      );

      rerender({ shortcuts: [{ key: '2', ctrl: true, action: callback2 }] });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '2', ctrlKey: true });
        window.dispatchEvent(event);
      });

      expect(callback2).toHaveBeenCalled();
    });
  });
});
