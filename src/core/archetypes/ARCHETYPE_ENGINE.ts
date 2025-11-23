/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v22 — Archetype Engine
// Moteur de gestion des archétypes cognitifs

import { ARCHETYPES, Archetype, ArchetypeId } from './ARCHETYPES';
import { glowEngine } from '../visual/GLOW_ENGINE';
import { motionEngine } from '../visual/MOTION_ENGINE';
import { soundEngine } from '../sound/SOUND_ENGINE';

// 🎨 État d'un archétype
export interface ArchetypeState {
  archetype: Archetype;
  active: boolean;
  intensity: number; // 0-1
  connections: ArchetypeId[];
  lastUpdate: number;
}

// 🧬 Archetype Engine principal
export class ArchetypeEngine {
  private states: Map<ArchetypeId, ArchetypeState> = new Map();
  private relationships: Map<ArchetypeId, Set<ArchetypeId>> = new Map();

  constructor() {
    this.initializeArchetypes();
    this.buildRelationships();
  }

  /**
   * Initialiser tous les archétypes
   */
  private initializeArchetypes(): void {
    Object.entries(ARCHETYPES).forEach(([id, archetype]) => {
      this.states.set(id as ArchetypeId, {
        archetype,
        active: true,
        intensity: 0.5,
        connections: archetype.connections as ArchetypeId[],
        lastUpdate: Date.now(),
      });
    });
  }

  /**
   * Construire le graphe de relations
   */
  private buildRelationships(): void {
    this.states.forEach((state, id) => {
      const connections = new Set(state.connections);
      this.relationships.set(id, connections);
    });
  }

  /**
   * Obtenir un archétype
   */
  getArchetype(id: ArchetypeId): Archetype | undefined {
    return ARCHETYPES[id];
  }

  /**
   * Obtenir l'état d'un archétype
   */
  getState(id: ArchetypeId): ArchetypeState | undefined {
    return this.states.get(id);
  }

  /**
   * Mettre à jour l'intensité d'un archétype
   */
  updateIntensity(id: ArchetypeId, intensity: number): void {
    const state = this.states.get(id);
    if (!state) return;

    const previousIntensity = state.intensity;
    state.intensity = Math.max(0, Math.min(1, intensity));
    state.lastUpdate = Date.now();

    // Propager aux moteurs visuels
    this.propagateToEngines(id, state.intensity, previousIntensity);

    // Propager l'influence aux archétypes connectés
    this.propagateInfluence(id, state.intensity);
  }

  /**
   * Propager l'intensité aux moteurs (glow, motion, sound)
   */
  private propagateToEngines(id: ArchetypeId, intensity: number, previousIntensity: number): void {
    const archetype = ARCHETYPES[id];
    if (!archetype) return;

    const value = intensity * 100;

    // 1. Glow Engine
    glowEngine.generateModuleGlow(id, value);

    // 2. Motion Engine
    motionEngine.getModuleMotion(id, value);

    // 3. Sound Engine (si changement significatif)
    if (Math.abs(intensity - previousIntensity) > 0.1) {
      soundEngine.playSound({
        type: archetype.sound.signature,
        volume: archetype.sound.volume * intensity,
        pitch: archetype.sound.pitch,
        duration: 200,
      });
    }
  }

  /**
   * Propager l'influence d'un archétype à ses connexions
   */
  private propagateInfluence(sourceId: ArchetypeId, intensity: number): void {
    const connections = this.relationships.get(sourceId);
    if (!connections) return;

    connections.forEach((targetId) => {
      const targetState = this.states.get(targetId);
      if (!targetState) return;

      // Influence proportionnelle (15% de l'intensité source)
      const influence = intensity * 0.15;
      const newIntensity = Math.min(1, targetState.intensity + influence);

      // Mettre à jour sans propager récursivement
      targetState.intensity = newIntensity;
      targetState.lastUpdate = Date.now();
    });
  }

  /**
   * Activer/désactiver un archétype
   */
  setActive(id: ArchetypeId, active: boolean): void {
    const state = this.states.get(id);
    if (state) {
      state.active = active;
      state.lastUpdate = Date.now();
    }
  }

  /**
   * Obtenir les archétypes connectés à un archétype
   */
  getConnections(id: ArchetypeId): ArchetypeId[] {
    return Array.from(this.relationships.get(id) || []);
  }

  /**
   * Calculer l'influence totale reçue par un archétype
   */
  calculateTotalInfluence(id: ArchetypeId): number {
    let totalInfluence = 0;

    this.states.forEach((state, archetypeId) => {
      if (archetypeId === id) return;

      const connections = this.relationships.get(archetypeId);
      if (connections && connections.has(id)) {
        totalInfluence += state.intensity * 0.15;
      }
    });

    return Math.min(1, totalInfluence);
  }

  /**
   * Obtenir l'archétype le plus actif
   */
  getMostActive(): ArchetypeId | null {
    let maxIntensity = 0;
    let mostActive: ArchetypeId | null = null;

    this.states.forEach((state, id) => {
      if (state.active && state.intensity > maxIntensity) {
        maxIntensity = state.intensity;
        mostActive = id;
      }
    });

    return mostActive;
  }

  /**
   * Obtenir tous les états
   */
  getAllStates(): Map<ArchetypeId, ArchetypeState> {
    return new Map(this.states);
  }

  /**
   * Harmoniser tous les archétypes (équilibrage)
   */
  harmonizeAll(): void {
    const averageIntensity = this.calculateAverageIntensity();

    this.states.forEach((state, id) => {
      const delta = averageIntensity - state.intensity;
      const adjustment = delta * 0.2; // Convergence douce
      this.updateIntensity(id, state.intensity + adjustment);
    });
  }

  /**
   * Calculer l'intensité moyenne
   */
  private calculateAverageIntensity(): number {
    let total = 0;
    let count = 0;

    this.states.forEach((state) => {
      if (state.active) {
        total += state.intensity;
        count++;
      }
    });

    return count > 0 ? total / count : 0.5;
  }

  /**
   * Générer un rapport visuel de l'état des archétypes
   */
  generateReport(): {
    archetypes: Array<{ id: string; name: string; intensity: number; active: boolean; connections: number }>;
    mostActive: ArchetypeId | null;
    averageIntensity: number;
    totalConnections: number;
  } {
    const archetypes = Array.from(this.states.entries()).map(([id, state]) => ({
      id,
      name: state.archetype.name,
      intensity: state.intensity,
      active: state.active,
      connections: state.connections.length,
    }));

    return {
      archetypes,
      mostActive: this.getMostActive(),
      averageIntensity: this.calculateAverageIntensity(),
      totalConnections: Array.from(this.relationships.values()).reduce((sum, set) => sum + set.size, 0),
    };
  }

  /**
   * Réinitialiser tous les archétypes
   */
  reset(): void {
    this.states.clear();
    this.relationships.clear();
    this.initializeArchetypes();
    this.buildRelationships();
  }
}

// 🌟 Instance singleton
export const archetypeEngine = new ArchetypeEngine();
