/**
 * TITANE∞ vΩ∞ — Multimodal Engines Index
 * OPUS v∞.3: Point d'entrée pour les moteurs multimodaux
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ============================================================================
// ENGINES
// ============================================================================

export { VoiceAnalysisEngine } from './VoiceAnalysisEngine';
export { TextAnalysisEngine } from './TextAnalysisEngine';
export { MultimodalFusionEngine } from './MultimodalFusionEngine';

// ============================================================================
// CONVENIENCE GETTERS
// ============================================================================

import { VoiceAnalysisEngine } from './VoiceAnalysisEngine';
import { TextAnalysisEngine } from './TextAnalysisEngine';
import { MultimodalFusionEngine } from './MultimodalFusionEngine';

export const getVoiceAnalysisEngine = () => VoiceAnalysisEngine.getInstance();
export const getTextAnalysisEngine = () => TextAnalysisEngine.getInstance();
export const getMultimodalFusionEngine = () => MultimodalFusionEngine.getInstance();

// ============================================================================
// UNIFIED INTERFACE
// ============================================================================

export const MultimodalSystem = {
  async start() {
    const engine = getMultimodalFusionEngine();
    await engine.start();
  },

  stop() {
    const engine = getMultimodalFusionEngine();
    engine.stop();
  },

  isActive() {
    return getMultimodalFusionEngine().isActive();
  },

  getCurrentState() {
    return getMultimodalFusionEngine().getLastFusedState();
  },

  feedText(text: string) {
    getMultimodalFusionEngine().feedText(text);
  },

  calibrate() {
    return getMultimodalFusionEngine().calibrateBaseline();
  },

  getWeights() {
    return getMultimodalFusionEngine().getWeights();
  },

  setWeights(weights: { vision?: number; voice?: number; text?: number }) {
    getMultimodalFusionEngine().setWeights(weights);
  },

  getCorrelations() {
    return getMultimodalFusionEngine().getCorrelationMatrix();
  }
};
