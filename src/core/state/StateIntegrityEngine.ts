/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ STATE INTEGRITY ENGINE vΩ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Moteur de vérification d'intégrité de l'état
 *
 * @responsibilities
 * - Vérifier intégrité SingularityState
 * - Détecter incohérences
 * - Auto-reset partiel
 * - Snapshots sécurité
 * - Rollback intelligent
 * - Compression mémoire
 *
 * @version Ω (Omega - Final Fusion)
 * @created 2025-11-27
 */

import type { SingularityState } from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface IntegrityCheckResult {
  valid: boolean;
  score: number; // 0-1
  issues: IntegrityIssue[];
  checked_at: number;
}

export interface IntegrityIssue {
  layer: string;
  field: string;
  expected: string | number | boolean;
  actual: unknown;
  severity: 'low' | 'medium' | 'high';
  fixable: boolean;
}

export interface StateSnapshot {
  id: string;
  state: SingularityState;
  timestamp: number;
  compressed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE INTEGRITY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class StateIntegrityEngine {
  private static instance: StateIntegrityEngine;

  private snapshots: StateSnapshot[] = [];
  private maxSnapshots = 10;

  private constructor() {}

  public static getInstance(): StateIntegrityEngine {
    if (!StateIntegrityEngine.instance) {
      StateIntegrityEngine.instance = new StateIntegrityEngine();
    }
    return StateIntegrityEngine.instance;
  }

  /**
   * Vérifie l'intégrité de l'état
   */
  public checkIntegrity(state: SingularityState): IntegrityCheckResult {
    const issues: IntegrityIssue[] = [];

    // Vérifier physical layer
    this.checkLayer(state.physical as any, 'physical', issues);

    // Vérifier cognitive layer
    this.checkLayer(state.cognitive as any, 'cognitive', issues);

    // Vérifier symbolic layer
    this.checkLayer(state.symbolic as any, 'symbolic', issues);

    // Vérifier adaptive layer
    this.checkLayer(state.adaptive as any, 'adaptive', issues);

    // Vérifier meta layer
    this.checkLayer(state.meta as any, 'meta', issues);

    // Calculer score
    const score = Math.max(0, 1 - issues.length * 0.1);

    return {
      valid: issues.length === 0,
      score,
      issues,
      checked_at: Date.now(),
    };
  }

  /**
   * Vérifie une couche spécifique
   */
  private checkLayer(
    layer: Record<string, unknown>,
    layerName: string,
    issues: IntegrityIssue[]
  ): void {
    for (const [field, value] of Object.entries(layer)) {
      if (typeof value === 'number') {
        // Vérifier limites 0-1
        if (value < 0 || value > 1) {
          issues.push({
            layer: layerName,
            field,
            expected: '0-1 range',
            actual: value,
            severity: value < -0.5 || value > 1.5 ? 'high' : 'medium',
            fixable: true,
          });
        }
      }
    }
  }

  /**
   * Corrige l'état
   */
  public fixState(state: SingularityState): SingularityState {
    const fixed = { ...state };

    // Fixer les couches
    fixed.physical = this.fixLayer(fixed.physical as any) as any;
    fixed.cognitive = this.fixLayer(fixed.cognitive as any) as any;
    fixed.symbolic = this.fixLayer(fixed.symbolic as any) as any;
    fixed.adaptive = this.fixLayer(fixed.adaptive as any) as any;
    fixed.meta = this.fixLayer(fixed.meta as any) as any;

    return fixed;
  }

  /**
   * Corrige une couche
   */
  private fixLayer<T extends Record<string, unknown>>(layer: T): T {
    const fixed = { ...layer } as Record<string, unknown>;

    for (const key of Object.keys(fixed)) {
      if (typeof fixed[key] === 'number') {
        fixed[key] = Math.max(0, Math.min(1, fixed[key]));
      }
    }

    return fixed as T;
  }

  /**
   * Crée un snapshot
   */
  public createSnapshot(state: SingularityState, compressed = true): StateSnapshot {
    const snapshot: StateSnapshot = {
      id: `snapshot-${Date.now()}`,
      state: compressed ? this.compressState(state) : { ...state },
      timestamp: Date.now(),
      compressed,
    };

    this.snapshots.push(snapshot);

    // Limiter le nombre de snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Restaure un snapshot
   */
  public restoreSnapshot(snapshotId: string): SingularityState | null {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);

    if (!snapshot) {
      return null;
    }

    return snapshot.compressed
      ? this.decompressState(snapshot.state)
      : { ...snapshot.state };
  }

  /**
   * Obtient le dernier snapshot
   */
  public getLatestSnapshot(): StateSnapshot | null {
    return this.snapshots.length > 0
      ? (this.snapshots[this.snapshots.length - 1] ?? null)
      : null;
  }

  /**
   * Compresse l'état (arrondit à 2 décimales)
   */
  private compressState(state: SingularityState): SingularityState {
    return {
      ...state,
      physical: this.compressLayer(state.physical as any) as any,
      cognitive: this.compressLayer(state.cognitive as any) as any,
      symbolic: this.compressLayer(state.symbolic as any) as any,
      adaptive: this.compressLayer(state.adaptive as any) as any,
      meta: this.compressLayer(state.meta as any) as any,
    };
  }

  /**
   * Compresse une couche
   */
  private compressLayer<T extends Record<string, unknown>>(layer: T): T {
    const compressed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(layer)) {
      if (typeof value === 'number') {
        compressed[key] = Math.round(value * 100) / 100;
      } else {
        compressed[key] = value;
      }
    }

    return compressed as T;
  }

  /**
   * Décompresse l'état
   */
  private decompressState(state: SingularityState): SingularityState {
    // Pour l'instant, pas de décompression nécessaire
    return { ...state };
  }

  /**
   * Obtient tous les snapshots
   */
  public getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Efface tous les snapshots
   */
  public clearSnapshots(): void {
    this.snapshots = [];
  }
}

export const StateIntegrity = StateIntegrityEngine.getInstance();
