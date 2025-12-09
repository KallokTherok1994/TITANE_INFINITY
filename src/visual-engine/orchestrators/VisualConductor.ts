/**
 * TITANE∞ v21 — Visual Conductor
 * Orchestrateur événementiel du système visuel
 *
 * Le Visual Conductor est le cerveau qui :
 * - Écoute les événements OS (moteurs, pipeline, mémoire)
 * - Traduit via VisualSemanticGrammar
 * - Orchestre les phénomènes visuels
 * - Gère les priorités et conflits
 * - Synchronise avec TitaneVisualEngine
 *
 * Architecture:
 * OS Events → Visual Conductor → Visual Phenomena → Visual Engine → Render
 */

import EventEmitter from 'eventemitter3';
import VisualSemanticGrammar, {
  EngineState,
  OmegaPipelineStage,
  MemoryState,
  VisualPhenomenon,
  PhenomenonType,
} from './VisualSemanticGrammar';
import type { TitaneVisualEngineV21 } from '../TitaneVisualEngineV21';

// ═════════════════════════════════════════════════════════════════
// TYPES — ÉVÉNEMENTS OS
// ═════════════════════════════════════════════════════════════════

export interface EngineEvent {
  type: 'engine_state_change';
  engine: EngineState;
  intensity: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface PipelineEvent {
  type: 'pipeline_stage_change';
  stage: OmegaPipelineStage;
  progress: number;
  timestamp: number;
}

export interface MemoryEvent {
  type: 'memory_state_change';
  memoryState: MemoryState;
  intensity: number;
  timestamp: number;
}

export interface SystemEvent {
  type: 'system_event';
  event: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export type OSEvent = EngineEvent | PipelineEvent | MemoryEvent | SystemEvent;

// ═════════════════════════════════════════════════════════════════
// TYPES — CONFIGURATION
// ═════════════════════════════════════════════════════════════════

export interface VisualConductorConfig {
  enabled: boolean;
  maxActivePhenomena: number; // Limite de phénomènes simultanés
  conflictResolution: 'priority' | 'merge' | 'queue';
  transitionDuration: number; // ms
  debug: boolean;
}

export interface ConductorMetrics {
  eventsProcessed: number;
  phenomenaGenerated: number;
  phenomenaActive: number;
  averageLatency: number; // ms
  lastEventTime: number;
}

// ═════════════════════════════════════════════════════════════════
// VISUAL CONDUCTOR
// ═════════════════════════════════════════════════════════════════

export class VisualConductor extends EventEmitter {
  private config: VisualConductorConfig;
  private visualEngine: TitaneVisualEngineV21 | null = null;

  // État
  private activePhenomena: Map<string, VisualPhenomenon> = new Map();
  private phenomenaQueue: VisualPhenomenon[] = [];
  private isProcessing = false;

  // Métriques
  private metrics: ConductorMetrics = {
    eventsProcessed: 0,
    phenomenaGenerated: 0,
    phenomenaActive: 0,
    averageLatency: 0,
    lastEventTime: 0,
  };

  // Latency tracking
  private latencies: number[] = [];
  private maxLatencyHistory = 100;

  constructor(config: Partial<VisualConductorConfig> = {}) {
    super();

    this.config = {
      enabled: true,
      maxActivePhenomena: 10,
      conflictResolution: 'priority',
      transitionDuration: 500,
      debug: false,
      ...config,
    };

    this.log('Visual Conductor initialized');
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Connecte le Visual Engine
   */
  connectVisualEngine(engine: TitaneVisualEngineV21): void {
    this.visualEngine = engine;
    this.log('Visual Engine connected');
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<VisualConductorConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('Configuration updated', this.config);
  }

  // ─────────────────────────────────────────────────────────────
  // ÉVÉNEMENTS OS → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Point d'entrée principal : reçoit un événement OS
   */
  async handleOSEvent(event: OSEvent): Promise<void> {
    if (!this.config.enabled) return;

    const startTime = performance.now();

    try {
      // Traduire l'événement en phénomènes visuels
      const phenomena = this.translateEvent(event);

      // Traiter les phénomènes
      await this.processPhenomena(phenomena);

      // Métriques
      this.metrics.eventsProcessed++;
      this.metrics.phenomenaGenerated += phenomena.length;
      this.metrics.lastEventTime = Date.now();

      const latency = performance.now() - startTime;
      this.trackLatency(latency);

      this.emit('event_processed', { event, phenomena, latency });
    } catch (error) {
      console.error('[VisualConductor] Error handling OS event:', error);
      this.emit('error', { event, error });
    }
  }

  /**
   * Traduit un événement OS en phénomènes visuels
   */
  private translateEvent(event: OSEvent): VisualPhenomenon[] {
    const phenomena: VisualPhenomenon[] = [];

    switch (event.type) {
      case 'engine_state_change':
        phenomena.push(
          ...VisualSemanticGrammar.translateEngineState(
            event.engine,
            event.intensity,
            event.metadata
          )
        );
        break;

      case 'pipeline_stage_change':
        phenomena.push(
          ...VisualSemanticGrammar.translateOmegaStage(event.stage, event.progress)
        );
        break;

      case 'memory_state_change':
        phenomena.push(
          ...VisualSemanticGrammar.translateMemoryState(
            event.memoryState,
            event.intensity
          )
        );
        break;

      case 'system_event':
        phenomena.push(
          ...VisualSemanticGrammar.translateSystemEvent(event.event, event.metadata)
        );
        break;
    }

    this.log(`Translated event → ${phenomena.length} phenomena`, event.type);

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // GESTION DES PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traite une liste de phénomènes visuels
   */
  private async processPhenomena(phenomena: VisualPhenomenon[]): Promise<void> {
    if (phenomena.length === 0) return;

    // Ajouter à la queue
    this.phenomenaQueue.push(...phenomena);

    // Déclencher le traitement si pas déjà en cours
    if (!this.isProcessing) {
      await this.processPhenomenaQueue();
    }
  }

  /**
   * Traite la queue de phénomènes
   */
  private async processPhenomenaQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.phenomenaQueue.length > 0) {
        const phenomenon = this.phenomenaQueue.shift();
        if (!phenomenon) continue;

        // Vérifier les limites
        if (this.activePhenomena.size >= this.config.maxActivePhenomena) {
          await this.resolveConflicts(phenomenon);
        }

        // Activer le phénomène
        await this.activatePhenomenon(phenomenon);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Active un phénomène visuel
   */
  private async activatePhenomenon(phenomenon: VisualPhenomenon): Promise<void> {
    this.log(`Activating phenomenon: ${phenomenon.type}`, phenomenon);

    // Ajouter aux phénomènes actifs
    this.activePhenomena.set(phenomenon.id, phenomenon);
    this.metrics.phenomenaActive = this.activePhenomena.size;

    // Propager au Visual Engine
    if (this.visualEngine) {
      await this.applyPhenomenonToEngine(phenomenon);
    }

    // Programmer la désactivation si durée définie
    if (phenomenon.duration) {
      setTimeout(() => {
        this.deactivatePhenomenon(phenomenon.id);
      }, phenomenon.duration);
    }

    this.emit('phenomenon_activated', phenomenon);
  }

  /**
   * Désactive un phénomène visuel
   */
  private deactivatePhenomenon(phenomenonId: string): void {
    const phenomenon = this.activePhenomena.get(phenomenonId);
    if (!phenomenon) return;

    this.log(`Deactivating phenomenon: ${phenomenon.type}`);

    this.activePhenomena.delete(phenomenonId);
    this.metrics.phenomenaActive = this.activePhenomena.size;

    this.emit('phenomenon_deactivated', phenomenon);
  }

  /**
   * Applique un phénomène au Visual Engine
   */
  private async applyPhenomenonToEngine(phenomenon: VisualPhenomenon): Promise<void> {
    if (!this.visualEngine) return;

    const { type, intensity, config } = phenomenon;

    // Mapping phénomène → méthodes Visual Engine
    // TODO: À implémenter selon l'API de TitaneVisualEngineV21

    switch (type) {
      case PhenomenonType.CORE_SIGNATURE:
        // Signature permanente
        // this.visualEngine.setCoreSignature(config);
        break;

      case PhenomenonType.CORE_PULSE:
        // Pulsation du noyau
        // this.visualEngine.triggerCorePulse(intensity, config);
        break;

      case PhenomenonType.ORBITAL_RING_ACTIVATION:
        // Activation anneaux orbitaux
        // this.visualEngine.setOrbitalRings(config);
        break;

      case PhenomenonType.PARTICLE_BURST:
        // Burst de particules
        // this.visualEngine.triggerParticleBurst(intensity, config);
        break;

      case PhenomenonType.ENERGY_ARCS:
        // Arcs énergétiques
        // this.visualEngine.activateEnergyArcs(config);
        break;

      case PhenomenonType.HEALING_WAVES:
        // Vagues de guérison
        // this.visualEngine.triggerHealingWaves(config);
        break;

      case PhenomenonType.GLITCH_EFFECT:
        // Effet glitch
        // this.visualEngine.triggerGlitch(intensity, config);
        break;

      // ... autres types
    }

    this.log(`Applied phenomenon to engine: ${type}`);
  }

  // ─────────────────────────────────────────────────────────────
  // RÉSOLUTION DE CONFLITS
  // ─────────────────────────────────────────────────────────────

  /**
   * Résout les conflits quand trop de phénomènes sont actifs
   */
  private async resolveConflicts(newPhenomenon: VisualPhenomenon): Promise<void> {
    const strategy = this.config.conflictResolution;

    switch (strategy) {
      case 'priority':
        await this.resolvePriorityConflict(newPhenomenon);
        break;

      case 'merge':
        await this.resolveMergeConflict(newPhenomenon);
        break;

      case 'queue':
        // Le phénomène reste en queue
        break;
    }
  }

  /**
   * Résolution par priorité : remplace le phénomène le moins prioritaire
   */
  private async resolvePriorityConflict(newPhenomenon: VisualPhenomenon): Promise<void> {
    // Trouver le phénomène actif avec la priorité la plus basse
    let lowestPriority = Infinity;
    let lowestId: string | null = null;

    for (const [id, phenomenon] of this.activePhenomena) {
      if (phenomenon.priority < lowestPriority) {
        lowestPriority = phenomenon.priority;
        lowestId = id;
      }
    }

    // Si le nouveau phénomène a une priorité plus haute, remplacer
    if (lowestId && newPhenomenon.priority > lowestPriority) {
      this.log(`Replacing low-priority phenomenon: ${lowestId}`);
      this.deactivatePhenomenon(lowestId);
    }
  }

  /**
   * Résolution par fusion : merge les phénomènes similaires
   */
  private async resolveMergeConflict(newPhenomenon: VisualPhenomenon): Promise<void> {
    // Chercher un phénomène du même type
    for (const [id, phenomenon] of this.activePhenomena) {
      if (phenomenon.type === newPhenomenon.type) {
        this.log(`Merging similar phenomena: ${newPhenomenon.type}`);

        // Fusionner les intensités (moyenne pondérée par priorité)
        const totalPriority = phenomenon.priority + newPhenomenon.priority;
        const mergedIntensity =
          (phenomenon.intensity * phenomenon.priority +
            newPhenomenon.intensity * newPhenomenon.priority) /
          totalPriority;

        // Mettre à jour le phénomène existant
        phenomenon.intensity = mergedIntensity;
        phenomenon.priority = Math.max(phenomenon.priority, newPhenomenon.priority);

        // Réappliquer
        await this.applyPhenomenonToEngine(phenomenon);

        return;
      }
    }

    // Si pas de fusion possible, appliquer stratégie priorité
    await this.resolvePriorityConflict(newPhenomenon);
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTRIQUES & MONITORING
  // ─────────────────────────────────────────────────────────────

  /**
   * Track latency
   */
  private trackLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > this.maxLatencyHistory) {
      this.latencies.shift();
    }

    const sum = this.latencies.reduce((a, b) => a + b, 0);
    this.metrics.averageLatency = sum / this.latencies.length;
  }

  /**
   * Retourne les métriques actuelles
   */
  getMetrics(): ConductorMetrics {
    return { ...this.metrics };
  }

  /**
   * Retourne la liste des phénomènes actifs
   */
  getActivePhenomena(): VisualPhenomenon[] {
    return Array.from(this.activePhenomena.values());
  }

  /**
   * Reset métriques
   */
  resetMetrics(): void {
    this.metrics = {
      eventsProcessed: 0,
      phenomenaGenerated: 0,
      phenomenaActive: this.activePhenomena.size,
      averageLatency: 0,
      lastEventTime: 0,
    };
    this.latencies = [];
  }

  // ─────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────

  /**
   * Démarre le conductor
   */
  start(): void {
    this.config.enabled = true;
    this.log('Visual Conductor started');
    this.emit('started');
  }

  /**
   * Arrête le conductor
   */
  stop(): void {
    this.config.enabled = false;
    this.activePhenomena.clear();
    this.phenomenaQueue = [];
    this.log('Visual Conductor stopped');
    this.emit('stopped');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.removeAllListeners();
    this.visualEngine = null;
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[VisualConductor]', ...args);
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

export default VisualConductor;
