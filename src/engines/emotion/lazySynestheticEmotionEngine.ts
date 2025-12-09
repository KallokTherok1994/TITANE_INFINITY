/**
 * TITANE_INFINITY v∞.PHASE4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * LAZY SYNESTHETIC EMOTION ENGINE FACADE
 * Permet lazy loading du moteur émotionnel pour réduire bundle initial
 */

let engineInstance: any = null;
let enginePromise: Promise<any> | null = null;

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
  console.log('  ✅ Synesthetic Emotion Engine active (30Hz, 12 emotional states)');
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
