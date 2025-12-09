/**
 * TITANE_INFINITY v∞.PHASE4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LAZY ARCHETYPE RESONANCE ENGINE FACADE
 * Permet lazy loading du moteur archétypal pour réduire bundle initial
 */

// Type for the engine instance
type EngineModule = typeof import('./archetypeResonanceEngine');
type EngineInstance = EngineModule['archetypeResonanceEngine'];

let engineInstance: EngineInstance | null = null;
let enginePromise: Promise<EngineInstance> | null = null;

/**
 * Lazy load archetype resonance engine
 */
export async function getArchetypeResonanceEngine() {
  if (engineInstance) return engineInstance;
  
  if (!enginePromise) {
    enginePromise = import('./archetypeResonanceEngine').then(m => {
      engineInstance = m.archetypeResonanceEngine;
      return engineInstance;
    });
  }
  
  return enginePromise;
}

/**
 * Start engine (lazy)
 */
export async function startArchetypeEngine() {
  const engine = await getArchetypeResonanceEngine();
  engine.start();
  console.log('  ✅ Archetype Resonance Engine active (10Hz)');
}

/**
 * Stop engine (lazy)
 */
export async function stopArchetypeEngine() {
  if (engineInstance) {
    engineInstance.stop();
  }
}

// Export types for compatibility
export type { ArchetypeType, ArchetypeResonance } from './archetypeResonanceEngine';
