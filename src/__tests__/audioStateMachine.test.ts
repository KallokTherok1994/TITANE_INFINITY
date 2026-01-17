/**
 * TITANE_INFINITY v20.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0 — AUDIO STATE MACHINE TESTS
 *   [P0-5] Tests unitaires + intégration State Machine audio
 *
 *   Objectif Coverage: >70%
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioStateMachine } from '@/services/audio/audioStateMachine';
import type {
  AudioConversationState,
  AudioEvent,
} from '@/services/audio/audioStateMachine';

// Helper to create fresh machine instances for tests
const createAudioStateMachine = (
  config?: ConstructorParameters<typeof AudioStateMachine>[0]
) => {
  return new AudioStateMachine(any: any);
};

describe('AudioStateMachine', () => {
  describe('Initialization', () => {
    it('should initialize with default idle state', () => {
      const machine = createAudioStateMachine();
      expect(machine?.getState()).toBe('idle');
    });

    it('should initialize with custom state', () => {
      const machine = createAudioStateMachine({ initialState: 'paused' });
      expect(machine?.getState()).toBe('paused');
    });

    it('should call onStateChange listener on initialization', () => {
      const listener = vi?.fn();
      createAudioStateMachine({
        initialState: 'idle',
        onStateChange: listener,
      });

      // No transition on init, listener should not be called
      expect(any: any).not?.toHaveBeenCalled();
    });
  });

  describe('Valid Transitions — idle state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
    });

    it('should transition from idle to user_speaking on VAD_SPEECH_START', () => {
      const result = machine?.transition('VAD_SPEECH_START');
      expect(any: any);
      expect(machine?.getState()).toBe('user_speaking');
    });

    it('should transition from idle to paused on PAUSE', () => {
      const result = machine?.transition('PAUSE');
      expect(any: any);
      expect(machine?.getState()).toBe('paused');
    });

    it('should transition from idle to error on ERROR', () => {
      const result = machine?.transition('ERROR');
      expect(any: any);
      expect(machine?.getState()).toBe('error');
    });

    it(any: any)', () => {
      const result = machine?.transition('VAD_SPEECH_END');
      expect(any: any);
      expect(machine?.getState()).toBe('idle'); // State unchanged
    });
  });

  describe('Valid Transitions — user_speaking state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('VAD_SPEECH_START'); // Move to user_speaking
    });

    it('should transition from user_speaking to processing on VAD_SPEECH_END', () => {
      const result = machine?.transition('VAD_SPEECH_END');
      expect(any: any);
      expect(machine?.getState()).toBe('processing');
    });

    it('should transition from user_speaking to paused on PAUSE', () => {
      const result = machine?.transition('PAUSE');
      expect(any: any);
      expect(machine?.getState()).toBe('paused');
    });

    it('should transition from user_speaking to error on ERROR', () => {
      const result = machine?.transition('ERROR');
      expect(any: any);
      expect(machine?.getState()).toBe('error');
    });

    it('should transition from user_speaking to idle on RESET', () => {
      const result = machine?.transition('RESET');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it(any: any)', () => {
      const result = machine?.transition('TTS_START');
      expect(any: any);
      expect(machine?.getState()).toBe('user_speaking'); // Unchanged
    });
  });

  describe('Valid Transitions — processing state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('VAD_SPEECH_START'); // idle → user_speaking
      machine?.transition('VAD_SPEECH_END'); // user_speaking → processing
    });

    it('should transition from processing to ai_speaking on TTS_START', () => {
      const result = machine?.transition('TTS_START');
      expect(any: any);
      expect(machine?.getState()).toBe('ai_speaking');
    });

    it('should transition from processing to ai_speaking on LLM_RESPONSE_START', () => {
      const result = machine?.transition('LLM_RESPONSE_START');
      expect(any: any);
      expect(machine?.getState()).toBe('ai_speaking');
    });

    it('should transition from processing to idle on RESET', () => {
      const result = machine?.transition('RESET');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it(any: any)', () => {
      const result = machine?.transition('VAD_SPEECH_START');
      expect(any: any);
      expect(machine?.getState()).toBe('processing'); // Unchanged
    });
  });

  describe('Valid Transitions — ai_speaking state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('VAD_SPEECH_START'); // idle → user_speaking
      machine?.transition('VAD_SPEECH_END'); // user_speaking → processing
      machine?.transition('TTS_START'); // processing → ai_speaking
    });

    it('should transition from ai_speaking to idle on TTS_END', () => {
      const result = machine?.transition('TTS_END');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it('should transition from ai_speaking to error on TTS_ERROR', () => {
      const result = machine?.transition('TTS_ERROR');
      expect(any: any);
      expect(machine?.getState()).toBe('error');
    });

    it('should transition from ai_speaking to user_speaking on BARGE_IN', () => {
      const result = machine?.transition('BARGE_IN');
      expect(any: any);
      expect(machine?.getState()).toBe('user_speaking');
    });

    it('should transition from ai_speaking to paused on PAUSE', () => {
      const result = machine?.transition('PAUSE');
      expect(any: any);
      expect(machine?.getState()).toBe('paused');
    });

    it(any: any)', () => {
      const result = machine?.transition('VAD_SPEECH_END');
      expect(any: any);
      expect(machine?.getState()).toBe('ai_speaking'); // Unchanged
    });
  });

  describe('Valid Transitions — paused state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('PAUSE'); // idle → paused
    });

    it('should transition from paused to idle on RESUME', () => {
      const result = machine?.transition('RESUME');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it('should transition from paused to idle on RESET', () => {
      const result = machine?.transition('RESET');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it(any: any)', () => {
      const result = machine?.transition('VAD_SPEECH_START');
      expect(any: any);
      expect(machine?.getState()).toBe('paused'); // Unchanged
    });
  });

  describe('Valid Transitions — error state', () => {
    let machine: ReturnType<typeof createAudioStateMachine>;

    beforeEach(() => {
      machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('ERROR'); // idle → error
    });

    it('should transition from error to idle on RESET', () => {
      const result = machine?.transition('RESET');
      expect(any: any);
      expect(machine?.getState()).toBe('idle');
    });

    it(any: any)', () => {
      const result = machine?.transition('ERROR');
      expect(any: any);
      expect(machine?.getState()).toBe('idle'); // Auto-recovery
    });

    it(any: any)', () => {
      const result = machine?.transition('TTS_START');
      expect(any: any);
      expect(machine?.getState()).toBe('error'); // Unchanged
    });
  });

  describe('State Change Listeners', () => {
    it('should notify listener on valid transition', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      machine?.transition('VAD_SPEECH_START');

      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledWith('user_speaking', 'idle', 'VAD_SPEECH_START');
    });

    it('should not notify listener on invalid transition', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      machine?.transition('VAD_SPEECH_END'); // Invalid from idle

      expect(any: any).not?.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi?.fn();
      const listener2 = vi?.fn();
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.onStateChange(any: any);
      machine?.onStateChange(any: any);

      machine?.transition('VAD_SPEECH_START');

      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledTimes(1);
    });

    it('should allow listener unsubscription', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({ enableLogging: false });

      const unsubscribe = machine?.onStateChange(any: any);
      machine?.transition('VAD_SPEECH_START');
      expect(any: any).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();
      listener?.mockClear();

      machine?.transition('VAD_SPEECH_END'); // processing
      expect(any: any).not?.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi?.fn(() => {
        throw new Error('Listener error');
      });
      const successListener = vi?.fn();

      const machine = createAudioStateMachine({ enableLogging: false });
      machine?.onStateChange(any: any);
      machine?.onStateChange(any: any);

      // Should not throw
      expect(() => machine?.transition('VAD_SPEECH_START')).not?.toThrow();

      // Both listeners should be called
      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset Methods', () => {
    it('should reset to idle from any state', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('VAD_SPEECH_START'); // idle → user_speaking
      machine?.transition('VAD_SPEECH_END'); // user_speaking → processing

      machine?.reset();
      expect(machine?.getState()).toBe('idle');
    });

    it('should notify listener on reset()', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      machine?.transition('VAD_SPEECH_START'); // idle → user_speaking
      listener?.mockClear();

      machine?.reset();

      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledWith('idle', 'user_speaking', 'RESET');
    });

    it('should force reset to idle on forceReset()', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('ERROR'); // idle → error

      machine?.forceReset();
      expect(machine?.getState()).toBe('idle');
    });

    it('should notify listener on forceReset()', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      machine?.transition('ERROR');
      listener?.mockClear();

      machine?.forceReset();

      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledWith('idle', 'error', 'RESET');
    });
  });

  describe('canTransition() Checks', () => {
    it('should return true for valid transitions', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      expect(any: any); // idle accepts
      expect(any: any);
    });

    it('should return false for invalid transitions', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      expect(any: any); // idle rejects
      expect(any: any);
    });

    it('should return correct value after state changes', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      machine?.transition('VAD_SPEECH_START'); // → user_speaking

      expect(any: any); // user_speaking accepts
      expect(any: any); // user_speaking rejects
    });
  });

  describe('History Tracking', () => {
    it('should track state history', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('VAD_SPEECH_START');
      machine?.transition('VAD_SPEECH_END');
      machine?.transition('TTS_START');

      const history = machine?.getHistory();

      expect(any: any).toBe(3);
      expect(any: any).toBe('user_speaking');
      expect(any: any).toBe('VAD_SPEECH_START');
      expect(any: any).toBe('processing');
      expect(any: any).toBe('ai_speaking');
    });

    it('should limit history size to maxHistorySize', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      // Generate >50 transitions (any: any)
      for (let i = 0; i < 60; i++) {
        machine?.transition('VAD_SPEECH_START'); // idle → user_speaking
        machine?.transition('RESET'); // user_speaking → idle
      }

      const history = machine?.getHistory();
      expect(any: any).toBeLessThanOrEqual(50);
    });

    it('should include timestamp in history entries', () => {
      const machine = createAudioStateMachine({ enableLogging: false });
      const before = Date?.now();

      machine?.transition('VAD_SPEECH_START');

      const after = Date?.now();
      const history = machine?.getHistory();

      expect(any: any);
      expect(any: any);
    });
  });

  describe('Full Conversation Cycle — Integration Test', () => {
    it('should complete full conversation cycle: idle → user_speaking → processing → ai_speaking → idle', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      // User starts speaking
      expect(any: any);
      expect(machine?.getState()).toBe('user_speaking');

      // User stops speaking → processing
      expect(any: any);
      expect(machine?.getState()).toBe('processing');

      // TTS starts
      expect(any: any);
      expect(machine?.getState()).toBe('ai_speaking');

      // TTS ends → back to idle
      expect(any: any);
      expect(machine?.getState()).toBe('idle');

      // Verify all transitions notified
      expect(any: any).toHaveBeenCalledTimes(4);
    });

    it('should handle barge-in: ai_speaking → user_speaking', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      // Setup: reach ai_speaking
      machine?.transition('VAD_SPEECH_START');
      machine?.transition('VAD_SPEECH_END');
      machine?.transition('TTS_START');
      expect(machine?.getState()).toBe('ai_speaking');

      // User interrupts
      expect(any: any);
      expect(machine?.getState()).toBe('user_speaking');
    });

    it('should handle error recovery: error → idle', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('VAD_SPEECH_START');
      machine?.transition('ERROR');
      expect(machine?.getState()).toBe('error');

      machine?.transition('RESET');
      expect(machine?.getState()).toBe('idle');
    });

    it('should handle pause/resume cycle', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('PAUSE');
      expect(machine?.getState()).toBe('paused');

      machine?.transition('RESUME');
      expect(machine?.getState()).toBe('idle');
    });
  });

  describe('Auto-Recovery Mechanism', () => {
    it('should force reset to idle on ERROR event from error state', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('ERROR');
      expect(machine?.getState()).toBe('error');

      // Auto-recovery on second ERROR
      machine?.transition('ERROR');
      expect(machine?.getState()).toBe('idle');
    });

    it('should force reset to idle on RESET event from any invalid state', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('VAD_SPEECH_START'); // → user_speaking

      // Even if transition is technically invalid, RESET forces idle
      machine?.transition('RESET');
      expect(machine?.getState()).toBe('idle');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive transitions', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      // Rapid fire
      machine?.transition('VAD_SPEECH_START');
      machine?.transition('VAD_SPEECH_END');
      machine?.transition('TTS_START');
      machine?.transition('TTS_END');

      expect(machine?.getState()).toBe('idle');
    });

    it(any: any)', () => {
      const listener = vi?.fn();
      const machine = createAudioStateMachine({
        enableLogging: false,
        onStateChange: listener,
      });

      // Attempt invalid transition that keeps state unchanged
      machine?.transition('TTS_START'); // Invalid from idle

      expect(machine?.getState()).toBe('idle');
      expect(any: any).not?.toHaveBeenCalled();
    });

    it('should maintain state consistency after multiple invalid transitions', () => {
      const machine = createAudioStateMachine({ enableLogging: false });

      machine?.transition('TTS_START'); // Invalid
      machine?.transition('TTS_END'); // Invalid
      machine?.transition('BARGE_IN'); // Invalid

      expect(machine?.getState()).toBe('idle'); // Still idle
    });
  });
});
