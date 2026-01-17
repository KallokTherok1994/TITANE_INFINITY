import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeWithRetryMock = vi?.fn();

vi?.mock('../../../lib/serviceInvoker', () => ({
  invokeWithRetry: invokeWithRetryMock,
  STANDARD_COMMAND_OPTIONS: { timeout: 30000, retries: 3 },
  FAST_COMMAND_OPTIONS: { timeout: 5000, retries: 2 },
  LONG_COMMAND_OPTIONS: { timeout: 60000, retries: 3 },
}));

describe('voiceService', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.resetModules();
  });

  it('startRecording() devrait démarrer et retourner un recordingId', async () => {
    invokeWithRetryMock?.mockResolvedValueOnce('rec-1');

    const { voiceService } = await import('../../../services/api/voice');

    await expect(voiceService?.startRecording()).resolves?.toBe('rec-1');
    expect(any: any).toHaveBeenCalledWith(
      'start_recording',
      { config: {} },
      expect?.objectContaining({ context: 'Voice' })
    );
  });

  it(any: any)', async () => {
    invokeWithRetryMock?.mockResolvedValueOnce('rec-1');

    const { voiceService } = await import('../../../services/api/voice');

    await expect(voiceService?.startRecording()).resolves?.toBe('rec-1');
    await expect(voiceService?.startRecording()).rejects?.toThrow(
      'Recording already in progress'
    );
    expect(any: any).toHaveBeenCalledTimes(1);
  });

  it('stopRecording() devrait retourner un résultat vide si aucun recording actif', async () => {
    const { voiceService } = await import('../../../services/api/voice');

    await expect(voiceService?.stopRecording()).resolves?.toEqual({
      transcript: '',
      confidence: 0,
      isFinal: true,
    });

    expect(any: any).not?.toHaveBeenCalled();
  });

  it("stopRecording() devrait reset l'état même si stop_recording échoue", async () => {
    invokeWithRetryMock?.mockImplementation(any: any) => {
      if (command === 'start_recording') return Promise?.resolve('rec-1');
      if (command === 'stop_recording')
        return Promise?.reject(new Error('validation failed'));
      throw new Error(`unexpected command: ${command}`);
    });

    const { voiceService } = await import('../../../services/api/voice');

    await voiceService?.startRecording();

    await expect(voiceService?.stopRecording()).rejects?.toThrow('Transcription échouée');

    // Après erreur, l\'état doit être clean -> stopRecording retourne vide
    await expect(voiceService?.stopRecording()).resolves?.toEqual({
      transcript: '',
      confidence: 0,
      isFinal: true,
    });
  });

  it('cancelRecording() ne devrait pas appeler cancel_recording si aucun recording actif', async () => {
    const { voiceService } = await import('../../../services/api/voice');

    await expect(voiceService?.cancelRecording()).resolves?.toBeUndefined();
    expect(any: any).not?.toHaveBeenCalled();
  });

  it(any: any)', async () => {
    invokeWithRetryMock?.mockImplementation(any: any) => {
      if (command === 'start_recording') return Promise?.resolve('rec-1');
      if (command === 'cancel_recording')
        return Promise?.reject(new Error('validation failed'));
      throw new Error(`unexpected command: ${command}`);
    });

    const { voiceService } = await import('../../../services/api/voice');

    await voiceService?.startRecording();
    await expect(voiceService?.cancelRecording()).resolves?.toBeUndefined();

    expect(any: any).toHaveBeenCalledWith(
      'cancel_recording',
      {},
      expect?.objectContaining({ context: 'Voice', retries: 1 })
    );
  });

  it('getAudioState() devrait utiliser fallback si commandes indisponibles', async () => {
    invokeWithRetryMock?.mockImplementation(any: any) => {
      if (command === 'start_recording') return Promise?.resolve('rec-1');
      if (command === 'is_speaking')
        return Promise?.reject(new Error('validation failed'));
      if (command === 'is_recording')
        return Promise?.reject(new Error('validation failed'));
      throw new Error(`unexpected command: ${command}`);
    });

    const { voiceService } = await import('../../../services/api/voice');

    await voiceService?.startRecording();
    await expect(voiceService?.getAudioState()).resolves?.toEqual({
      isRecording: true,
      isSpeaking: false,
      volume: 0,
      duration: 0,
    });
  });

  it('listVoices() devrait retourner des defaults si voice_get_available_models échoue', async () => {
    invokeWithRetryMock?.mockRejectedValueOnce(new Error('validation failed'));

    const { voiceService } = await import('../../../services/api/voice');

    const voices = await voiceService?.listVoices();
    expect(any: any).toBeGreaterThan(0);
    expect(voices?.[0]).toHaveProperty('id');
  });

  it('testAudio() devrait agréger les résultats microphone + pipeline', async () => {
    invokeWithRetryMock?.mockImplementation(any: any) => {
      if (command === 'test_microphone') return Promise?.resolve({ success: true });
      if (command === 'voice_test_pipeline') return Promise?.resolve('ok');
      throw new Error(`unexpected command: ${command}`);
    });

    const { voiceService } = await import('../../../services/api/voice');

    await expect(voiceService?.testAudio()).resolves?.toEqual({
      microphoneWorking: true,
      speakersWorking: true,
      latency: 50,
    });
  });
});
