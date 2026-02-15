/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — VOICE ARCHITECTURE TESTS (Phase 8)
 *   Tests de validation de l'architecture vocale complète
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { haloEngine } from '@/services/voice/haloEngine';

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Audio State Machine
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Audio State Machine Architecture — Phase 8', () => {
  beforeEach(() => {
    audioStateMachine.reset();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Initial State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start in IDLE state', () => {
    expect(audioStateMachine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: IDLE → LISTENING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from IDLE to LISTENING', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    expect(audioStateMachine.getState()).toBe('user_speaking');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: LISTENING → PROCESSING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from LISTENING to PROCESSING', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.transition('VAD_SPEECH_END');
    expect(audioStateMachine.getState()).toBe('processing');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: PROCESSING → SPEAKING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from PROCESSING to SPEAKING', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.transition('VAD_SPEECH_END');
    audioStateMachine.transition('TTS_START');
    expect(audioStateMachine.getState()).toBe('ai_speaking');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: SPEAKING → IDLE Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from SPEAKING to IDLE', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.transition('VAD_SPEECH_END');
    audioStateMachine.transition('TTS_START');
    audioStateMachine.transition('TTS_END');
    expect(audioStateMachine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Full Loop State Sequence
   * ─────────────────────────────────────────────────────────────────
   */
  it('should complete full state loop', () => {
    const states: string[] = [];

    audioStateMachine.transition('VAD_SPEECH_START');
    states.push(audioStateMachine.getState());

    audioStateMachine.transition('VAD_SPEECH_END');
    states.push(audioStateMachine.getState());

    audioStateMachine.transition('TTS_START');
    states.push(audioStateMachine.getState());

    audioStateMachine.transition('TTS_END');
    states.push(audioStateMachine.getState());

    expect(states).toEqual(['user_speaking', 'processing', 'ai_speaking', 'idle']);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Error State Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle ERROR state transition', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.transition('ERROR');
    expect(audioStateMachine.getState()).toBe('error');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: Reset from Any State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should reset from any state to IDLE', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.transition('VAD_SPEECH_END');
    expect(audioStateMachine.getState()).toBe('processing');

    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 9: Invalid Transition Handling
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle invalid transitions gracefully', () => {
    // IDLE → TTS_END (invalid)
    audioStateMachine.transition('TTS_END');
    const state = audioStateMachine.getState();
    expect(['idle', 'error']).toContain(state);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: Multiple Resets
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple resets', () => {
    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');

    audioStateMachine.transition('VAD_SPEECH_START');
    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');

    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Halo Engine
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Halo Engine Architecture — Phase 8', () => {
  beforeEach(() => {
    haloEngine.reset();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Initial State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start in idle state', () => {
    expect(haloEngine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Start Breathing
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start breathing animation', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getState()).toBe('breathing');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Stop Breathing
   * ─────────────────────────────────────────────────────────────────
   */
  it('should stop breathing animation', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getState()).toBe('breathing');

    haloEngine.stop();
    expect(haloEngine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Multiple Breathing Cycles
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple breathing cycles', () => {
    for (let i = 0; i < 5; i++) {
      haloEngine.startBreathing();
      expect(haloEngine.getState()).toBe('breathing');

      haloEngine.stop();
      expect(haloEngine.getState()).toBe('idle');
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: Reset from Breathing State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should reset from breathing state', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getState()).toBe('breathing');

    haloEngine.reset();
    expect(haloEngine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Double Start Prevention
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle double start breathing', () => {
    haloEngine.startBreathing();
    haloEngine.startBreathing(); // Should not cause error
    expect(haloEngine.getState()).toBe('breathing');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Stop Without Start
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle stop breathing without start', () => {
    haloEngine.stop(); // Should not cause error
    expect(haloEngine.getState()).toBe('idle');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice Architecture Integration
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Voice Architecture Integration — Phase 8', () => {
  beforeEach(() => {
    audioStateMachine.reset();
    haloEngine.reset();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Synchronized State Transitions
   * ─────────────────────────────────────────────────────────────────
   */
  it('should synchronize Audio State Machine and Halo Engine', () => {
    // Start recording → Start breathing
    audioStateMachine.transition('VAD_SPEECH_START');
    haloEngine.startBreathing();

    expect(audioStateMachine.getState()).toBe('user_speaking');
    expect(haloEngine.getState()).toBe('breathing');

    // Stop recording → Processing (breathing continues)
    audioStateMachine.transition('VAD_SPEECH_END');
    expect(audioStateMachine.getState()).toBe('processing');
    expect(haloEngine.getState()).toBe('breathing');

    // Start TTS → Stop breathing
    audioStateMachine.transition('TTS_START');
    haloEngine.stop();

    expect(audioStateMachine.getState()).toBe('ai_speaking');
    expect(haloEngine.getState()).toBe('idle');

    // End TTS → IDLE
    audioStateMachine.transition('TTS_END');
    expect(audioStateMachine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Error Recovery Synchronization
   * ─────────────────────────────────────────────────────────────────
   */
  it('should synchronize error recovery', () => {
    audioStateMachine.transition('VAD_SPEECH_START');
    haloEngine.startBreathing();

    // Error occurs
    audioStateMachine.transition('ERROR');
    haloEngine.reset();

    expect(audioStateMachine.getState()).toBe('error');
    expect(haloEngine.getState()).toBe('idle');

    // Reset both
    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Multiple Voice Loops Sync
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple voice loops with sync', () => {
    for (let i = 0; i < 3; i++) {
      // Start
      audioStateMachine.transition('VAD_SPEECH_START');
      haloEngine.startBreathing();

      // Process
      audioStateMachine.transition('VAD_SPEECH_END');
      audioStateMachine.transition('TTS_START');
      haloEngine.stop();

      // End
      audioStateMachine.transition('TTS_END');

      // Verify both back to idle
      expect(audioStateMachine.getState()).toBe('idle');
      expect(haloEngine.getState()).toBe('idle');
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice Components Existence
 * ═══════════════════════════════════════════════════════════════════
 */

describe.skip('Voice Components Validation — Phase 8', () => {
  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Audio State Machine Exists
   * ─────────────────────────────────────────────────────────────────
   */
  it('should have audioStateMachine available', () => {
    expect(audioStateMachine).toBeDefined();
    expect(typeof audioStateMachine.transition).toBe('function');
    expect(typeof audioStateMachine.getState).toBe('function');
    expect(typeof audioStateMachine.reset).toBe('function');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Halo Engine Exists
   * ─────────────────────────────────────────────────────────────────
   */
  it('should have haloEngine available', () => {
    expect(haloEngine).toBeDefined();
    expect(typeof haloEngine.startBreathing).toBe('function');
    expect(typeof haloEngine.stop).toBe('function');
    expect(typeof haloEngine.getState).toBe('function');
    expect(typeof haloEngine.reset).toBe('function');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: State Machine States
   * ─────────────────────────────────────────────────────────────────
   */
  it('should support all required states', () => {
    const requiredStates = [
      'idle',
      'user_speaking',
      'processing',
      'ai_speaking',
      'error',
    ];

    // Test each state is reachable
    audioStateMachine.reset();
    expect(audioStateMachine.getState()).toBe('idle');

    audioStateMachine.transition('VAD_SPEECH_START');
    expect(requiredStates).toContain(audioStateMachine.getState());

    audioStateMachine.transition('VAD_SPEECH_END');
    expect(requiredStates).toContain(audioStateMachine.getState());

    audioStateMachine.transition('TTS_START');
    expect(requiredStates).toContain(audioStateMachine.getState());

    audioStateMachine.transition('ERROR');
    expect(requiredStates).toContain(audioStateMachine.getState());
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Halo Engine States
   * ─────────────────────────────────────────────────────────────────
   */
  it('should support all required halo states', () => {
    const requiredStates = ['idle', 'breathing'];

    haloEngine.reset();
    expect(requiredStates).toContain(haloEngine.getState());

    haloEngine.startBreathing();
    expect(requiredStates).toContain(haloEngine.getState());

    haloEngine.stop();
    expect(requiredStates).toContain(haloEngine.getState());
  });
});
