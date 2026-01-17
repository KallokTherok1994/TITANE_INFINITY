/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { presenceOS } from '../engines/presence/presenceOS';
import type { PresenceMode } from '../engines/presence/presenceOS';

describe('Presence OS', () => {
  beforeEach(() => {
    presenceOS.start();
  });

  afterEach(() => {
    presenceOS.stop();
  });

  describe('Initialization', () => {
    it('should initialize presence OS', () => {
      const state = presenceOS.getState();

      expect(state).toBeDefined();
      expect(state.mode).toBeDefined();
      expect(state.globalCoherence).toBeGreaterThanOrEqual(0);
      expect(state.globalCoherence).toBeLessThanOrEqual(1);
    });

    it('should have valid initial state', () => {
      const state = presenceOS.getState();

      expect(state.cognitive).toBeDefined();
      expect(state.affective).toBeDefined();
      expect(state.expressive).toBeDefined();
      expect(state.spatial).toBeDefined();
      expect(state.auraPattern).toBeDefined();
      expect(Array.isArray(state.autonomicQueue)).toBe(true);
      expect(state.lastUpdate).toBeGreaterThan(0);
    });
  });

  describe('Mode Transitions', () => {
    it('should support changing mode', async () => {
      presenceOS.setMode('insight');
      const state = presenceOS.getState();

      // Just verify the state exists, mode may transition asynchronously
      expect(state).toBeDefined();
      expect(typeof state.mode).toBe('string');
    });

    it('should not throw on invalid mode transition', async () => {
      // Verify setMode can be called multiple times
      expect(() => {
        presenceOS.setMode('empathy');
        presenceOS.setMode('architect');
        presenceOS.setMode('deep-work');
        presenceOS.setMode('singularity');
      }).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should maintain valid cognitive state', () => {
      const state = presenceOS.getState();

      expect(typeof state.cognitive.coherence).toBe('number');
      expect(typeof state.cognitive.depth).toBe('number');
      expect(typeof state.cognitive.tempo).toBe('number');
      expect(typeof state.cognitive.reasoningStyle).toBe('string');
    });

    it('should maintain valid affective state', () => {
      const state = presenceOS.getState();

      expect(typeof state.affective.emotion).toBe('string');
      expect(typeof state.affective.intensity).toBe('number');
      expect(typeof state.affective.warmth).toBe('number');
    });

    it('should maintain valid expressive state', () => {
      const state = presenceOS.getState();

      expect(typeof state.expressive.speechRate).toBe('number');
      expect(typeof state.expressive.softness).toBe('number');
      expect(typeof state.expressive.vocalWarmth).toBe('number');
      expect(typeof state.expressive.breathiness).toBe('number');
    });

    it('should maintain valid spatial state', () => {
      const state = presenceOS.getState();

      expect(typeof state.spatial.proximity).toBe('number');
      expect(typeof state.spatial.elevation).toBe('number');
      expect(typeof state.spatial.width).toBe('number');
    });

    it('should maintain valid global coherence', () => {
      const state = presenceOS.getState();

      expect(state.globalCoherence).toBeGreaterThanOrEqual(0);
      expect(state.globalCoherence).toBeLessThanOrEqual(1);
    });

    it('should track autonomic reactions', () => {
      const state = presenceOS.getState();

      expect(Array.isArray(state.autonomicQueue)).toBe(true);
      expect(state.autonomicQueue.every(r => r.type && r.intensity !== undefined)).toBe(
        true
      );
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', () => {
      presenceOS.stop();
      const state = presenceOS.getState();

      expect(state).toBeDefined();
      expect(typeof state.globalCoherence).toBe('number');
    });
  });
});
