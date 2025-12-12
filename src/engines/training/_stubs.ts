/**
 * TITANE∞ PHASE 1 (OPTION B) - Stubs pour engines/training supprimés
 */

// Import types for proper typing
import type { TrainingSession, TrainingBaselineProfile } from '../types/trainingBaseline';

export class TrainingBaselineEngine {
  private static instance: TrainingBaselineEngine | null = null;

  constructor() {}

  static getInstance(): TrainingBaselineEngine {
    if (!TrainingBaselineEngine.instance) {
      TrainingBaselineEngine.instance = new TrainingBaselineEngine();
    }
    return TrainingBaselineEngine.instance;
  }

  start() {}
  stop() {}
  getState() {
    return {};
  }

  startTrainingCapture(_duration?: number): Promise<TrainingSession> {
    return Promise.resolve({
      sessionId: `session_${Date.now()}`,
      targetLabel: 'focused' as const,
      status: 'capturing' as const,
      startedAt: Date.now(),
      targetDurationMs: _duration ?? 30000,
      progress: 0,
      framesCollected: 0,
      collectingScores: {
        posture: [],
        movement: [],
        gaze: [],
        energy: [],
        tension: [],
      },
    });
  }

  cancelCapture() {
    return Promise.resolve();
  }

  getCurrentSession(): TrainingSession | null {
    return null;
  }

  getProfile(): TrainingBaselineProfile | null {
    return null;
  }
}

export const TRAINING_CONFIG = {
  enabled: false,
  defaultCaptureDuration: 30000,
};
