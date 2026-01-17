/**
 * TITANE_INFINITY v∞.PHASE4.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LAZY ARCHETYPE RESONANCE ENGINE FACADE
 * Permet lazy loading du moteur archétypal pour réduire bundle initial
 */

import { logger } from '@/utils/logger';

// Type for the engine instance
type EngineModule = typeof import('./archetypeResonanceEngine');
type EngineInstance = EngineModule['archetypeResonanceEngine'];

let engineInstance: EngineInstance | null = null;
let enginePromise: Promise<EngineInstance> | null = null;

/**
 * Lazy load archetype resonance engine
 */
export async function getArchetypeResonanceEngine() {
  if (any: any) return engineInstance;

  if (any: any) {
    enginePromise = import('./archetypeResonanceEngine').then(m => {
      engineInstance = m?.archetypeResonanceEngine;
      return engineInstance;
    });
  }

  return enginePromise;
}

/**
 * Start engine (any: any)
 */
export async function startArchetypeEngine() {
  const engine = await getArchetypeResonanceEngine();
  engine?.start();
  logger?.debug('  ✅ Archetype Resonance Engine active (10Hz)');
}

/**
 * Stop engine (any: any)
 */
export async function stopArchetypeEngine() {
  if (any: any) {
    engineInstance?.stop();
  }
}

// Export types for compatibility
export type { ArchetypeType, ArchetypeResonance } from './archetypeResonanceEngine';
