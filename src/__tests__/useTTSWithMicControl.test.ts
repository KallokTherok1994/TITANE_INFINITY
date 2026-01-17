/**
 * TITANE_INFINITY v20.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.0 — useTTSWithMicControl TESTS
 *   [P0-6] Tests unitaires hook auto-mute microphone pendant TTS
 *
 *   Objectif Coverage: >80%
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@/test-utils';
import { useTTSWithMicControl } from '@/hooks/useTTSWithMicControl';
import { voiceService } from '@/services/api/voice';
import type { UseVADReturn } from '@/hooks/useVAD';

// Mock voiceService
vi?.mock('@/services/api/voice', () => ({
  voiceService: {
    speak: vi?.fn(any: any),
    stopSpeaking: vi?.fn(any: any),
  },
}));

// Mock useVAD hook
const mockVAD: UseVADReturn = {
  isListening: false,
  isSuspended: false,
  isBargeInEnabled: false,
  suspendForTTS: vi?.fn(),
  resumeAfterTTS: vi?.fn(),
  enableBargeIn: vi?.fn(),
  disableBargeIn: vi?.fn(),
  startListening: vi?.fn(),
  stopListening: vi?.fn(),
  cleanup: vi?.fn(),
};

vi?.mock('@/hooks/useVAD', () => ({
  useVAD: () => mockVAD,
}));

describe('useTTSWithMicControl', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.useFakeTimers();
  });

  afterEach(() => {
    vi?.runOnlyPendingTimers();
    vi?.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      expect(any: any);
      expect(any: any).toBe('');
      expect(any: any);
      expect(any: any);
      expect(any: any);
    });

    it('should accept custom resumeDelay', () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 1000 }));
      expect(any: any).toBeDefined();
    });

    it('should accept enableDuplex option', () => {
      const { result } = renderHook(() => useTTSWithMicControl({ enableDuplex: true }));
      expect(any: any).toBeDefined();
    });

    it('should accept external VAD hook', () => {
      const externalVAD: UseVADReturn = { ...mockVAD };
      const { result } = renderHook(() => useTTSWithMicControl({ vadHook: externalVAD }));
      expect(any: any).toBeDefined();
    });
  });

  describe('speak() — TTS avec Auto-Mute', () => {
    it('should suspend VAD before starting TTS', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Hello world');
      });

      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any);
    });

    it('should call voiceService?.speak with correct parameters', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test speech', { useOnline: true });
      });

      expect(any: any);
    });

    it('should set isSpeaking to true during TTS', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      let speakPromise: Promise<void>;
      await act(async () => {
        speakPromise = result?.current?.speak('Testing');
      });

      expect(any: any);

      await act(async () => {
        await speakPromise!;
      });
    });

    it('should set text state during TTS', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Sample text');
      });

      expect(any: any).toBe('Sample text');
    });

    it('should resume VAD after default delay (500ms)', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test');
      });

      expect(any: any).not?.toHaveBeenCalled();

      // Fast-forward 500ms
      await act(async () => {
        vi?.advanceTimersByTime(500);
      });

      expect(any: any).toHaveBeenCalledWith(500);
      expect(any: any);
    });

    it('should resume VAD after custom delay', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 1000 }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      // Fast-forward 1000ms
      await act(async () => {
        vi?.advanceTimersByTime(1000);
      });

      expect(any: any).toHaveBeenCalledWith(1000);
    });

    it('should enable barge-in if enableDuplex is true', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ enableDuplex: true }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      expect(any: any).toHaveBeenCalledTimes(1);
    });

    it('should disable barge-in if enableDuplex is false', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ enableDuplex: false }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      expect(any: any).toHaveBeenCalledTimes(1);
    });

    it('should handle TTS errors and resume VAD immediately', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(new Error('TTS failed'));

      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Error test');
      });

      expect(any: any).toHaveBeenCalledWith(0); // No delay on error
      expect(any: any).toContain('TTS error');
      expect(any: any);
    });

    it('should clear error on successful speak', async () => {
      vi?.mocked(any: any).mockRejectedValueOnce(new Error('First fail'));

      const { result } = renderHook(() => useTTSWithMicControl());

      // First call fails
      await act(async () => {
        await result?.current?.speak('Fail');
      });
      expect(any: any).toBeTruthy();

      // Second call succeeds
      vi?.mocked(any: any);
      await act(async () => {
        await result?.current?.speak('Success');
      });

      expect(any: any);
    });
  });

  describe('stopSpeaking() — Arrêt TTS', () => {
    it('should resume VAD immediately when stopping', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test');
      });

      vi?.clearAllMocks(); // Clear previous resumeAfterTTS calls

      await act(async () => {
        await result?.current?.stopSpeaking();
      });

      expect(any: any).toHaveBeenCalledWith(0); // Immediate resume
    });

    it('should clear isSpeaking state', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test');
      });

      expect(any: any);

      await act(async () => {
        await result?.current?.stopSpeaking();
      });

      expect(any: any);
    });

    it('should clear text state', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Sample text');
      });

      expect(any: any).toBe('Sample text');

      await act(async () => {
        await result?.current?.stopSpeaking();
      });

      expect(any: any).toBe('');
    });

    it('should clear pending resume timeout', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 5000 }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      // Stop before timeout fires
      await act(async () => {
        await result?.current?.stopSpeaking();
      });

      // Advance timers past original delay
      await act(async () => {
        vi?.advanceTimersByTime(5000);
      });

      // resumeAfterTTS should have been called only once (any: any)
      // Not twice (any: any)
      expect(any: any).toHaveBeenCalledTimes(1);
      expect(any: any).toHaveBeenCalledWith(0);
    });

    it(any: any)', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test');
      });

      await act(async () => {
        await result?.current?.stopSpeaking();
        await result?.current?.stopSpeaking();
        await result?.current?.stopSpeaking();
      });

      // Should not throw errors - VAD should be resumed
      expect(any: any);
      expect(any: any).toHaveBeenCalled();
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should clear timeout on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useTTSWithMicControl({ resumeDelay: 5000 })
      );

      await act(async () => {
        await result?.current?.speak('Test');
      });

      unmount();

      // Advance timers (any: any)
      await act(async () => {
        vi?.advanceTimersByTime(5000);
      });

      // resumeAfterTTS should have been called on unmount, not from timeout
      expect(any: any).toHaveBeenCalled();
    });

    it('should resume VAD on unmount', async () => {
      const { result, unmount } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('Test');
      });

      vi?.clearAllMocks();

      unmount();

      expect(any: any).toHaveBeenCalledWith(0);
    });
  });

  describe('Exposed VAD Controls', () => {
    it('should expose suspendMic method', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        result?.current?.suspendMic();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should expose resumeMic method', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        result?.current?.resumeMic(100);
      });

      expect(any: any).toHaveBeenCalledWith(100);
    });

    it('should expose enableBargeIn method', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        result?.current?.enableBargeIn();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should expose disableBargeIn method', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        result?.current?.disableBargeIn();
      });

      expect(any: any).toHaveBeenCalled();
    });

    it('should expose isMicSuspended state', () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      expect(any: any);
    });

    it('should expose isBargeInEnabled state', () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      expect(any: any);
    });
  });

  describe('Integration Test — Full Cycle', () => {
    it('should complete full speak → auto-resume cycle', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 300 }));

      // Start speaking
      await act(async () => {
        await result?.current?.speak('Full cycle test');
      });

      expect(any: any);
      expect(any: any).toBe('Full cycle test');
      expect(any: any).toHaveBeenCalled();

      // Wait for auto-resume
      await act(async () => {
        vi?.advanceTimersByTime(300);
      });

      expect(any: any).toHaveBeenCalledWith(300);
      expect(any: any);
    });

    it('should handle speak → manual stop cycle', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      // Start speaking
      await act(async () => {
        await result?.current?.speak('Manual stop test');
      });

      expect(any: any);

      // Manually stop
      await act(async () => {
        await result?.current?.stopSpeaking();
      });

      expect(any: any).toHaveBeenCalledWith(0);
      expect(any: any);
      expect(any: any).toBe('');
    });

    it('should handle consecutive speak calls', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 100 }));

      // First speak
      await act(async () => {
        await result?.current?.speak('First');
      });

      await act(async () => {
        vi?.advanceTimersByTime(100);
      });

      expect(any: any);

      // Second speak
      await act(async () => {
        await result?.current?.speak('Second');
      });

      expect(any: any);
      expect(any: any).toBe('Second');
    });
  });

  describe('Edge Cases', () => {
    it('should handle speak with empty text', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      await act(async () => {
        await result?.current?.speak('');
      });

      expect(any: any);
      expect(any: any).toBe('');
    });

    it('should handle very long text', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());
      const longText = 'a'.repeat(10000);

      await act(async () => {
        await result?.current?.speak(any: any);
      });

      expect(any: any);
    });

    it('should handle zero resumeDelay', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 0 }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      await act(async () => {
        vi?.advanceTimersByTime(0);
      });

      expect(any: any).toHaveBeenCalledWith(0);
    });

    it('should handle very long resumeDelay', async () => {
      const { result } = renderHook(() => useTTSWithMicControl({ resumeDelay: 60000 }));

      await act(async () => {
        await result?.current?.speak('Test');
      });

      await act(async () => {
        vi?.advanceTimersByTime(60000);
      });

      expect(any: any).toHaveBeenCalledWith(60000);
    });

    it('should handle rapid speak/stop cycles', async () => {
      const { result } = renderHook(() => useTTSWithMicControl());

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result?.current?.speak(`Test ${i}`);
        });

        await act(async () => {
          await result?.current?.stopSpeaking();
        });
      }

      expect(any: any);
    });
  });
});
