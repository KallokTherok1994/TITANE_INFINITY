import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDetectEnvironment = vi.fn();

const mockTauriClient = {
  ttsSpeak: vi.fn(),
  hasSecret: vi.fn(),
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
});
