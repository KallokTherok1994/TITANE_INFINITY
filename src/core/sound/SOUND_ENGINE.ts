/**
 * TITANE∞ PHASE 1 (OPTION B) - Stub pour SOUND_ENGINE
 */

export interface SoundConfig {
  volume: number;
  enabled?: boolean;
  masterVolume?: number;
  type?: string;
  duration?: number;
}

let config: SoundConfig = {
  volume: 0.5,
  enabled: true,
  masterVolume: 0.8,
};

export const soundEngine = {
  getConfig: (): SoundConfig => config,
  setConfig: (newConfig: Partial<SoundConfig>) => {
    config = { ...config, ...newConfig };
  },
  play: (_soundId: string) => {},
  stop: (_soundId: string) => {},
  setVolume: (volume: number) => {
    config.volume = volume;
  },
  setMasterVolume: (volume: number) => {
    config.masterVolume = volume;
  },
  setEnabled: (enabled: boolean) => {
    config.enabled = enabled;
  },
  playStateSound: (_state: string) => {},
  playModuleFeedback: (
    _moduleId: string,
    _value?: string | number,
    _previousValue?: number
  ) => {},
  playSound: (_config: string | SoundConfig, _options?: { volume?: number }) => {},
  stopAllSounds: () => {},
};

export default soundEngine;
