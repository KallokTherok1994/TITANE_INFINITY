/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/multimodal supprimés
 */

class MultimodalFusionEngine {
  private static instance: MultimodalFusionEngine | null = null;

  constructor() {}

  static getInstance(): MultimodalFusionEngine {
    if (!MultimodalFusionEngine.instance) {
      MultimodalFusionEngine.instance = new MultimodalFusionEngine();
    }
    return MultimodalFusionEngine.instance;
  }

  start() {}
  stop() {}
  isActive(): boolean {
    return false;
  }
  getState() {
    return {};
  }
  getLastFusedState() {
    return null;
  }
  getWeights() {
    return { vision: 0.33, voice: 0.34, text: 0.33 };
  }
  setWeights(_weights: any) {}
  calibrateBaseline() {
    return Promise.resolve({
      totalSamplesCount: 0,
      isCalibrated: false,
      globalEnergyCurve: [],
      globalTensionCurve: [],
      globalStabilityMap: [],
      multimodalCorrelationMatrix: {
        visionVoice: 0,
        visionText: 0,
        voiceText: 0,
        allThree: 0,
      },
    });
  }
  getCorrelationMatrix() {
    return { visionVoice: 0.5, visionText: 0.4, voiceText: 0.6, allThree: 0.5 };
  }
}

export default MultimodalFusionEngine;
