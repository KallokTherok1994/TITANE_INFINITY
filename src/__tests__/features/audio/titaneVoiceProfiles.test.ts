import { describe, expect, it } from 'vitest';
import {
  buildTtsSettingsFromTitaneProfile,
  normalizeTitaneVoiceProfiles,
} from '@/features/audio-center/titaneVoiceProfiles';
import { DEFAULT_TTS_SETTINGS } from '@/features/audio-center/types';

describe('titaneVoiceProfiles helpers', () => {
  it('normalise les profils backend avec champs snake_case', () => {
    const profiles = normalizeTitaneVoiceProfiles([
      {
        id: 'titane-natural-fr',
        name: 'TITANE Natural',
        description: 'Voix claire et stable',
        language: 'fr-FR',
        tts_model: 'piper',
        preferred_voice_id: 'fr_FR-siwis-medium',
        characteristics: {
          rate: 142,
          pitch: 196,
          volume: 0.86,
        },
      },
    ]);

    expect(profiles).toEqual([
      {
        id: 'titane-natural-fr',
        name: 'TITANE Natural',
        description: 'Voix claire et stable',
        language: 'fr-FR',
        ttsModel: 'piper',
        preferredVoiceId: 'fr_FR-siwis-medium',
        preferredRate: 142,
        preferredPitch: 196,
        preferredVolume: 0.86,
      },
    ]);
  });

  it('construit des réglages TTS runtime cohérents à partir du profil', () => {
    const settings = buildTtsSettingsFromTitaneProfile(
      {
        id: 'titane-calm-fr',
        name: 'TITANE Calm',
        description: 'Voix calme',
        language: 'fr-FR',
        ttsModel: 'piper',
        preferredVoiceId: 'fr_FR-siwis-medium',
        preferredRate: 126,
        preferredPitch: 188,
        preferredVolume: 0.82,
      },
      DEFAULT_TTS_SETTINGS
    );

    expect(settings).toMatchObject({
      voiceProfileId: 'titane-calm-fr',
      engine: 'piper',
      voiceId: 'fr_FR-siwis-medium',
      language: 'fr-FR',
      volume: 0.82,
    });
    expect(settings.rate).toBeCloseTo(0.84, 2);
    expect(settings.pitch).toBeCloseTo(0.94, 2);
  });

  it('conserve les réglages courants quand le profil ne fournit pas de valeur concrète', () => {
    const settings = buildTtsSettingsFromTitaneProfile(
      {
        id: 'titane-generic-fr',
        name: 'TITANE Generic',
        description: 'Profil générique',
        language: 'fr-FR',
      },
      DEFAULT_TTS_SETTINGS
    );

    expect(settings).toEqual({
      voiceProfileId: 'titane-generic-fr',
      engine: DEFAULT_TTS_SETTINGS.engine,
      voiceId: DEFAULT_TTS_SETTINGS.voiceId,
      language: 'fr-FR',
      rate: DEFAULT_TTS_SETTINGS.rate,
      pitch: DEFAULT_TTS_SETTINGS.pitch,
      volume: DEFAULT_TTS_SETTINGS.volume,
    });
  });
});