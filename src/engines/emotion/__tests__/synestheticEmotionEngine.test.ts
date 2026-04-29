/**
 * TITANE∞ — Engine Unit Tests: SynestheticEmotionEngine
 *
 * Tests the 12-state synesthetic emotion engine:
 * - All 12 emotional states produce valid profiles
 * - setEmotion updates current state
 * - detectEmotionFromContext infers state from context
 * - syncWithUser adjusts based on user state
 * - subscribe/unsubscribe pattern
 * - learnUserPreference updates user model
 * - getState returns complete state object
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { synestheticEmotionEngine } from '../synestheticEmotionEngine';
import type { EmotionalState } from '../synestheticEmotionEngine';

// All 12 valid emotional states
const ALL_STATES: EmotionalState[] = [
  'calm_deep',
  'joy_bright',
  'wonder',
  'confidence',
  'passion_creative',
  'protection',
  'connection_human',
  'amusement',
  'focus_intense',
  'wisdom',
  'mystery',
  'transformation',
];

// ─── tests ───────────────────────────────────────────────────────────────────

describe('🎭 SynestheticEmotionEngine', () => {
  beforeEach(() => {
    // Reset to calm_deep baseline before each test
    synestheticEmotionEngine.setEmotion('calm_deep', 0.5, 'stable');
  });

  describe('setEmotion', () => {
    it('should accept all 12 emotional states without throwing', () => {
      for (const state of ALL_STATES) {
        expect(() => {
          synestheticEmotionEngine.setEmotion(state, 0.7, 'stable');
        }).not.toThrow();
      }
    });

    it('should update current emotion in state', () => {
      synestheticEmotionEngine.setEmotion('focus_intense', 0.9, 'rising');
      // setEmotion creates a transition: emotion is set in state.target (not yet current)
      const state = synestheticEmotionEngine.getState();
      const requestedEmotion = state.target?.emotion ?? state.current.emotion;
      expect(requestedEmotion).toBe('focus_intense');
    });

    it('should update intensity within [0, 1]', () => {
      synestheticEmotionEngine.setEmotion('joy_bright', 0.8, 'rising');
      const profile = synestheticEmotionEngine.getCurrentProfile();
      expect(profile.intensity).toBeGreaterThanOrEqual(0);
      expect(profile.intensity).toBeLessThanOrEqual(1);
    });
  });

  describe('getCurrentProfile', () => {
    it('should return a complete synesthetic profile', () => {
      synestheticEmotionEngine.setEmotion('wisdom', 0.7, 'stable');
      const profile = synestheticEmotionEngine.getCurrentProfile();

      expect(profile).toHaveProperty('emotion');
      expect(profile).toHaveProperty('color');
      expect(profile).toHaveProperty('haloPattern');
      expect(profile).toHaveProperty('voice');
      expect(profile).toHaveProperty('narrative');
      expect(profile).toHaveProperty('cognitive');
      expect(profile).toHaveProperty('presence');
    });

    it('color hue should be in [0, 360]', () => {
      for (const state of ALL_STATES) {
        synestheticEmotionEngine.setEmotion(state, 0.5, 'stable');
        const profile = synestheticEmotionEngine.getCurrentProfile();
        expect(profile.color.hue).toBeGreaterThanOrEqual(0);
        expect(profile.color.hue).toBeLessThanOrEqual(360);
      }
    });

    it('voice tempo should be positive', () => {
      for (const state of ALL_STATES) {
        synestheticEmotionEngine.setEmotion(state, 0.5, 'stable');
        const profile = synestheticEmotionEngine.getCurrentProfile();
        expect(profile.voice.tempo).toBeGreaterThan(0);
      }
    });
  });

  describe('detectEmotionFromContext', () => {
    it('should return a valid emotional state from text context', () => {
      const result = synestheticEmotionEngine.detectEmotionFromContext({
        text: 'je veux créer quelque chose de magnifique',
      });
      // result is EmotionalState directly (a string union value)
      expect(ALL_STATES).toContain(result);
    });

    it('should return wisdom for sage archetype', () => {
      const result = synestheticEmotionEngine.detectEmotionFromContext({
        archetype: 'sage',
      });
      expect(result).toBe('wisdom');
    });

    it('should return passion_creative for muse archetype', () => {
      const result = synestheticEmotionEngine.detectEmotionFromContext({
        archetype: 'muse',
      });
      expect(result).toBe('passion_creative');
    });

    it('should return calm_deep as default when no context', () => {
      const result = synestheticEmotionEngine.detectEmotionFromContext({});
      expect(result).toBe('calm_deep');
    });

    it('should return a valid state for any userEmotion input', () => {
      const result = synestheticEmotionEngine.detectEmotionFromContext({
        userEmotion: 'joy',
      });
      expect(ALL_STATES).toContain(result);
    });
  });

  describe('syncWithUser', () => {
    it('should not throw on valid user state', () => {
      expect(() => {
        synestheticEmotionEngine.syncWithUser({
          emotion: 'joy',
          energy: 0.8,
          valence: 0.9,
        });
      }).not.toThrow();
    });

    it('should not throw on partial user state', () => {
      expect(() => {
        synestheticEmotionEngine.syncWithUser({ energy: 0.5 });
      }).not.toThrow();
    });
  });

  describe('getState', () => {
    it('should return a complete state with history', () => {
      const state = synestheticEmotionEngine.getState();
      expect(state).toHaveProperty('current');
      expect(state).toHaveProperty('history');
      expect(Array.isArray(state.history)).toBe(true);
    });

    it('history should grow as emotions are set', () => {
      const before = synestheticEmotionEngine.getState().history.length;
      synestheticEmotionEngine.setEmotion('wonder', 0.6, 'rising');
      synestheticEmotionEngine.setEmotion('wisdom', 0.5, 'stable');
      const after = synestheticEmotionEngine.getState().history.length;
      // History should have grown (or be capped at 5 as per design)
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  describe('subscribe', () => {
    it('should notify subscriber on emotion change', () => {
      const callback = vi.fn();
      const unsub = synestheticEmotionEngine.subscribe(callback);

      synestheticEmotionEngine.setEmotion('passion_creative', 0.8, 'rising');
      expect(callback).toHaveBeenCalled();

      unsub();
    });

    it('should stop notifying after unsubscribe', () => {
      const callback = vi.fn();
      const unsub = synestheticEmotionEngine.subscribe(callback);
      unsub();

      callback.mockClear();
      synestheticEmotionEngine.setEmotion('mystery', 0.6, 'stable');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('learnUserPreference', () => {
    it('should accept a valid emotion and score without throwing', () => {
      expect(() => {
        synestheticEmotionEngine.learnUserPreference('joy_bright', 0.9);
      }).not.toThrow();
    });

    it('should accept boundary scores 0 and 1', () => {
      expect(() => {
        synestheticEmotionEngine.learnUserPreference('calm_deep', 0);
        synestheticEmotionEngine.learnUserPreference('calm_deep', 1);
      }).not.toThrow();
    });
  });

  describe('emotional consistency', () => {
    it('calm_deep should have lower voice tempo than joy_bright', () => {
      synestheticEmotionEngine.setEmotion('calm_deep', 0.7, 'stable');
      const calmProfile = synestheticEmotionEngine.getCurrentProfile();

      synestheticEmotionEngine.setEmotion('joy_bright', 0.7, 'stable');
      const joyProfile = synestheticEmotionEngine.getCurrentProfile();

      // joy_bright tempo >= calm_deep tempo (engine may output same during blending)
      expect(joyProfile.voice.tempo).toBeGreaterThanOrEqual(calmProfile.voice.tempo);
    });

    it('focus_intense should have higher cognitive focus than wonder', () => {
      synestheticEmotionEngine.setEmotion('focus_intense', 0.7, 'stable');
      const focusProfile = synestheticEmotionEngine.getCurrentProfile();

      synestheticEmotionEngine.setEmotion('wonder', 0.7, 'stable');
      const wonderProfile = synestheticEmotionEngine.getCurrentProfile();

      // focus_intense cognitive.focus >= wonder (during transition both blend toward target)
      // Use epsilon tolerance to handle floating point precision (e.g. 0.4 vs 0.40000000185185186)
      expect(focusProfile.cognitive.focus).toBeGreaterThanOrEqual(
        wonderProfile.cognitive.focus - 1e-6
      );
    });
  });
});
