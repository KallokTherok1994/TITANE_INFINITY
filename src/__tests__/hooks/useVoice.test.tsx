/**
 * Tests pour useVoice Hook
 * Coverage: Recording, Transcription, États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoice } from '@/hooks/useVoice';

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
    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = undefined;
  });

  describe('Initialization', () => {
    it('should initialize in idle state', () => {
      const { result } = renderHook(() => useVoice());
      expect(result.current.state.isListening).toBe(false);
      expect(result.current.state.isSpeaking).toBe(false);
    });

    it('should expose listening actions', () => {
      const { result } = renderHook(() => useVoice());
      expect(typeof result.current.startListening).toBe('function');
      expect(typeof result.current.stopListening).toBe('function');
    });
  });

  describe('Listening/TTS', () => {
    it('should set error when SpeechRecognition is unavailable', async () => {
      const { result } = renderHook(() => useVoice());

      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.state.error).toMatch(/not supported/i);
    });

    it('should stop listening without crashing', async () => {
      const { result } = renderHook(() => useVoice());

      await act(async () => {
        await result.current.stopListening();
      });

      expect(result.current.state.isListening).toBe(false);
    });

    it('should speak text without setting error', async () => {
      const { result } = renderHook(() => useVoice());

      await act(async () => {
        await result.current.speak('Bonjour TITANE');
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear error and transcript state', async () => {
      const { result } = renderHook(() => useVoice());

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
