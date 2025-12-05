/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — EVOLUTION ENGINE
 *   Moteur d'évolution, versioning et changelog
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EvolutionPhase =
  | 'nascent'
  | 'learning'
  | 'adapting'
  | 'optimizing'
  | 'evolving'
  | 'singularity';

export type MutationType =
  | 'optimize'
  | 'refactor'
  | 'simplify'
  | 'enhance'
  | 'fix'
  | 'merge';

export interface EvolutionMetrics {
  stability: number;
  coherence: number;
  performance: number;
  cognitiveDepth: number;
}

export interface EvolutionMutation {
  id: string;
  type: MutationType;
  target: string;
  description: string;
  expectedImprovement: number;
  riskLevel: 'P0' | 'P1' | 'P2' | 'P3';
  appliedAt?: number;
  success?: boolean;
}

export interface EvolutionCycle {
  id: string;
  cycleNumber: number;
  timestamp: number;
  phase: EvolutionPhase;
  mutationsProposed: number;
  mutationsApplied: number;
  improvements: Record<string, number>;
  metrics: EvolutionMetrics;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  title: string;
  description: string;
  changes: string[];
  breaking?: boolean;
}

export interface EvolutionState {
  version: string;
  phase: EvolutionPhase;
  totalCycles: number;
  totalMutations: number;
  currentMetrics: EvolutionMetrics;
  lastCycle: EvolutionCycle | null;
  cycleHistory: EvolutionCycle[];
  changelog: ChangelogEntry[];
  lastUpdate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'titane_evolution_state';
const MAX_CYCLE_HISTORY = 50;
const CURRENT_VERSION = '19.3.0';

// ─────────────────────────────────────────────────────────────────────────────
// PHASE THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_THRESHOLDS: Record<EvolutionPhase, { minCycles: number; minMetrics: number }> = {
  nascent: { minCycles: 0, minMetrics: 0 },
  learning: { minCycles: 5, minMetrics: 50 },
  adapting: { minCycles: 20, minMetrics: 65 },
  optimizing: { minCycles: 50, minMetrics: 75 },
  evolving: { minCycles: 100, minMetrics: 85 },
  singularity: { minCycles: 200, minMetrics: 95 },
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CHANGELOG
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_CHANGELOG: ChangelogEntry[] = [
  {
    version: '19.3.0',
    date: '2025-11-30',
    type: 'major',
    title: 'Centre d\'Évolution Cognitive',
    description: 'Fusion Progression + Knowledge + Evolution + Memory',
    changes: [
      'XP Engine unifié avec persistence Tauri',
      'Knowledge Vault avec ingestion et indexation',
      'Evolution Engine avec changelog',
      'Memory Engine CT/MT/LT refactoré',
      'UI Centre d\'Évolution Cognitive',
    ],
    breaking: false,
  },
  {
    version: '19.2.0',
    date: '2025-11-29',
    type: 'major',
    title: 'Audio & TTS System',
    description: 'Système audio complet avec Piper TTS',
    changes: [
      'AudioService avec fallback Web Speech',
      'VoiceConversation component',
      'AudioSettings UI',
      'Piper TTS integration',
    ],
    breaking: false,
  },
  {
    version: '16.2.3',
    date: '2025-11-28',
    type: 'patch',
    title: 'Stabilisation & Sécurité',
    description: 'Corrections et améliorations de sécurité',
    changes: [
      'Whitelist commandes Tauri mise à jour',
      'Validation stricte des inputs',
      'Gestion erreurs améliorée',
    ],
    breaking: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────

const createDefaultState = (): EvolutionState => ({
  version: CURRENT_VERSION,
  phase: 'nascent',
  totalCycles: 0,
  totalMutations: 0,
  currentMetrics: {
    stability: 85,
    coherence: 80,
    performance: 75,
    cognitiveDepth: 70,
  },
  lastCycle: null,
  cycleHistory: [],
  changelog: INITIAL_CHANGELOG,
  lastUpdate: Date.now(),
});

// ─────────────────────────────────────────────────────────────────────────────
// EVOLUTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

class EvolutionEngine {
  private state: EvolutionState;
  private initialized = false;
  private listeners: Set<(state: EvolutionState) => void> = new Set();

  constructor() {
    this.state = createDefaultState();
  }

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const backendState = await secureInvoke<EvolutionState>('evolution_get_state');
      if (backendState) {
        this.state = { ...createDefaultState(), ...backendState };
        console.log('[EvolutionEngine] État chargé depuis backend:', this.state.version);
      }
    } catch {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.state = { ...createDefaultState(), ...parsed };
          console.log('[EvolutionEngine] État chargé depuis localStorage');
        }
      } catch (e) {
        console.warn('[EvolutionEngine] Erreur chargement:', e);
      }
    }

    this.initialized = true;
    this.notifyListeners();
  }

  // ─────────────────────────────────────────────────────────────────
  // EVOLUTION CYCLE
  // ─────────────────────────────────────────────────────────────────

  /**
   * Exécuter un cycle d'évolution
   */
  async runCycle(): Promise<EvolutionCycle> {
    const cycleNumber = this.state.totalCycles + 1;

    // Simuler des mutations
    const mutationsProposed = Math.floor(Math.random() * 5) + 1;
    const mutationsApplied = Math.floor(mutationsProposed * 0.7);

    // Calculer les améliorations
    const improvements: Record<string, number> = {};
    if (mutationsApplied > 0) {
      improvements.stability = Math.random() * 2;
      improvements.coherence = Math.random() * 2;
      improvements.performance = Math.random() * 3;
      improvements.cognitiveDepth = Math.random() * 1.5;
    }

    // Mettre à jour les métriques
    this.state.currentMetrics = {
      stability: Math.min(100, this.state.currentMetrics.stability + (improvements.stability || 0)),
      coherence: Math.min(100, this.state.currentMetrics.coherence + (improvements.coherence || 0)),
      performance: Math.min(100, this.state.currentMetrics.performance + (improvements.performance || 0)),
      cognitiveDepth: Math.min(100, this.state.currentMetrics.cognitiveDepth + (improvements.cognitiveDepth || 0)),
    };

    // Créer le cycle
    const cycle: EvolutionCycle = {
      id: `cycle_${Date.now()}`,
      cycleNumber,
      timestamp: Date.now(),
      phase: this.state.phase,
      mutationsProposed,
      mutationsApplied,
      improvements,
      metrics: { ...this.state.currentMetrics },
    };

    // Mettre à jour l'état
    this.state.totalCycles++;
    this.state.totalMutations += mutationsApplied;
    this.state.lastCycle = cycle;
    this.state.cycleHistory.unshift(cycle);
    this.state.lastUpdate = Date.now();

    // Limiter l'historique
    if (this.state.cycleHistory.length > MAX_CYCLE_HISTORY) {
      this.state.cycleHistory.pop();
    }

    // Vérifier la progression de phase
    this.checkPhaseProgression();

    // Persister
    await this.persist();
    this.notifyListeners();

    console.log(`[EvolutionEngine] Cycle ${cycleNumber} complété - Phase: ${this.state.phase}`);

    // Envoyer au backend
    try {
      await secureInvoke('evolution_run_cycle', { cycle });
    } catch {
      // Backend non disponible
    }

    return cycle;
  }

  // ─────────────────────────────────────────────────────────────────
  // PHASE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  private checkPhaseProgression(): void {
    const avgMetrics = this.getAverageMetrics();
    const phases: EvolutionPhase[] = ['nascent', 'learning', 'adapting', 'optimizing', 'evolving', 'singularity'];

    for (let i = phases.length - 1; i >= 0; i--) {
      const phase = phases[i];
      const threshold = PHASE_THRESHOLDS[phase];

      if (this.state.totalCycles >= threshold.minCycles && avgMetrics >= threshold.minMetrics) {
        if (this.state.phase !== phase) {
          console.log(`[EvolutionEngine] 🎉 Phase upgrade: ${this.state.phase} → ${phase}`);
          this.state.phase = phase;
        }
        break;
      }
    }
  }

  private getAverageMetrics(): number {
    const m = this.state.currentMetrics;
    return (m.stability + m.coherence + m.performance + m.cognitiveDepth) / 4;
  }

  // ─────────────────────────────────────────────────────────────────
  // CHANGELOG MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  addChangelogEntry(entry: Omit<ChangelogEntry, 'date'>): void {
    const fullEntry: ChangelogEntry = {
      ...entry,
      date: new Date().toISOString().split('T')[0],
    };

    this.state.changelog.unshift(fullEntry);
    this.state.version = entry.version;
    this.state.lastUpdate = Date.now();

    this.persist();
    this.notifyListeners();
  }

  getChangelog(): ChangelogEntry[] {
    return [...this.state.changelog];
  }

  // ─────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────

  private async persist(): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[EvolutionEngine] Erreur sauvegarde:', e);
    }

    try {
      await secureInvoke('evolution_save_state', { state: this.state });
    } catch {
      // Backend non disponible
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  getState(): EvolutionState {
    return { ...this.state };
  }

  getVersion(): string {
    return this.state.version;
  }

  getPhase(): EvolutionPhase {
    return this.state.phase;
  }

  getMetrics(): EvolutionMetrics {
    return { ...this.state.currentMetrics };
  }

  getCycleHistory(limit?: number): EvolutionCycle[] {
    return limit ? this.state.cycleHistory.slice(0, limit) : [...this.state.cycleHistory];
  }

  getPhaseProgress(): { current: EvolutionPhase; progress: number; nextPhase: EvolutionPhase | null } {
    const phases: EvolutionPhase[] = ['nascent', 'learning', 'adapting', 'optimizing', 'evolving', 'singularity'];
    const currentIdx = phases.indexOf(this.state.phase);
    const nextPhase = currentIdx < phases.length - 1 ? phases[currentIdx + 1] : null;

    if (!nextPhase) {
      return { current: this.state.phase, progress: 100, nextPhase: null };
    }

    const nextThreshold = PHASE_THRESHOLDS[nextPhase];
    const cycleProgress = Math.min(this.state.totalCycles / nextThreshold.minCycles, 1);
    const metricsProgress = Math.min(this.getAverageMetrics() / nextThreshold.minMetrics, 1);
    const progress = Math.floor((cycleProgress * 0.5 + metricsProgress * 0.5) * 100);

    return { current: this.state.phase, progress, nextPhase };
  }

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS
  // ─────────────────────────────────────────────────────────────────

  subscribe(listener: (state: EvolutionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const evolutionEngine = new EvolutionEngine();

if (typeof window !== 'undefined') {
  evolutionEngine.initialize().catch(console.error);
}

export default evolutionEngine;
