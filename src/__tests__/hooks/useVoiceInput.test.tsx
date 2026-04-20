import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@/test-utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

const { startRecordingMock, stopRecordingMock, cancelRecordingMock, getUserMediaMock } =
  vi.hoisted(() => ({
    startRecordingMock: vi.fn(),
    stopRecordingMock: vi.fn(),
    cancelRecordingMock: vi.fn(),
    getUserMediaMock: vi.fn(),
  }));

vi.mock('@/services/api/voice', () => ({
  voiceService: {
    startRecording: startRecordingMock,
    stopRecording: stopRecordingMock,
    cancelRecording: cancelRecordingMock,
  },
}));

describe('useVoiceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: getUserMediaMock,
      },
    });

    startRecordingMock.mockResolvedValue('rec-1');
    stopRecordingMock.mockResolvedValue({
      transcript: 'bonjour',
      confidence: 1,
      isFinal: true,
    });
    cancelRecordingMock.mockResolvedValue(undefined);
  });

  it('cleans up microphone stream when stopRecording fails', async () => {
    const stopTrackMock = vi.fn();
    getUserMediaMock.mockResolvedValueOnce({
      getAudioTracks: () => [
        {
          getSettings: () => ({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
          }),
        },
      ],
      getTracks: () => [{ stop: stopTrackMock }],
    });
    stopRecordingMock.mockRejectedValueOnce(new Error('backend failure'));

    const { result } = renderHook(() => useVoiceInput());

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
    expect(result.current.audioStream).not.toBeNull();

    await act(async () => {
      await result.current.stopListening();
    });

    expect(stopTrackMock).toHaveBeenCalledTimes(1);
    expect(result.current.audioStream).toBeNull();
    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toContain('Failed to stop listening: backend failure');
  });

  it('cleans up microphone stream when startRecording fails after getUserMedia succeeds', async () => {
    const stopTrackMock = vi.fn();
    getUserMediaMock.mockResolvedValueOnce({
      getAudioTracks: () => [
        {
          getSettings: () => ({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
          }),
        },
      ],
      getTracks: () => [{ stop: stopTrackMock }],
    });
    startRecordingMock.mockRejectedValueOnce(new Error('backend start failure'));

    const { result } = renderHook(() => useVoiceInput());

    await act(async () => {
      await result.current.startListening();
    });

    expect(stopTrackMock).toHaveBeenCalledTimes(1);
    expect(result.current.audioStream).toBeNull();
    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toContain(
      'Failed to start listening: backend start failure'
    );
  });

  it('cleans up microphone stream when cancelRecording fails', async () => {
    const stopTrackMock = vi.fn();
    getUserMediaMock.mockResolvedValueOnce({
      getAudioTracks: () => [
        {
          getSettings: () => ({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1,
          }),
        },
      ],
      getTracks: () => [{ stop: stopTrackMock }],
    });
    cancelRecordingMock.mockRejectedValueOnce(new Error('backend cancel failure'));

    const { result } = renderHook(() => useVoiceInput());

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
    expect(result.current.audioStream).not.toBeNull();

    await act(async () => {
      await result.current.cancelListening();
    });

    expect(cancelRecordingMock).toHaveBeenCalledTimes(1);
    expect(stopTrackMock).toHaveBeenCalledTimes(1);
    expect(result.current.audioStream).toBeNull();
    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toContain('Failed to cancel: backend cancel failure');
  });
});
