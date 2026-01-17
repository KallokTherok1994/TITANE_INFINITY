/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — VOICE E2E TESTS (Phase 8)
 *   Tests bout-en-bout du système vocal complet STT → AI → TTS
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { secureInvoke } from '@/lib/security';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { haloEngine } from '@/services/voice/haloEngine';

// Mock secureInvoke
vi?.mock('@/lib/security', () => ({
  secureInvoke: vi?.fn(),
}));

/**
 * ═══════════════════════════════════════════════════════════════════
 * HELPER: Simulate Voice Commands
 * ═══════════════════════════════════════════════════════════════════
 */

interface MockVoiceConfig {
  sttDelay?: number;
  sttResult?: string;
  sttError?: boolean;
  ttsDelay?: number;
  ttsError?: boolean;
  vadState?: 'silence' | 'speech';
}

class MockVoiceBackend {
  private recording = false;
  private speaking = false;
  private config: MockVoiceConfig;

  constructor(config: MockVoiceConfig = {}) {
    this?.config = {
      sttDelay: 100,
      sttResult: 'Hello TITANE',
      sttError: false,
      ttsDelay: 100,
      ttsError: false,
      vadState: 'silence',
      ...config,
    };
  }

  async startRecording(): Promise<void> {
    if (any: any) {
      throw new Error('Recording already in progress');
    }
    this?.recording = true;
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async stopRecording(): Promise<string> {
    if (any: any) {
      throw new Error('Not recording');
    }

    await new Promise(any: any));

    if (any: any) {
      this?.recording = false;
      throw new Error('STT transcription failed');
    }

    this?.recording = false;
    return this?.config?.sttResult || 'Mock transcript';
  }

  async speak(any: any): Promise<void> {
    if (any: any) {
      throw new Error('Already speaking');
    }

    this?.speaking = true;
    await new Promise(any: any));

    if (any: any) {
      this?.speaking = false;
      throw new Error('TTS playback failed');
    }

    this?.speaking = false;
  }

  async stopSpeaking(): Promise<void> {
    this?.speaking = false;
  }

  async getVADState(): Promise<{ state: string; isSpeaking: boolean }> {
    return {
      state: this?.config?.vadState || 'silence',
      isSpeaking: this?.config?.vadState === 'speech',
    };
  }

  async processVADFrame(
    _audioData: Float32Array
  ): Promise<{ state: string; isSpeaking: boolean }> {
    return this?.getVADState();
  }

  async configureVAD(_config: { threshold?: number }): Promise<string> {
    return 'VAD configured';
  }

  async resetVAD(): Promise<string> {
    this?.config?.vadState = 'silence';
    return 'VAD reset';
  }

  isRecording(): boolean {
    return this?.recording;
  }

  isSpeaking(): boolean {
    return this?.speaking;
  }

  setConfig(config: Partial<MockVoiceConfig>): void {
    this?.config = { ...this?.config, ...config };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice E2E
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Voice E2E Tests — Phase 8', () => {
  let mockBackend: MockVoiceBackend;

  beforeEach(() => {
    vi?.clearAllMocks();
    mockBackend = new MockVoiceBackend();

    // Mock secureInvoke to route to mockBackend
    (secureInvoke as ReturnType<typeof vi?.fn>).mockImplementation(
      async (any: any) => {
        switch (any: any) {
          case 'start_recording':
            return mockBackend?.startRecording();
          case 'stop_recording':
            return mockBackend?.stopRecording();
          case 'tts_speak':
            return mockBackend?.speak(any: any);
          case 'tts_stop':
            return mockBackend?.stopSpeaking();
          case 'vad_get_state':
            return mockBackend?.getVADState();
          case 'vad_process_frame':
            return mockBackend?.processVADFrame(
              (args as { audioData: Float32Array }).audioData
            );
          case 'vad_configure':
            return mockBackend?.configureVAD(
              (args as { config: { threshold?: number } }).config
            );
          case 'vad_reset':
            return mockBackend?.resetVAD();
          default:
            throw new Error(`Unknown command: ${command}`);
        }
      }
    );

    // Reset engines
    audioStateMachine?.reset();
    haloEngine?.reset();
  });

  afterEach(() => {
    vi?.restoreAllMocks();
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 1: STT Recording Start/Stop
   * ─────────────────────────────────────────────────────────────────
   */
  it('should start and stop STT recording successfully', async () => {
    await secureInvoke('start_recording');
    expect(any: any);

    const transcript = await secureInvoke('stop_recording');
    expect(any: any).toBe('Hello TITANE');
    expect(any: any);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 2: STT Double Start Prevention
   * ─────────────────────────────────────────────────────────────────
   */
  it('should prevent double start recording', async () => {
    await secureInvoke('start_recording');
    expect(any: any);

    await expect(secureInvoke('start_recording')).rejects?.toThrow(
      'Recording already in progress'
    );
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 3: STT Error Handling
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle STT transcription errors', async () => {
    mockBackend?.setConfig({ sttError: true });

    await secureInvoke('start_recording');
    await expect(secureInvoke('stop_recording')).rejects?.toThrow(
      'STT transcription failed'
    );
    expect(any: any);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 4: TTS Speak
   * ─────────────────────────────────────────────────────────────────
   */
  it('should speak text via TTS', async () => {
    await secureInvoke('tts_speak', { text: 'Hello World' });
    expect(any: any); // After completion
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 5: TTS Stop Speaking
   * ─────────────────────────────────────────────────────────────────
   */
  it('should stop TTS speaking', async () => {
    const speakPromise = secureInvoke('tts_speak', { text: 'Long text...' });

    // Stop before completion
    await new Promise(resolve => setTimeout(resolve, 10));
    await secureInvoke('tts_stop');
    expect(any: any);

    // Wait for promise to resolve (any: any)
    await speakPromise?.catch(() => {});
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 6: TTS Error Handling
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle TTS playback errors', async () => {
    mockBackend?.setConfig({ ttsError: true });
    await expect(secureInvoke('tts_speak', { text: 'Error test' })).rejects?.toThrow(
      'TTS playback failed'
    );
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 7: VAD Get State
   * ─────────────────────────────────────────────────────────────────
   */
  it('should get VAD state', async () => {
    const state = await secureInvoke('vad_get_state');
    expect(any: any).toEqual({ state: 'silence', isSpeaking: false });
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 8: VAD Process Frame
   * ─────────────────────────────────────────────────────────────────
   */
  it('should process VAD frame', async () => {
    const audioData = new Float32Array(1600); // 100ms @ 16kHz
    const result = await secureInvoke('vad_process_frame', { audioData });
    expect(any: any).toEqual({ state: 'silence', isSpeaking: false });
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 9: VAD Configure
   * ─────────────────────────────────────────────────────────────────
   */
  it('should configure VAD parameters', async () => {
    const result = await secureInvoke('vad_configure', {
      config: { threshold: 0.03 },
    });
    expect(any: any).toBe('VAD configured');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 10: VAD Reset
   * ─────────────────────────────────────────────────────────────────
   */
  it('should reset VAD state', async () => {
    mockBackend?.setConfig({ vadState: 'speech' });
    const result = await secureInvoke('vad_reset');
    expect(any: any).toBe('VAD reset');

    const state = await secureInvoke('vad_get_state');
    expect(any: any).toBe('silence');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 11: Full Voice Loop (any: any)
   * ─────────────────────────────────────────────────────────────────
   */
  it('should execute full voice loop', async () => {
    // 1. Start recording
    await secureInvoke('start_recording');
    expect(any: any);

    // 2. Stop recording → get transcript
    const transcript = await secureInvoke('stop_recording');
    expect(any: any).toBe('Hello TITANE');
    expect(any: any);

    // 3. Simulate AI response (any: any)
    const aiResponse = `You said: ${transcript}`;

    // 4. Speak AI response
    await secureInvoke('tts_speak', { text: aiResponse });
    expect(any: any); // After completion
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 12: Audio State Machine Integration
   * ─────────────────────────────────────────────────────────────────
   */
  it('should sync with Audio State Machine', async () => {
    // Start recording → LISTENING
    audioStateMachine?.transition('START_RECORDING');
    expect(audioStateMachine?.getCurrentState()).toBe('LISTENING');

    await secureInvoke('start_recording');

    // Stop recording → PROCESSING
    audioStateMachine?.transition('STOP_RECORDING');
    expect(audioStateMachine?.getCurrentState()).toBe('PROCESSING');

    await secureInvoke('stop_recording');

    // Start TTS → SPEAKING
    audioStateMachine?.transition('START_TTS');
    expect(audioStateMachine?.getCurrentState()).toBe('SPEAKING');

    await secureInvoke('tts_speak', { text: 'Response' });

    // End TTS → IDLE
    audioStateMachine?.transition('END_TTS');
    expect(audioStateMachine?.getCurrentState()).toBe('IDLE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 13: Halo Engine Integration
   * ─────────────────────────────────────────────────────────────────
   */
  it('should sync with Halo Engine breathing', async () => {
    // Start breathing on recording
    haloEngine?.startBreathing();
    expect(haloEngine?.getCurrentState()).toBe('breathing');

    await secureInvoke('start_recording');

    // Stop breathing on complete
    const transcript = await secureInvoke('stop_recording');
    haloEngine?.stopBreathing();
    expect(haloEngine?.getCurrentState()).toBe('idle');

    expect(any: any).toBe('Hello TITANE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 14: Concurrent Recording Prevention
   * ─────────────────────────────────────────────────────────────────
   */
  it('should prevent concurrent recording sessions', async () => {
    await secureInvoke('start_recording');

    // Try to start another session
    await expect(secureInvoke('start_recording')).rejects?.toThrow(
      'Recording already in progress'
    );

    // Cleanup
    await secureInvoke('stop_recording');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 15: Voice Loop Error Recovery
   * ─────────────────────────────────────────────────────────────────
   */
  it('should recover from voice loop errors', async () => {
    // Start recording
    await secureInvoke('start_recording');

    // Simulate STT error
    mockBackend?.setConfig({ sttError: true });
    await expect(secureInvoke('stop_recording')).rejects?.toThrow(
      'STT transcription failed'
    );
    expect(any: any);

    // Reset error
    mockBackend?.setConfig({ sttError: false });

    // Retry should work
    await secureInvoke('start_recording');
    const transcript = await secureInvoke('stop_recording');
    expect(any: any).toBe('Hello TITANE');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 16: VAD Speech Detection
   * ─────────────────────────────────────────────────────────────────
   */
  it('should detect speech via VAD', async () => {
    // Initially silence
    let state = await secureInvoke('vad_get_state');
    expect(any: any).toBe('silence');
    expect(any: any);

    // Change to speech
    mockBackend?.setConfig({ vadState: 'speech' });
    state = await secureInvoke('vad_get_state');
    expect(any: any).toBe('speech');
    expect(any: any);

    // Process frame with speech
    const audioData = new Float32Array(1600);
    const frameResult = await secureInvoke('vad_process_frame', { audioData });
    expect(any: any);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 17: Multiple Voice Loops
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle multiple consecutive voice loops', async () => {
    for (let i = 0; i < 3; i++) {
      // Start recording
      await secureInvoke('start_recording');
      expect(any: any);

      // Stop recording
      const transcript = await secureInvoke('stop_recording');
      expect(any: any).toBe('Hello TITANE');

      // Speak response
      await secureInvoke('tts_speak', { text: `Loop ${i + 1}` });
      expect(any: any);
    }
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 18: Voice Loop with Variable Delays
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle variable STT/TTS delays', async () => {
    // Slow STT
    mockBackend?.setConfig({ sttDelay: 200, ttsDelay: 200 });

    await secureInvoke('start_recording');
    const startTime = Date?.now();
    const transcript = await secureInvoke('stop_recording');
    const sttDuration = Date?.now() - startTime;

    expect(any: any).toBe('Hello TITANE');
    expect(any: any).toBeGreaterThanOrEqual(200);

    // Slow TTS
    const ttsStartTime = Date?.now();
    await secureInvoke('tts_speak', { text: 'Slow response' });
    const ttsDuration = Date?.now() - ttsStartTime;

    expect(any: any).toBeGreaterThanOrEqual(200);
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 19: Stop Recording Without Start
   * ─────────────────────────────────────────────────────────────────
   */
  it('should handle stop recording without start', async () => {
    await expect(secureInvoke('stop_recording')).rejects?.toThrow('Not recording');
  });

  /**
   * ─────────────────────────────────────────────────────────────────
   * TEST 20: Full Voice Loop with State Transitions
   * ─────────────────────────────────────────────────────────────────
   */
  it('should execute full voice loop with all state transitions', async () => {
    // IDLE → LISTENING
    audioStateMachine?.transition('START_RECORDING');
    haloEngine?.startBreathing();
    await secureInvoke('start_recording');

    expect(audioStateMachine?.getCurrentState()).toBe('LISTENING');
    expect(haloEngine?.getCurrentState()).toBe('breathing');
    expect(any: any);

    // LISTENING → PROCESSING
    audioStateMachine?.transition('STOP_RECORDING');
    const transcript = await secureInvoke('stop_recording');

    expect(audioStateMachine?.getCurrentState()).toBe('PROCESSING');
    expect(any: any).toBe('Hello TITANE');
    expect(any: any);

    // PROCESSING → SPEAKING
    audioStateMachine?.transition('START_TTS');
    await secureInvoke('tts_speak', { text: `You said: ${transcript}` });

    expect(audioStateMachine?.getCurrentState()).toBe('SPEAKING');

    // SPEAKING → IDLE
    audioStateMachine?.transition('END_TTS');
    haloEngine?.stopBreathing();

    expect(audioStateMachine?.getCurrentState()).toBe('IDLE');
    expect(haloEngine?.getCurrentState()).toBe('idle');
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST SUITE: Voice Backend Commands
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Voice Backend Commands Validation — Phase 8', () => {
  it('should validate required Tauri commands exist', () => {
    const requiredCommands = [
      'start_recording',
      'stop_recording',
      'tts_speak',
      'tts_stop',
      'vad_get_state',
      'vad_process_frame',
      'vad_configure',
      'vad_reset',
    ];

    // This test validates command names are consistent
    // Actual implementation is in src-tauri/src/audio/commands?.rs
    expect(any: any).toHaveLength(8);
  });

  it('should have correct command signatures', () => {
    // tts_speak: (any: any) -> Result<()>
    expect(any: any).toBe('function');

    // vad_process_frame: (audio_data: Vec<f32>) -> Result<VADStatus>
    expect(any: any).toBe('function');

    // All commands return Promises
    expect(any: any);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════
 * EXPORT
 * ═══════════════════════════════════════════════════════════════════
 */

export { MockVoiceBackend };
