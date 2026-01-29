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
      const shortcuts = {
        'Ctrl+N': vi.fn(),
        'Ctrl+S': vi.fn(),
      };

      const { result } = renderHook(() => useKeyboardShortcuts(shortcuts));
      expect(result).toBeDefined();
    });

    it('should register multiple shortcuts', () => {
      const shortcuts = {
        'Ctrl+A': vi.fn(),
        'Ctrl+B': vi.fn(),
        'Ctrl+C': vi.fn(),
      };

      renderHook(() => useKeyboardShortcuts(shortcuts));
      // All shortcuts should be registered
    });
  });

  describe('Shortcut Triggering', () => {
    it('should trigger callback on shortcut', () => {
      const callback = vi.fn();
      const shortcuts = { 'Ctrl+N': callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Shift modifier', () => {
      const callback = vi.fn();
      const shortcuts = { 'Ctrl+Shift+S': callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'S',
          ctrlKey: true,
          shiftKey: true,
        });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });

    it('should handle Alt modifier', () => {
      const callback = vi.fn();
      const shortcuts = { 'Alt+F': callback };

      renderHook(() => useKeyboardShortcuts(shortcuts));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'f', altKey: true });
        document.dispatchEvent(event);
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const callback = vi.fn();
      const shortcuts = { 'Ctrl+X': callback };

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
        document.dispatchEvent(event);
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
        ({ shortcuts }: { shortcuts: Record<string, () => void> }) =>
          useKeyboardShortcuts(shortcuts),
        { initialProps: { shortcuts: { 'Ctrl+1': callback1 } } }
      );

      rerender({ shortcuts: { 'Ctrl+2': callback2 } });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '2', ctrlKey: true });
        document.dispatchEvent(event);
      });

      expect(callback2).toHaveBeenCalled();
    });
  });
});
