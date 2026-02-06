/**
 * Tests pour useIdentity Hook
 * Coverage: Identity management, Persistence, Validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdentity, useIdentityActions } from '@/hooks';

describe('useIdentity Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should expose the identity kernel state', () => {
      const { result } = renderHook(() => useIdentity());
      expect(result.current.identitySignature).toBeDefined();
      expect(result.current.identitySignature.narrativeStyle).toBe('architectural');
      expect(typeof result.current.globalCoherence).toBe('number');
      expect(typeof result.current.identityStability).toBe('number');
    });
  });

  describe('Actions', () => {
    it('should expose identity actions', () => {
      const { result } = renderHook(() => useIdentityActions());

      expect(typeof result.current.updateFromContext).toBe('function');
      expect(typeof result.current.alignBeforeResponse).toBe('function');
      expect(typeof result.current.setIdentityValue).toBe('function');
    });

    it('should allow updating identity values without throwing', () => {
      const { result } = renderHook(() => useIdentityActions());

      expect(() => {
        act(() => {
          result.current.setIdentityValue('tone', 0.5);
          result.current.alignBeforeResponse();
          result.current.updateFromContext({ conversationMode: 'default' });
        });
      }).not.toThrow();
    });
  });
});
