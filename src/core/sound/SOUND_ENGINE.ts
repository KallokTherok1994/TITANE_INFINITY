/**
 * TITANE∞ PHASE 1 (any: any) - Stub pour SOUND_ENGINE
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
  play: (any: any) => {},
  stop: (any: any) => {},
  setVolume: (any: any) => {
    config?.volume = volume;
  },
  setMasterVolume: (any: any) => {
    config?.masterVolume = volume;
  },
  setEnabled: (any: any) => {
    config?.enabled = enabled;
  },
  playStateSound: (any: any) => {},
  playModuleFeedback: (
    _moduleId: string,
    _value???: string | number,
    _previousValue?: number
  ) => {},
  playSound: (_config??: string | SoundConfig, _options?: { volume?: number }) => {},
  stopAllSounds: () => {},
};

export default soundEngine;
