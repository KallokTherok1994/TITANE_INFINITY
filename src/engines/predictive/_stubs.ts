/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/predictive supprimés
 * 
 * Ce fichier fournit des stubs pour maintenir la compatibilité
 * temporaire avec les modules qui référencent encore engines/predictive.
 * 
 * ⚠️ engines/predictive a été supprimé lors de la restructuration.
 * Ces stubs retournent des valeurs par défaut pour éviter les erreurs
 * de compilation. Les modules dépendants devront être refactorisés.
 */

export interface PredictiveFrame {
  confidence: number;
  timestamp: number;
  predictions: any[];
}

export const predictiveReflectionEngine = {
  getState: (): PredictiveFrame => ({
    confidence: 0,
    timestamp: Date.now(),
    predictions: [],
  }),
  subscribe: (_callback: (frame: PredictiveFrame) => void) => {
    // No-op stub
  },
  start: () => {},
  stop: () => {},
};

export interface PredictedNeed {
  type: string;
  priority: number;
}

export interface PredictedIntent {
  action: string;
  confidence: number;
}

export interface PredictedEmotion {
  emotion: string;
  intensity: number;
}

export interface ConversationDirection {
  topic: string;
  vector: number[];
}

export interface TitaneSelfPrediction {
  nextState: string;
  confidence: number;
}

export interface RecommendedAdjustments {
  adjustments: string[];
  priority: number;
}

export class PredictiveStateEngine {
  constructor() {}
  start() {}
  stop() {}
  getState() {
    return {};
  }
}
