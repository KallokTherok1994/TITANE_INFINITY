/**
 * TITANE_INFINITY v∞.PHASE4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LAZY SYNESTHETIC EMOTION ENGINE FACADE
 * Permet lazy loading du moteur émotionnel pour réduire bundle initial
 */

import { logger } from '@/utils/logger';

// Type for the engine instance
type EngineModule = typeof import('./synestheticEmotionEngine');
type EngineInstance = EngineModule['synestheticEmotionEngine'];

let engineInstance: EngineInstance | null = null;
let enginePromise: Promise<EngineInstance> | null = null;

/**
 * Lazy load synesthetic emotion engine
 */
export async function getSynestheticEmotionEngine() {
  if (engineInstance) return engineInstance;

  if (!enginePromise) {
    enginePromise = import('./synestheticEmotionEngine').then(m => {
      engineInstance = m.synestheticEmotionEngine;
      return engineInstance;
    });
  }

  return enginePromise;
}

/**
 * Start engine (lazy)
 */
export async function startSynestheticEngine() {
  const engine = await getSynestheticEmotionEngine();
  engine.start();
  logger.debug('  ✅ Synesthetic Emotion Engine active (30Hz, 12 emotional states)');
}

/**
 * Stop engine (lazy)
 */
export async function stopSynestheticEngine() {
  if (engineInstance) {
    engineInstance.stop();
  }
}

// Export types for compatibility
export type { EmotionalState, SynestheticProfile } from './synestheticEmotionEngine';
