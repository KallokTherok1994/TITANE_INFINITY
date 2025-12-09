/**
 * TITANE_INFINITY v∞.PHASE4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * LAZY AURA ENGINE FACADE
 * Permet lazy loading du moteur aura pour réduire bundle initial
 */

let engineInstance: any = null;
let enginePromise: Promise<any> | null = null;

/**
 * Lazy load aura engine
 */
export async function getAuraEngine() {
  if (engineInstance) return engineInstance;
  
  if (!enginePromise) {
    enginePromise = import('./auraEngine').then(m => {
      engineInstance = m.auraEngine;
      return engineInstance;
    });
  }
  
  return enginePromise;
}

/**
 * Start engine (lazy)
 */
export async function startAuraEngine() {
  const engine = await getAuraEngine();
  engine.start();
  console.log('  ✅ Aura Engine active (60Hz, 8 visual modes)');
}

/**
 * Stop engine (lazy)
 */
export async function stopAuraEngine() {
  if (engineInstance) {
    engineInstance.stop();
  }
}

// Export types for compatibility
export type { AuraAnimationPattern } from './auraEngine';
