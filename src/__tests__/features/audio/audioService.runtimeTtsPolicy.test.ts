import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDetectEnvironment = vi.fn();

const mockTauriClient = {
  ttsSpeak: vi.fn(),
  hasSecret: vi.fn(),
  identityGetActiveVoiceProfile: vi.fn(),
  identitySetActiveVoiceProfile: vi.fn(),
  stopSpeaking: vi.fn(),
  ttsStop: vi.fn(),
};

vi.mock('@/core/tauri/environment', () => ({
  detectEnvironment: mockDetectEnvironment,
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: mockTauriClient,
}));

async function loadAudioService() {
  vi.resetModules();
  const mod = await import('../../../features/audio-center/services/audioService');
  return mod.audioService;
}

describe('audioService runtime TTS policy', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockDetectEnvironment.mockReturnValue({
      isTauri: true,
      isBrowser: false,
      protocol: 'tauri',
      origin: 'tauri://localhost',
      tauriVersion: 'v2.x',
      isDev: false,
    });

    mockTauriClient.ttsSpeak.mockResolvedValue(undefined);
    mockTauriClient.hasSecret.mockResolvedValue({ ok: true, data: true });
    mockTauriClient.identityGetActiveVoiceProfile.mockResolvedValue(null);
    mockTauriClient.identitySetActiveVoiceProfile.mockResolvedValue(undefined);
    mockTauriClient.stopSpeaking.mockResolvedValue(undefined);
    mockTauriClient.ttsStop.mockResolvedValue(undefined);
  });

  it('coerces unsupported elevenlabs engine to piper for desktop runtime', async () => {
    const audioService = await loadAudioService();

    await audioService.updateTTSSettings({
      engine: 'elevenlabs',
      voiceId: 'FvmvwvObRqIHojkEGh5N',
      language: 'fr-FR',
    });

    const storedSettings = audioService.getTTSSettings();
    expect(storedSettings.engine).toBe('piper');
    expect(storedSettings.voiceId).toBe('fr_FR-siwis-medium');

    await audioService.speak('Bonjour, ceci est un test de lecture.');

    expect(mockTauriClient.ttsSpeak).toHaveBeenCalledTimes(1);
    const callPayload = mockTauriClient.ttsSpeak.mock.calls[0]?.[0] as {
      settings: { engine: string; voiceId: string };
    };
    expect(callPayload.settings.engine).toBe('piper');
    expect(callPayload.settings.voiceId).toBe('fr_FR-siwis-medium');
  });

  it('hides elevenlabs voices from desktop audio center list', async () => {
    const audioService = await loadAudioService();

    const voices = (await audioService.getAvailableVoices()) as Array<{ engine: string }>;

    expect(voices.some(voice => voice.engine === 'elevenlabs')).toBe(false);
  });

  it('hydrates desktop TTS defaults from the active TITANE voice profile', async () => {
    mockTauriClient.identityGetActiveVoiceProfile.mockResolvedValue({
      id: 'titane-calm-fr',
      name: 'TITANE Calm',
      description: 'Voix apaisante',
      language: 'fr-FR',
      tts_model: 'piper',
      preferred_voice_id: 'fr_FR-siwis-medium',
      characteristics: {
        rate: 120,
        pitch: 190,
        volume: 0.8,
      },
    });

    const audioService = await loadAudioService();

    await audioService.getAvailableVoices();

    expect(mockTauriClient.identityGetActiveVoiceProfile).toHaveBeenCalledTimes(1);
    expect(audioService.getTTSSettings()).toMatchObject({
      voiceProfileId: 'titane-calm-fr',
      engine: 'piper',
      voiceId: 'fr_FR-siwis-medium',
      language: 'fr-FR',
      volume: 0.8,
    });
    expect(audioService.getTTSSettings().rate).toBeCloseTo(0.8, 5);
    expect(audioService.getTTSSettings().pitch).toBeCloseTo(0.95, 5);
  });

  it('does not overwrite manual desktop tuning when no TITANE profile is selected', async () => {
    localStorage.setItem(
      'titane_audio_config',
      JSON.stringify({
        tts: {
          engine: 'piper',
          voiceId: 'fr_FR-siwis-medium',
          rate: 0.92,
          pitch: 1,
          volume: 1,
          language: 'fr-FR',
          emotionEnabled: true,
          autoFallback: true,
          autoReadAssistant: true,
        },
        output: {
          deviceId: 'default',
          volume: 1,
          balance: 0,
          enhancementsEnabled: true,
        },
        input: {
          deviceId: 'default',
          gain: 1,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
        lastUpdated: 0,
      })
    );
    mockTauriClient.identityGetActiveVoiceProfile.mockResolvedValue({
      id: 'titane-calm-fr',
      name: 'TITANE Calm',
      description: 'Voix apaisante',
      language: 'fr-FR',
      tts_model: 'piper',
      preferred_voice_id: 'fr_FR-siwis-medium',
      characteristics: {
        rate: 120,
        pitch: 190,
        volume: 0.8,
      },
    });

    const audioService = await loadAudioService();

    await audioService.getAvailableVoices();

    expect(mockTauriClient.identityGetActiveVoiceProfile).not.toHaveBeenCalled();
    expect(audioService.getTTSSettings().voiceProfileId).toBeUndefined();
    expect(audioService.getTTSSettings().rate).toBe(0.92);
  });
});
