/**
 * TITANE∞ — Engine Unit Tests: VoiceProsodyEngine
 *
 * Tests the VoiceProsodyEngine public API:
 * - Lifecycle (activate/deactivate)
 * - State initialization and default values
 * - State updates via updateState/updateProsody/updateTimbre/updateMicroDynamics
 * - SSML generation
 * - subscribe/unsubscribe pattern
 * - reset behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { voiceProsodyEngine } from '../voiceProsodyEngine';
import type { OrchestratedVoice } from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeOrchestratedVoice(overrides: Partial<OrchestratedVoice> = {}): OrchestratedVoice {
  return {
    prosody: { rate: 1.0, pitch: 1.0, volume: 0.8, emphasis: 0.6 },
    timbre: { warmth: 0.7, breathiness: 0.2, resonance: 0.6, clarity: 0.8 },
    microDynamics: {
      intonationVariation: 0.4,
      rhythmicFlow: 0.5,
      pausePlacement: 0.3,
      emotionalColoring: 0.6,
    },
    emotionalState: { valence: 0.5, activation: 0.6, dominance: 0.7 },
    ...overrides,
  };
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('🎵 VoiceProsodyEngine', () => {
  beforeEach(() => {
    voiceProsodyEngine.reset();
  });

  describe('initial state', () => {
    it('should be inactive by default after reset', () => {
      const state = voiceProsodyEngine.getState();
      expect(state.isActive).toBe(false);
    });

    it('should have default prosody values', () => {
      const prosody = voiceProsodyEngine.getProsody();
      expect(prosody.rate).toBe(1.0);
      expect(prosody.pitch).toBe(1.0);
      expect(prosody.volume).toBe(0.7);
      expect(prosody.emphasis).toBe(0.5);
    });

    it('should have default timbre values', () => {
      const timbre = voiceProsodyEngine.getTimbre();
      expect(timbre.warmth).toBe(0.5);
      expect(timbre.clarity).toBe(0.7);
    });

    it('should have zeroed metrics after reset', () => {
      const state = voiceProsodyEngine.getState();
      expect(state.metrics.updateCount).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('should activate and reflect isActive=true', () => {
      voiceProsodyEngine.activate();
      expect(voiceProsodyEngine.getState().isActive).toBe(true);
    });

    it('should deactivate and reflect isActive=false', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.deactivate();
      expect(voiceProsodyEngine.getState().isActive).toBe(false);
    });
  });

  describe('updateState', () => {
    it('should not update when inactive', () => {
      const before = voiceProsodyEngine.getProsody();
      voiceProsodyEngine.updateState(makeOrchestratedVoice({ prosody: { rate: 1.8, pitch: 1.5, volume: 0.9, emphasis: 0.9 } }));
      const after = voiceProsodyEngine.getProsody();
      // State should be unchanged when inactive
      expect(after.rate).toBe(before.rate);
    });

    it('should update prosody when active', () => {
      voiceProsodyEngine.activate();
      const voice = makeOrchestratedVoice({ prosody: { rate: 1.4, pitch: 1.2, volume: 0.9, emphasis: 0.7 } });
      voiceProsodyEngine.updateState(voice);
      const prosody = voiceProsodyEngine.getProsody();
      expect(prosody.rate).toBe(1.4);
      expect(prosody.pitch).toBe(1.2);
    });

    it('should increment updateCount when active', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.updateState(makeOrchestratedVoice());
      voiceProsodyEngine.updateState(makeOrchestratedVoice());
      expect(voiceProsodyEngine.getState().metrics.updateCount).toBe(2);
    });

    it('should update lastUpdate timestamp when active', () => {
      voiceProsodyEngine.activate();
      const before = Date.now();
      voiceProsodyEngine.updateState(makeOrchestratedVoice());
      expect(voiceProsodyEngine.getState().metrics.lastUpdate).toBeGreaterThanOrEqual(before);
    });
  });

  describe('updateProsody', () => {
    it('should update a single prosody parameter', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.updateProsody('rate', 1.6);
      expect(voiceProsodyEngine.getProsody().rate).toBe(1.6);
    });
  });

  describe('updateTimbre', () => {
    it('should update a single timbre parameter', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.updateTimbre('warmth', 0.9);
      expect(voiceProsodyEngine.getTimbre().warmth).toBe(0.9);
    });
  });

  describe('updateMicroDynamics', () => {
    it('should update a single microDynamics parameter', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.updateMicroDynamics('emotionalColoring', 0.85);
      expect(voiceProsodyEngine.getMicroDynamics().emotionalColoring).toBe(0.85);
    });
  });

  describe('SSML generation', () => {
    it('should return a non-empty SSML string for given text', () => {
      voiceProsodyEngine.activate();
      const ssml = voiceProsodyEngine.generateSSML('Bonjour, je suis TITANE.');
      expect(typeof ssml).toBe('string');
      expect(ssml.length).toBeGreaterThan(0);
    });

    it('should contain the input text in the SSML output', () => {
      voiceProsodyEngine.activate();
      const ssml = voiceProsodyEngine.generateSSML('TITANE test phrase');
      expect(ssml).toContain('TITANE test phrase');
    });
  });

  describe('subscribe/unsubscribe', () => {
    it('should call subscriber when state changes', () => {
      const callback = vi.fn();
      const unsub = voiceProsodyEngine.subscribe(callback);

      voiceProsodyEngine.activate();
      expect(callback).toHaveBeenCalled();

      unsub();
    });

    it('should stop calling subscriber after unsubscribe', () => {
      const callback = vi.fn();
      const unsub = voiceProsodyEngine.subscribe(callback);
      unsub();

      callback.mockClear();
      voiceProsodyEngine.activate();
      // The activate call after unsub should not reach this subscriber
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset to default state', () => {
      voiceProsodyEngine.activate();
      voiceProsodyEngine.updateState(makeOrchestratedVoice({ prosody: { rate: 1.9, pitch: 1.8, volume: 0.99, emphasis: 0.99 } }));
      voiceProsodyEngine.reset();

      const state = voiceProsodyEngine.getState();
      // Note: reset() preserves isActive (by design in voiceProsodyEngine.reset())
      // but resets prosody/metrics to defaults
      expect(state.prosody.rate).toBe(1.0);
      expect(state.metrics.updateCount).toBe(0);
    });
  });
});
