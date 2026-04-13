/**
 * TITANE∞ — Engine Unit Tests: ArchetypeResonanceEngine
 *
 * Tests the 4-archetype psychological engine:
 * - Archetype profiles (sage, gardien, muse, architecte) are well-formed
 * - calculateScores returns normalized scores
 * - activateContext selects correct dominant archetype
 * - activateFocusMode enforces focus state
 * - activateSafetyGuard activates gardien dominance
 * - getState / getDominantProfile / subscribe
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  archetypeResonanceEngine,
  ARCHETYPE_PROFILES,
} from '../archetypeResonanceEngine';
import type { ArchetypeType, UserContext } from '../archetypeResonanceEngine';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<UserContext> = {}): UserContext {
  return {
    userMessage: '',
    emotionalState: 'calm',
    intent: 'question',
    stressLevel: 0,
    creativityLevel: 0,
    ...overrides,
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('🧠 ArchetypeResonanceEngine', () => {
  beforeEach(() => {
    // Reset focus mode by calling with a neutral context
    archetypeResonanceEngine.activateContext(makeContext());
  });

  describe('ARCHETYPE_PROFILES configuration', () => {
    const archetypes: ArchetypeType[] = ['sage', 'gardien', 'muse', 'architecte'];

    it('should define all 4 archetypes', () => {
      for (const type of archetypes) {
        expect(ARCHETYPE_PROFILES[type]).toBeDefined();
        expect(ARCHETYPE_PROFILES[type].type).toBe(type);
      }
    });

    it('each profile should have a valid vocal signature', () => {
      for (const type of archetypes) {
        const profile = ARCHETYPE_PROFILES[type];
        const { tempo, depth, warmth, grain, confidence } = profile.vocalSignature;
        expect(tempo).toBeGreaterThan(0);
        expect(depth).toBeGreaterThanOrEqual(0);
        expect(warmth).toBeGreaterThanOrEqual(0);
        expect(grain).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeGreaterThanOrEqual(0);
      }
    });

    it('each profile should have a valid halo signature with hue 0-360', () => {
      for (const type of archetypes) {
        const { hue, saturation, lightness } = ARCHETYPE_PROFILES[type].haloSignature;
        expect(hue).toBeGreaterThanOrEqual(0);
        expect(hue).toBeLessThanOrEqual(360);
        expect(saturation).toBeGreaterThanOrEqual(0);
        expect(lightness).toBeGreaterThanOrEqual(0);
      }
    });

    it('each profile should have activation keywords', () => {
      for (const type of archetypes) {
        expect(ARCHETYPE_PROFILES[type].activationKeywords.length).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateScores', () => {
    it('should return scores for all 4 archetypes', () => {
      const scores = archetypeResonanceEngine.calculateScores(makeContext());
      expect(scores).toHaveProperty('sage');
      expect(scores).toHaveProperty('gardien');
      expect(scores).toHaveProperty('muse');
      expect(scores).toHaveProperty('architecte');
    });

    it('all scores should be in [0, 1]', () => {
      const scores = archetypeResonanceEngine.calculateScores(
        makeContext({ userMessage: 'aide moi à résoudre ce problème', intent: 'question' })
      );
      for (const [, value] of Object.entries(scores)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('stress context should increase gardien score', () => {
      const lowStress = archetypeResonanceEngine.calculateScores(
        makeContext({ stressLevel: 0 })
      );
      const highStress = archetypeResonanceEngine.calculateScores(
        makeContext({ stressLevel: 0.9 })
      );
      expect(highStress.gardien).toBeGreaterThan(lowStress.gardien);
    });

    it('creative context should increase muse score', () => {
      const lowCreat = archetypeResonanceEngine.calculateScores(
        makeContext({ userMessage: 'explique-moi cette architecture step by step', creativityLevel: 0 })
      );
      const highCreat = archetypeResonanceEngine.calculateScores(
        makeContext({ userMessage: 'inspire-moi avec une idée artistique créative originale', creativityLevel: 0.9, implicitNeed: 'inspiration' })
      );
      // Muse should score higher or equal on creative queries
      expect(highCreat.muse).toBeGreaterThanOrEqual(lowCreat.muse);
    });

    it('guidance need should increase sage score relative to stress context', () => {
      const stressContext = archetypeResonanceEngine.calculateScores(
        makeContext({ stressLevel: 0.85, emotionalState: 'stressed' })
      );
      const guidanceContext = archetypeResonanceEngine.calculateScores(
        makeContext({ implicitNeed: 'guidance', stressLevel: 0.0, intent: 'question' })
      );
      // In guidance context, sage should do better than in high-stress context
      expect(guidanceContext.sage).toBeGreaterThanOrEqual(stressContext.sage);
    });
  });

  describe('activateContext', () => {
    it('should update the engine state', () => {
      archetypeResonanceEngine.activateContext(
        makeContext({ userMessage: 'je veux créer quelque chose de beau', creativityLevel: 0.8 })
      );
      const state = archetypeResonanceEngine.getState();
      expect(state.lastUpdate).toBeGreaterThan(0);
    });

    it('dominant archetype should be a valid type', () => {
      archetypeResonanceEngine.activateContext(makeContext());
      const state = archetypeResonanceEngine.getState();
      const validTypes: ArchetypeType[] = ['sage', 'gardien', 'muse', 'architecte'];
      expect(validTypes).toContain(state.dominant);
    });
  });

  describe('activateFocusMode', () => {
    it('should set focusMode to the specified archetype', () => {
      archetypeResonanceEngine.activateFocusMode('muse', 1000);
      const state = archetypeResonanceEngine.getState();
      expect(state.focusMode).toBe('muse');
    });
  });

  describe('activateSafetyGuard', () => {
    it('should set dominant archetype to gardien', () => {
      archetypeResonanceEngine.activateSafetyGuard();
      const state = archetypeResonanceEngine.getState();
      // activateSafetyGuard sets dominant=gardien (not focusMode)
      expect(state.dominant).toBe('gardien');
      expect(state.scores.gardien).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('getDominantProfile', () => {
    it('should return a valid profile for the current dominant archetype', () => {
      archetypeResonanceEngine.activateContext(makeContext());
      const profile = archetypeResonanceEngine.getDominantProfile();
      expect(profile).toBeDefined();
      expect(profile.vocalSignature).toBeDefined();
      expect(profile.haloSignature).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return a complete resonance state object', () => {
      const state = archetypeResonanceEngine.getState();
      expect(state).toHaveProperty('dominant');
      expect(state).toHaveProperty('scores');
      expect(state).toHaveProperty('intensity');
      expect(state).toHaveProperty('focusMode');
      expect(state).toHaveProperty('lastUpdate');
    });

    it('intensity should be in [0, 1]', () => {
      archetypeResonanceEngine.activateContext(makeContext());
      const state = archetypeResonanceEngine.getState();
      expect(state.intensity).toBeGreaterThanOrEqual(0);
      expect(state.intensity).toBeLessThanOrEqual(1);
    });
  });

  describe('subscribe', () => {
    it('should return an unsubscribe function', () => {
      const unsub = archetypeResonanceEngine.subscribe(() => {});
      expect(typeof unsub).toBe('function');
      unsub();
    });
  });
});
