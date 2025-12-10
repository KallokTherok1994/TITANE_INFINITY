export const hybridTTS = {
  speak: async () => {},
  stop: async () => {},
  resetCache: () => {},
  getStatus: async () => ({ provider: 'none', available: false, speaking: false }),
};

export default hybridTTS;
