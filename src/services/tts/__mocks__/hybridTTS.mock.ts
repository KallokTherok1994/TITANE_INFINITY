type TTSEventType = 'start' | 'end' | 'error';

export const hybridTTS = {
  speak: async () => {},
  stop: async () => {},
  resetCache: () => {},
  onTTSEvent: (_listener: (event: TTSEventType) => void) => {
    return () => {};
  },
  getStatus: async () => ({
    provider: 'none',
    available: false,
    speaking: false,
    parlerTTSAvailable: false,
    tauriAvailable: false,
    webSpeechAvailable: false,
  }),
};

export default hybridTTS;
