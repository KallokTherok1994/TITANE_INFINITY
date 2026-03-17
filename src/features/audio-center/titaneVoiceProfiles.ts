import type { TTSEngine, TTSSettings } from './types';

export interface TitaneVoiceProfileOption {
  id: string;
  name: string;
  description: string;
  language: string;
  ttsModel?: TTSEngine;
  preferredVoiceId?: string;
  preferredRate?: number;
  preferredPitch?: number;
  preferredVolume?: number;
}

const DEFAULT_REFERENCE_RATE = 150;
const DEFAULT_REFERENCE_PITCH_HZ = 200;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeEngine = (value: unknown): TTSEngine | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  switch (value) {
    case 'piper':
    case 'espeak':
    case 'elevenlabs':
    case 'webspeech':
      return value;
    default:
      return undefined;
  }
};

const getRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
};

export const normalizeTitaneVoiceProfiles = (
  rawProfiles: unknown
): TitaneVoiceProfileOption[] => {
  if (!Array.isArray(rawProfiles)) {
    return [];
  }

  return rawProfiles
    .map((profile): TitaneVoiceProfileOption | null => {
      const record = getRecord(profile);
      if (!record) {
        return null;
      }

      const characteristics = getRecord(record.characteristics);
      const id = typeof record.id === 'string' ? record.id.trim() : '';
      if (!id) {
        return null;
      }

      return {
        id,
        name:
          typeof record.name === 'string' && record.name.trim().length > 0
            ? record.name
            : 'Profil vocal TITANE',
        description:
          typeof record.description === 'string' && record.description.trim().length > 0
            ? record.description
            : 'Profil vocal synchronisé avec l\'identité TITANE.',
        language:
          typeof record.language === 'string' && record.language.trim().length > 0
            ? record.language
            : 'fr-FR',
        ttsModel: normalizeEngine(record.ttsModel ?? record.tts_model),
        preferredVoiceId:
          typeof record.preferredVoiceId === 'string'
            ? record.preferredVoiceId
            : typeof record.preferred_voice_id === 'string'
              ? record.preferred_voice_id
              : undefined,
        preferredRate:
          typeof characteristics?.rate === 'number' ? characteristics.rate : undefined,
        preferredPitch:
          typeof characteristics?.pitch === 'number' ? characteristics.pitch : undefined,
        preferredVolume:
          typeof characteristics?.volume === 'number' ? characteristics.volume : undefined,
      };
    })
    .filter((profile): profile is TitaneVoiceProfileOption => profile !== null);
};

export const buildTtsSettingsFromTitaneProfile = (
  profile: TitaneVoiceProfileOption,
  currentSettings: TTSSettings
): Partial<TTSSettings> => {
  const nextRate =
    typeof profile.preferredRate === 'number'
      ? clamp(profile.preferredRate / DEFAULT_REFERENCE_RATE, 0.75, 1.35)
      : currentSettings.rate;
  const nextPitch =
    typeof profile.preferredPitch === 'number'
      ? clamp(profile.preferredPitch / DEFAULT_REFERENCE_PITCH_HZ, 0.75, 1.25)
      : currentSettings.pitch;
  const nextVolume =
    typeof profile.preferredVolume === 'number'
      ? clamp(profile.preferredVolume, 0.4, 1.0)
      : currentSettings.volume;

  return {
    voiceProfileId: profile.id,
    engine: profile.ttsModel ?? currentSettings.engine,
    voiceId: profile.preferredVoiceId || currentSettings.voiceId,
    language: profile.language || currentSettings.language,
    rate: nextRate,
    pitch: nextPitch,
    volume: nextVolume,
  };
};