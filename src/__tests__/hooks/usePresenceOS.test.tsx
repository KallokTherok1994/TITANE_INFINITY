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
      expect(result.current.mode).toBe('neutral');
    });

    it('should have setStatus method', () => {
      const { result } = renderHook(() => usePresenceOS());
      expect(typeof result.current.setMode).toBe('function');
    });
  });

  describe('Status Management', () => {
    it('should update status', () => {
      const { result } = renderHook(() => usePresenceOS());

      act(() => {
        result.current.setMode('empathy');
      });

      expect(result.current.mode).toBe('empathy');
    });

    it('should support all status types', () => {
      const { result } = renderHook(() => usePresenceOS());

      const modes = [
        'neutral',
        'insight',
        'empathy',
        'architect',
        'deep-work',
        'singularity',
        'listening',
        'processing',
      ];

      modes.forEach(mode => {
        act(() => {
          result.current.setMode(mode as any);
        });
        expect(result.current.mode).toBe(mode);
      });
    });
  });
});
