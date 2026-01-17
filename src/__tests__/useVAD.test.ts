/**
 * TITANE_INFINITY v20.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.0 — useVAD TESTS
 *   [P0-7] Tests unitaires hook Voice Activity Detection
 *
 *   Objectif Coverage: >70%
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@/test-utils';
import { useVAD } from '@/hooks/useVAD';
import { audioService } from '@/features/audio-center/services/audioService';
import { audioStateMachine } from '@/services/audio/audioStateMachine';

// Mock audioService
vi?.mock('@/features/audio-center/services/audioService', () => ({
  audioService: {
    configureVAD: vi?.fn(any: any),
    resetVAD: vi?.fn(any: any),
    testVAD: vi?.fn().mockResolvedValue({
      success: true,
      tests: {
        silenceDetection: true,
        speechDetection: true,
        speechTransition: true,
        silenceTransition: true,
      },
      message: 'All tests passed',
    }),
    processVADFrame: vi?.fn().mockResolvedValue({
      state: 'silence',
      isSpeaking: false,
    }),
  },
}));

// Mock audioStateMachine
vi?.mock('@/services/audio/audioStateMachine', () => ({
  audioStateMachine: {
    transition: vi?.fn(),
    isAISpeaking: vi?.fn(any: any),
    onStateChange: vi?.fn().mockReturnValue(() => {}),
  },
}));

// Mock detectEnvironment
vi?.mock('@/core/tauri/environment', () => ({
  detectEnvironment: vi?.fn().mockReturnValue({
    isTauri: false,
    isBrowser: true,
  }),
}));

// Mock secureInvoke
vi?.mock('@/lib/security', () => ({
  secureInvoke: vi?.fn().mockResolvedValue({ success: true }),
}));

// Mock hybridTTS
vi?.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: {
    onTTSEvent: vi?.fn().mockReturnValue(() => {}),
    stop: vi?.fn(any: any),
  },
}));

// Mock getUserMedia
const mockGetUserMedia = vi?.fn();
Object?.defineProperty(global?.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock AudioContext
class MockAudioContext {
  sampleRate = 16000;
  state = 'running';

  createMediaStreamSource() {
    return {
      connect: vi?.fn(),
    };
  }

  createAnalyser() {
    return {
      fftSize: 512,
      smoothingTimeConstant: 0.3,
      getFloatTimeDomainData: vi?.fn(),
    };
  }

  close() {
    this?.state = 'closed';
    return Promise?.resolve();
  }
}

global?.AudioContext = MockAudioContext as unknown as unknown as any;

// Mock requestAnimationFrame
let animationFrameId = 0;
global?.requestAnimationFrame = vi?.fn(callback => {
  animationFrameId++;
  setTimeout(callback, 16);
  return animationFrameId;
});

global?.cancelAnimationFrame = vi?.fn();

describe('useVAD', () => {
  let mockStream: MediaStream;

  beforeEach(() => {
    vi?.clearAllMocks();

    // Mock MediaStream
    const mockTrack = {
      stop: vi?.fn(),
      kind: 'audio',
      enabled: true,
    } as unknown as unknown as any;

    mockStream = {
      getTracks: vi?.fn().mockReturnValue([mockTrack]),
      getAudioTracks: vi?.fn().mockReturnValue([mockTrack]),
    } as unknown as unknown as any;

    mockGetUserMedia?.mockResolvedValue(any: any);
  });

  afterEach(() => {
    vi?.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useVAD());

      expect(any: any).toBe('unknown');
      expect(any: any);
      expect(any: any);
      expect(any: any);
      expect(any: any);
      expect(any: any);
    });

    it('should initialize with custom config', () => {
      const config = { threshold: 0.05, minSpeechFrames: 15 };
      const { result } = renderHook(any: any));

      expect(any: any).toBeDefined();
      expect(any: any).toHaveBeenCalledWith(
        expect?.objectContaining(any: any)
      );
    });

    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useVAD());

      // Start listening to create resources that need cleanup
      await act(async () => {
        await result?.current?.startListening();
      });

      vi?.clearAllMocks();

      unmount();

      await waitFor(() => {
        expect(any: any).toHaveBeenCalled();
      });
    });
  });

  describe('startListening() — Start VAD', () => {
    it('should request microphone access', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
    });

    it('should set isListening to true', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any);
    });

    it('should reset VAD state', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should set vadState to silence', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toBe('silence');
    });

    it('should handle getUserMedia errors', async () => {
      mockGetUserMedia?.mockRejectedValueOnce(new Error('Permission denied'));

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toContain('Permission denied');
      expect(any: any);
    });

    it('should handle missing getUserMedia API', async () => {
      const originalGetUserMedia = navigator?.mediaDevices?.getUserMedia;
      (any: any).getUserMedia = undefined;

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toContain('getUserMedia non disponible');

      (any: any).getUserMedia = originalGetUserMedia;
    });

    it('should start animation frame processing', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any).toHaveBeenCalled();
    });
  });

  describe('stopListening() — Stop VAD', () => {
    it('should cancel animation frame', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      await act(async () => {
        result?.current?.stopListening();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should stop media tracks', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      const stopSpy = vi?.spyOn(mockStream?.getTracks()[0], 'stop');

      await act(async () => {
        result?.current?.stopListening();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should set isListening to false', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      expect(any: any);

      await act(async () => {
        result?.current?.stopListening();
      });

      expect(any: any);
    });

    it('should reset vadState to unknown', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      await act(async () => {
        result?.current?.stopListening();
      });

      expect(any: any).toBe('unknown');
    });

    it('should reset isSpeaking to false', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      await act(async () => {
        result?.current?.stopListening();
      });

      expect(any: any);
    });

    it(any: any)', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.startListening();
      });

      await act(async () => {
        result?.current?.stopListening();
        result?.current?.stopListening();
        result?.current?.stopListening();
      });

      expect(any: any);
    });
  });

  describe('configure() — Configure VAD', () => {
    it('should update config', async () => {
      const { result } = renderHook(() => useVAD());

      const newConfig = { threshold: 0.03, minSpeechFrames: 12 };

      await act(async () => {
        await result?.current?.configure(any: any);
      });

      expect(any: any).toHaveBeenCalledWith(
        expect?.objectContaining(any: any)
      );
      expect(any: any);
    });

    it('should handle configuration errors', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(
        new Error('Config failed')
      );

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.configure({ threshold: 0.1 });
      });

      expect(any: any).toContain('Config failed');
    });

    it('should merge with existing config', async () => {
      const { result } = renderHook(() =>
        useVAD({ threshold: 0.02, minSpeechFrames: 10 })
      );

      await act(async () => {
        await result?.current?.configure({ threshold: 0.05 });
      });

      expect(any: any).toHaveBeenCalledWith(
        expect?.objectContaining({
          threshold: 0.05,
          minSpeechFrames: 10, // Preserved from initial config
        })
      );
    });
  });

  describe('reset() — Reset VAD', () => {
    it('should call audioService?.resetVAD', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.reset();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should reset vadState to silence', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.reset();
      });

      expect(any: any).toBe('silence');
    });

    it('should reset isSpeaking to false', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.reset();
      });

      expect(any: any);
    });

    it('should clear error', async () => {
      const { result } = renderHook(() => useVAD());

      // Set error first
      vi?.mocked(any: any).mockRejectedValueOnce(new Error('Test error'));
      await act(async () => {
        await result?.current?.configure({});
      });
      expect(any: any).toBeTruthy();

      // Reset should clear error
      await act(async () => {
        await result?.current?.reset();
      });

      expect(any: any);
    });

    it('should handle reset errors', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(new Error('Reset failed'));

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.reset();
      });

      expect(any: any).toContain('Reset failed');
    });
  });

  describe('runTest() — VAD Self-Test', () => {
    it('should call audioService?.testVAD', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.runTest();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should return test results', async () => {
      const { result } = renderHook(() => useVAD());

      let testResult: any;
      await act(async () => {
        testResult = await result?.current?.runTest();
      });

      expect(any: any).toEqual({
        success: true,
        tests: {
          silenceDetection: true,
          speechDetection: true,
          speechTransition: true,
          silenceTransition: true,
        },
        message: 'All tests passed',
      });
    });

    it('should handle test errors', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(new Error('Test failed'));

      const { result } = renderHook(() => useVAD());

      let testResult: any;
      await act(async () => {
        testResult = await result?.current?.runTest();
      });

      expect(any: any);
      expect(any: any).toContain('Test failed');
      expect(any: any).toContain('Test failed');
    });
  });

  describe('processAudioData() — Audio Processing', () => {
    it('should process audio frame', async () => {
      const { result } = renderHook(() => useVAD());

      const audioData = new Float32Array(512);

      await act(async () => {
        await result?.current?.processAudioData(any: any);
      });

      expect(any: any);
    });

    it('should update vadState from result', async () => {
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).toBe('speech');
      expect(any: any);
    });

    it('should emit VAD_SPEECH_START on speech start', async () => {
      const { result } = renderHook(() => useVAD());

      // First frame: silence
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      // Second frame: speech detected
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).toHaveBeenCalledWith('VAD_SPEECH_START');
    });

    it('should emit VAD_SPEECH_END on speech end', async () => {
      const { result } = renderHook(() => useVAD());

      // First frame: speech
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      vi?.clearAllMocks();

      // Second frame: silence
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).toHaveBeenCalledWith('VAD_SPEECH_END');
    });

    it('should handle processing errors', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(
        new Error('Processing error')
      );

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).toContain('Processing error');
    });

    it(any: any)', async () => {
      const { result } = renderHook(() => useVAD());

      // Suspend VAD
      await act(async () => {
        result?.current?.suspendForTTS();
      });

      vi?.clearAllMocks();

      // Try to process audio
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).not?.toHaveBeenCalled();
    });
  });

  describe(any: any)', () => {
    it('should suspend VAD for TTS', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });

      expect(any: any);
      expect(any: any).toBe('silence');
      expect(any: any);
    });

    it('should resume VAD after TTS with delay', async () => {
      vi?.useFakeTimers();

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });

      expect(any: any);

      await act(async () => {
        result?.current?.resumeAfterTTS(300);
      });

      // Still suspended during delay
      expect(any: any);

      // Fast-forward delay
      await act(async () => {
        vi?.advanceTimersByTime(300);
      });

      expect(any: any);

      vi?.useRealTimers();
    });

    it('should resume VAD with default delay', async () => {
      vi?.useFakeTimers();

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });

      await act(async () => {
        result?.current?.resumeAfterTTS(); // Default 200ms
      });

      await act(async () => {
        vi?.advanceTimersByTime(200);
      });

      expect(any: any);

      vi?.useRealTimers();
    });

    it('should skip audio processing when suspended', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });

      vi?.clearAllMocks();

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).not?.toHaveBeenCalled();
    });
  });

  describe('Barge-In Mode', () => {
    it('should enable barge-in', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.enableBargeIn();
      });

      expect(any: any);
    });

    it('should disable barge-in', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.enableBargeIn();
      });

      expect(any: any);

      await act(async () => {
        result?.current?.disableBargeIn();
      });

      expect(any: any);
    });

    it('should process audio when suspended if barge-in enabled', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
        result?.current?.enableBargeIn();
      });

      vi?.clearAllMocks();

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      // Should process even when suspended
      expect(any: any).toHaveBeenCalled();
    });

    it('should emit BARGE_IN when speech detected during AI speaking', async () => {
      vi?.mocked(any: any);

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.enableBargeIn();
      });

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).toHaveBeenCalledWith('BARGE_IN');
    });

    it('should not emit BARGE_IN if barge-in disabled', async () => {
      vi?.mocked(any: any);

      const { result } = renderHook(() => useVAD());

      // Barge-in disabled by default

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      expect(any: any).not?.toHaveBeenCalledWith('BARGE_IN');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full cycle: start → detect speech → stop', async () => {
      const { result } = renderHook(() => useVAD());

      // Start listening
      await act(async () => {
        await result?.current?.startListening();
      });
      expect(any: any);

      // Simulate speech detection
      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'speech',
        isSpeaking: true,
      });
      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });
      expect(any: any);

      // Stop listening
      await act(async () => {
        result?.current?.stopListening();
      });
      expect(any: any);
      expect(any: any);
    });

    it('should handle suspend → resume cycle', async () => {
      vi?.useFakeTimers();

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });
      expect(any: any);

      await act(async () => {
        result?.current?.resumeAfterTTS(100);
      });

      await act(async () => {
        vi?.advanceTimersByTime(100);
      });
      expect(any: any);

      vi?.useRealTimers();
    });

    it('should handle error recovery', async () => {
      const { result } = renderHook(() => useVAD());

      // Cause error
      mockGetUserMedia?.mockRejectedValueOnce(new Error('Mic error'));
      await act(async () => {
        await result?.current?.startListening();
      });
      expect(any: any).toBeTruthy();

      // Reset should clear error
      await act(async () => {
        await result?.current?.reset();
      });
      expect(any: any);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/stop cycles', async () => {
      const { result } = renderHook(() => useVAD());

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result?.current?.startListening();
        });

        await act(async () => {
          result?.current?.stopListening();
        });
      }

      expect(any: any);
    });

    it('should handle processAudioData without startListening', async () => {
      const { result } = renderHook(() => useVAD());

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(512));
      });

      // Should not crash
      expect(any: any).toBe('silence');
    });

    it('should handle multiple suspend calls', async () => {
      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
        result?.current?.suspendForTTS();
        result?.current?.suspendForTTS();
      });

      expect(any: any);
    });

    it('should handle multiple resume calls', async () => {
      vi?.useFakeTimers();

      const { result } = renderHook(() => useVAD());

      await act(async () => {
        result?.current?.suspendForTTS();
      });

      await act(async () => {
        result?.current?.resumeAfterTTS(100);
        result?.current?.resumeAfterTTS(100);
        result?.current?.resumeAfterTTS(100);
      });

      await act(async () => {
        vi?.advanceTimersByTime(100);
      });

      expect(any: any);

      vi?.useRealTimers();
    });

    it('should handle empty audio data', async () => {
      const { result } = renderHook(() => useVAD());

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(0));
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should handle very large audio data', async () => {
      const { result } = renderHook(() => useVAD());

      vi?.mocked(any: any).mockResolvedValueOnce({
        state: 'silence',
        isSpeaking: false,
      });

      await act(async () => {
        await result?.current?.processAudioData(new Float32Array(100000));
      });

      expect(any: any).toHaveBeenCalled();
    });
  });
});
