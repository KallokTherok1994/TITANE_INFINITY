import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSpeak = vi.fn();
const mockGetPlaybackRuntimeState = vi.fn();
const mockStop = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();

vi.mock('@/features/audio-center/services/audioService', () => ({
  audioService: {
    speak: mockSpeak,
    getPlaybackRuntimeState: mockGetPlaybackRuntimeState,
    stop: mockStop,
    pause: mockPause,
    resume: mockResume,
  },
}));

async function loadControllerModule() {
  vi.resetModules();
  return await import('../../../services/tts/messageSpeechController');
}

describe('messageSpeechController runtime state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPlaybackRuntimeState.mockResolvedValue({
      speaking: false,
      paused: false,
      provider: 'tauri',
      supportsPause: true,
    });
    mockStop.mockResolvedValue(undefined);
    mockPause.mockResolvedValue(undefined);
    mockResume.mockResolvedValue(undefined);
  });

  it('marks tauri playback as speaking on start so pause control can appear', async () => {
    let releaseSpeak: (() => void) | null = null;

    mockSpeak.mockImplementation(async (_text, lifecycle) => {
      lifecycle?.onStart?.('tauri');
      await new Promise<void>(resolve => {
        releaseSpeak = resolve;
      });
      lifecycle?.onComplete?.('tauri');
    });

    const { messageSpeechController } = await loadControllerModule();

    const playPromise = messageSpeechController.playMessage('msg-1', 'Bonjour TITANE');
    await Promise.resolve();

    expect(messageSpeechController.getState().records['msg-1']?.status).toBe('speaking');

    releaseSpeak?.();
    await playPromise;

    expect(messageSpeechController.getState().records['msg-1']?.status).toBe('completed');
  });
});