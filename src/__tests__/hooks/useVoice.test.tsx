/**
 * Tests pour useVoice Hook
 * Coverage: Recording, Transcription, États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVoice } from '@/hooks/useVoice';
import { resetWarnOnceRegistryForTests } from '@/utils/deprecationWarnings';

vi.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: {
    getStatus: vi.fn(async () => ({
      available: true,
      provider: 'tauri',
    })),
    speak: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
  },
}));

describe('useVoice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWarnOnceRegistryForTests();
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = undefined;
  });

  const renderUseVoice = async () => {
    const hook = renderHook(() => useVoice());

    await waitFor(() => {
      expect(hook.result.current.state.ttsProvider).toBe('tauri');
    });

    return hook;
  };

  describe('Initialization', () => {
    it('should initialize in idle state', async () => {
      const { result } = await renderUseVoice();
      expect(result.current.state.isListening).toBe(false);
      expect(result.current.state.isSpeaking).toBe(false);
    });

    it('should expose listening actions', async () => {
      const { result } = await renderUseVoice();
      expect(typeof result.current.startListening).toBe('function');
      expect(typeof result.current.stopListening).toBe('function');
    });

    it('should emit the deprecation warning only once across multiple mounts', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      const first = renderHook(() => useVoice());
      const second = renderHook(() => useVoice());

      await waitFor(() => {
        expect(first.result.current.state.ttsProvider).toBe('tauri');
        expect(second.result.current.state.ttsProvider).toBe('tauri');
      });

      const deprecationCalls = warnSpy.mock.calls.filter(([message]) =>
        String(message).includes('useVoice hook is deprecated')
      );

      expect(deprecationCalls).toHaveLength(1);

      first.unmount();
      second.unmount();
    });
  });

  describe('Listening/TTS', () => {
    it('should set error when SpeechRecognition is unavailable', async () => {
      const { result } = await renderUseVoice();

      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.state.error).toMatch(/not supported/i);
    });

    it('should stop listening without crashing', async () => {
      const { result } = await renderUseVoice();

      await act(async () => {
        await result.current.stopListening();
      });

      expect(result.current.state.isListening).toBe(false);
    });

    it('should speak text without setting error', async () => {
      const { result } = await renderUseVoice();

      await act(async () => {
        await result.current.speak('Bonjour TITANE');
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error and transcript state', async () => {
      const { result } = await renderUseVoice();

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        result.current.clearError();
        result.current.clearTranscript();
      });

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.transcript).toBe('');
    });
  });
});
