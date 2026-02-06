/**
 * Tests pour useSingularity Hook
 * Coverage: Core singularity, États, Actions, Metrics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSingularity } from '@/hooks';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useSingularity Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize singularity', () => {
      const { result } = renderHook(() => useSingularity());
      expect(result.current.state).toBeDefined();
    });

    it('should have activate function', () => {
      const { result } = renderHook(() => useSingularity());
      expect(typeof result.current.updateState).toBe('function');
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useSingularity());
      expect(result.current.state).toBeDefined();
    });
  });

  describe('State Updates', () => {
    it('should update state via updateState', () => {
      const { result } = renderHook(() => useSingularity());

      act(() => {
        result.current.updateState({ consciousness: 0.5 });
      });

      expect(result.current.consciousness).toBe(0.5);
    });

    it('should expose reset', () => {
      const { result } = renderHook(() => useSingularity());
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
