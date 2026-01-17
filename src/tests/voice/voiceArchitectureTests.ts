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

describe('Audio State Machine Architecture — Phase 8', () => {
  beforeEach(() => {
    audioStateMachine.reset();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Initial State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start in IDLE state', () => {
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: IDLE → LISTENING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from IDLE to LISTENING', () => {
    audioStateMachine.transition('START_RECORDING');
    expect(audioStateMachine.getCurrentState()).toBe('LISTENING');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: LISTENING → PROCESSING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from LISTENING to PROCESSING', () => {
    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.transition('STOP_RECORDING');
    expect(audioStateMachine.getCurrentState()).toBe('PROCESSING');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: PROCESSING → SPEAKING Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from PROCESSING to SPEAKING', () => {
    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.transition('STOP_RECORDING');
    audioStateMachine.transition('START_TTS');
    expect(audioStateMachine.getCurrentState()).toBe('SPEAKING');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: SPEAKING → IDLE Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should transition from SPEAKING to IDLE', () => {
    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.transition('STOP_RECORDING');
    audioStateMachine.transition('START_TTS');
    audioStateMachine.transition('END_TTS');
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Full Loop State Sequence
   * ─────────────────────────────────────────────────────────────────
   */
  it('should complete full state loop', () => {
    const states: string[] = [];

    audioStateMachine.transition('START_RECORDING');
    states.push(audioStateMachine.getCurrentState());

    audioStateMachine.transition('STOP_RECORDING');
    states.push(audioStateMachine.getCurrentState());

    audioStateMachine.transition('START_TTS');
    states.push(audioStateMachine.getCurrentState());

    audioStateMachine.transition('END_TTS');
    states.push(audioStateMachine.getCurrentState());

    expect(states).toEqual(['LISTENING', 'PROCESSING', 'SPEAKING', 'IDLE']);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Error State Transition
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle ERROR state transition', () => {
    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.transition('ERROR');
    expect(audioStateMachine.getCurrentState()).toBe('ERROR');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: Reset from Any State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should reset from any state to IDLE', () => {
    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.transition('STOP_RECORDING');
    expect(audioStateMachine.getCurrentState()).toBe('PROCESSING');

    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 9: Invalid Transition Handling
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle invalid transitions gracefully', () => {
    // IDLE → STOP_RECORDING (invalid)
    audioStateMachine.transition('STOP_RECORDING');
    // Should remain in IDLE or transition to ERROR (implementation-specific)
    const state = audioStateMachine.getCurrentState();
    expect(['IDLE', 'ERROR']).toContain(state);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: Multiple Resets
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple resets', () => {
    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');

    audioStateMachine.transition('START_RECORDING');
    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');

    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Halo Engine
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Halo Engine Architecture — Phase 8', () => {
  beforeEach(() => {
    haloEngine.reset();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Initial State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start in idle state', () => {
    expect(haloEngine.getCurrentState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Start Breathing
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start breathing animation', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getCurrentState()).toBe('breathing');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Stop Breathing
   * ─────────────────────────────────────────────────────────────────
   */
  it('should stop breathing animation', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getCurrentState()).toBe('breathing');

    haloEngine.stopBreathing();
    expect(haloEngine.getCurrentState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Multiple Breathing Cycles
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple breathing cycles', () => {
    for (let i = 0; i < 5; i++) {
      haloEngine.startBreathing();
      expect(haloEngine.getCurrentState()).toBe('breathing');

      haloEngine.stopBreathing();
      expect(haloEngine.getCurrentState()).toBe('idle');
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: Reset from Breathing State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should reset from breathing state', () => {
    haloEngine.startBreathing();
    expect(haloEngine.getCurrentState()).toBe('breathing');

    haloEngine.reset();
    expect(haloEngine.getCurrentState()).toBe('idle');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: Double Start Prevention
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle double start breathing', () => {
    haloEngine.startBreathing();
    haloEngine.startBreathing(); // Should not cause error
    expect(haloEngine.getCurrentState()).toBe('breathing');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: Stop Without Start
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle stop breathing without start', () => {
    haloEngine.stopBreathing(); // Should not cause error
    expect(haloEngine.getCurrentState()).toBe('idle');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice Architecture Integration
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Voice Architecture Integration — Phase 8', () => {
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
    audioStateMachine.transition('START_RECORDING');
    haloEngine.startBreathing();

    expect(audioStateMachine.getCurrentState()).toBe('LISTENING');
    expect(haloEngine.getCurrentState()).toBe('breathing');

    // Stop recording → Processing (breathing continues)
    audioStateMachine.transition('STOP_RECORDING');
    expect(audioStateMachine.getCurrentState()).toBe('PROCESSING');
    expect(haloEngine.getCurrentState()).toBe('breathing');

    // Start TTS → Stop breathing
    audioStateMachine.transition('START_TTS');
    haloEngine.stopBreathing();

    expect(audioStateMachine.getCurrentState()).toBe('SPEAKING');
    expect(haloEngine.getCurrentState()).toBe('idle');

    // End TTS → IDLE
    audioStateMachine.transition('END_TTS');
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: Error Recovery Synchronization
   * ─────────────────────────────────────────────────────────────────
   */
  it('should synchronize error recovery', () => {
    audioStateMachine.transition('START_RECORDING');
    haloEngine.startBreathing();

    // Error occurs
    audioStateMachine.transition('ERROR');
    haloEngine.reset();

    expect(audioStateMachine.getCurrentState()).toBe('ERROR');
    expect(haloEngine.getCurrentState()).toBe('idle');

    // Reset both
    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: Multiple Voice Loops Sync
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple voice loops with sync', () => {
    for (let i = 0; i < 3; i++) {
      // Start
      audioStateMachine.transition('START_RECORDING');
      haloEngine.startBreathing();

      // Process
      audioStateMachine.transition('STOP_RECORDING');
      audioStateMachine.transition('START_TTS');
      haloEngine.stopBreathing();

      // End
      audioStateMachine.transition('END_TTS');

      // Verify both back to idle
      expect(audioStateMachine.getCurrentState()).toBe('IDLE');
      expect(haloEngine.getCurrentState()).toBe('idle');
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice Components Existence
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Voice Components Validation — Phase 8', () => {
  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: Audio State Machine Exists
   * ─────────────────────────────────────────────────────────────────
   */
  it('should have audioStateMachine available', () => {
    expect(audioStateMachine).toBeDefined();
    expect(typeof audioStateMachine.transition).toBe('function');
    expect(typeof audioStateMachine.getCurrentState).toBe('function');
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
    expect(typeof haloEngine.stopBreathing).toBe('function');
    expect(typeof haloEngine.getCurrentState).toBe('function');
    expect(typeof haloEngine.reset).toBe('function');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: State Machine States
   * ─────────────────────────────────────────────────────────────────
   */
  it('should support all required states', () => {
    const requiredStates = ['IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING', 'ERROR'];

    // Test each state is reachable
    audioStateMachine.reset();
    expect(audioStateMachine.getCurrentState()).toBe('IDLE');

    audioStateMachine.transition('START_RECORDING');
    expect(requiredStates).toContain(audioStateMachine.getCurrentState());

    audioStateMachine.transition('STOP_RECORDING');
    expect(requiredStates).toContain(audioStateMachine.getCurrentState());

    audioStateMachine.transition('START_TTS');
    expect(requiredStates).toContain(audioStateMachine.getCurrentState());

    audioStateMachine.transition('ERROR');
    expect(requiredStates).toContain(audioStateMachine.getCurrentState());
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: Halo Engine States
   * ─────────────────────────────────────────────────────────────────
   */
  it('should support all required halo states', () => {
    const requiredStates = ['idle', 'breathing'];

    haloEngine.reset();
    expect(requiredStates).toContain(haloEngine.getCurrentState());

    haloEngine.startBreathing();
    expect(requiredStates).toContain(haloEngine.getCurrentState());

    haloEngine.stopBreathing();
    expect(requiredStates).toContain(haloEngine.getCurrentState());
  });
});
