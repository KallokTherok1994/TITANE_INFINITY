import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@/test-utils';
import { useAudioChat } from '@/hooks/useAudioChat';

const {
  safeInvokeMock,
  recognitionStartMock,
  recognitionStopMock,
  speechCancelMock,
  audioContextCloseMock,
} = vi.hoisted(() => ({
  safeInvokeMock: vi.fn(),
  recognitionStartMock: vi.fn(),
  recognitionStopMock: vi.fn(),
  speechCancelMock: vi.fn(),
  audioContextCloseMock: vi.fn(),
}));

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'fr-FR';
  onstart: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start() {
    recognitionStartMock();
    this.onstart?.();
  }

  stop() {
    recognitionStopMock();
    this.onend?.();
  }
}

class MockAudioContext {
  close() {
    audioContextCloseMock();
    return Promise.resolve();
  }
}

vi.mock('@/utils/invoke', () => ({
  safeInvoke: safeInvokeMock,
}));

describe('useAudioChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    safeInvokeMock.mockResolvedValue({ success: true });

    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: MockSpeechRecognition,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: speechCancelMock,
      },
    });
  });

  it('stopSpeaking() should stop Tauri TTS and web speech fallback', async () => {
    const { result } = renderHook(() => useAudioChat({ enabled: true }));

    await act(async () => {
      await result.current.speak('Bonjour');
    });

    act(() => {
      result.current.stopSpeaking();
    });

    expect(safeInvokeMock).toHaveBeenCalledWith('tts_stop');
    expect(speechCancelMock).toHaveBeenCalledTimes(1);
    expect(result.current.isSpeaking).toBe(false);
  });
});
