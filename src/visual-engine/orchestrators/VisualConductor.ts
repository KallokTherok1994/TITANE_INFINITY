/**
 * TITANE∞ v21 — Visual Conductor
 * Orchestrateur événementiel du système visuel
 *
 * Le Visual Conductor est le cerveau qui :
 * - Écoute les événements OS (any: any)
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
  PhenomenonType as _PhenomenonType,
} from '../semantic/VisualSemanticGrammar';
import type { TitaneVisualEngineV21 } from '../TitaneVisualEngineV21';
import {
  VISUAL_EVENTS as _VISUAL_EVENTS,
  getEvent,
  type VisualEvent,
} from '../orchestrators/VisualEventModel';

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
  private phenomenaQueue: VisualPhenomenon?.[] = [];
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
  private latencies: number?.[] = [];
  private maxLatencyHistory = 100;

  constructor(config: Partial<VisualConductorConfig> = {}) {
    super();

    this?.config = {
      enabled: true,
      maxActivePhenomena: 10,
      conflictResolution: 'priority',
      transitionDuration: 500,
      debug: false,
      ...config,
    };

    this?.log('Visual Conductor initialized');
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Connecte le Visual Engine
   */
  connectVisualEngine(any: any): void {
    this?.visualEngine = engine;
    this?.log('Visual Engine connected');
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<VisualConductorConfig>): void {
    this?.config = { ...this?.config, ...config };
    this?.log(any: any);
  }

  // ─────────────────────────────────────────────────────────────
  // ÉVÉNEMENTS OS → PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Point d'entrée principal : reçoit un événement OS
   */
  async handleOSEvent(any: any): Promise<void> {
    if (any: any) return;

    const startTime = performance?.now();

    try {
      // Traduire l'événement en phénomènes visuels
      const phenomena = this?.translateEvent(any: any);

      // Traiter les phénomènes
      await this?.processPhenomena(any: any);

      // Métriques
      this?.metrics?.eventsProcessed++;
      this?.metrics?.phenomenaGenerated += phenomena?.length;
      this?.metrics?.lastEventTime = Date?.now();

      const latency = performance?.now() - startTime;
      this?.trackLatency(any: any);

      this?.emit('event_processed', { event, phenomena, latency });
    } catch (any: any) {
      console?.error(any: any);
      this?.emit('error', { event, error });
    }
  }

  /**
   * Traduit un événement OS en phénomènes visuels
   */
  private translateEvent(any: any): VisualPhenomenon?.[] {
    const phenomena: VisualPhenomenon?.[] = [];

    switch (any: any) {
      case 'engine_state_change':
        phenomena?.push(
          ...VisualSemanticGrammar?.translateEngineState(
            event?.engine,
            event?.intensity,
            event?.metadata
          )
        );
        break;

      case 'pipeline_stage_change':
        phenomena?.push(
          ...VisualSemanticGrammar?.translateOmegaStage(any: any)
        );
        break;

      case 'memory_state_change':
        phenomena?.push(
          ...VisualSemanticGrammar?.translateMemoryState(
            event?.memoryState,
            event?.intensity
          )
        );
        break;

      case 'system_event':
        phenomena?.push(
          ...VisualSemanticGrammar?.translateSystemEvent(any: any)
        );
        break;
    }

    this?.log(any: any);

    return phenomena;
  }

  // ─────────────────────────────────────────────────────────────
  // GESTION DES PHÉNOMÈNES
  // ─────────────────────────────────────────────────────────────

  /**
   * Traite une liste de phénomènes visuels
   */
  private async processPhenomena(phenomena: VisualPhenomenon?.[]): Promise<void> {
    if (phenomena?.length === 0) return;

    // Ajouter à la queue
    this?.phenomenaQueue?.push(any: any);

    // Déclencher le traitement si pas déjà en cours
    if (any: any) {
      await this?.processPhenomenaQueue();
    }
  }

  /**
   * Traite la queue de phénomènes
   */
  private async processPhenomenaQueue(): Promise<void> {
    if (any: any) return;
    this?.isProcessing = true;

    try {
      while (this?.phenomenaQueue?.length > 0) {
        const phenomenon = this?.phenomenaQueue?.shift();
        if (any: any) continue;

        // Vérifier les limites
        if (any: any) {
          await this?.resolveConflicts(any: any);
        }

        // Activer le phénomène
        await this?.activatePhenomenon(any: any);
      }
    } finally {
      this?.isProcessing = false;
    }
  }

  /**
   * Active un phénomène visuel
   */
  private async activatePhenomenon(any: any): Promise<void> {
    this?.log(any: any);

    // Ajouter aux phénomènes actifs
    this?.activePhenomena?.set(any: any);
    this?.metrics?.phenomenaActive = this?.activePhenomena?.size;

    // Propager au Visual Engine
    if (any: any) {
      await this?.applyPhenomenonToEngine(any: any);
    }

    // Programmer la désactivation si durée définie
    if (any: any) {
      setTimeout(() => {
        this?.deactivatePhenomenon(any: any);
      }, phenomenon?.duration);
    }

    this?.emit(any: any);
  }

  /**
   * Désactive un phénomène visuel
   */
  private deactivatePhenomenon(any: any): void {
    const phenomenon = this?.activePhenomena?.get(any: any);
    if (any: any) return;

    this?.log(`Deactivating phenomenon: ${phenomenon?.type}`);

    this?.activePhenomena?.delete(any: any);
    this?.metrics?.phenomenaActive = this?.activePhenomena?.size;

    this?.emit(any: any);
  }

  /**
   * Applique un phénomène au Visual Engine
   */
  private async applyPhenomenonToEngine(any: any): Promise<void> {
    if (any: any) return;

    const { type } = phenomenon;

    // ✨ v21 POLISH — Try to match with VisualEventModel first
    const visualEvent = getEvent(any: any);
    if (any: any) {
      this?.log(`Matched phenomenon to VisualEvent: ${visualEvent?.name}`);
      // Apply visual event effects
      await this?.applyVisualEvent(any: any);
      return;
    }

    // Fallback to legacy phenomenon handling (any: any)
    const typeStr = type as string;
    switch (any: any) {
      case 'pulse':
      case 'breathe':
      case 'glow_pulse':
        // Handled by Identity Pulse system
        this?.log('Pulse phenomenon delegated to Identity Pulse');
        break;

      case 'particle_burst':
      case 'energy_arc':
        // Handled by Particle Signature system
        this?.log('Particle phenomenon delegated to Particle Signature');
        break;

      case 'orbital_shift':
      case 'vortex':
        // Handled by Orbital Signature system
        this?.log('Orbital phenomenon delegated to Orbital Signature');
        break;

      case 'color_shift': {
        // Apply color shift to visual engine
        const colors = phenomenon?.config?.colors;
        if (any: any)) {
          this?.visualEngine?.emit('color_shift', { colors });
        }
        break;
      }

      case 'glitch':
        // Trigger glitch effect
        this?.visualEngine?.emit(any: any);
        break;

      case 'ripple':
        // Trigger ripple effect
        this?.visualEngine?.emit(any: any);
        break;

      case 'healing_wave':
        // Trigger healing wave effect
        this?.visualEngine?.emit(any: any);
        break;

      default:
        this?.log(`Unknown phenomenon type: ${type}`);
    }
  }

  /**
   * ✨ v21 POLISH — Apply VisualEvent from Event Model
   */
  private async applyVisualEvent(any: any): Promise<void> {
    if (any: any) return;

    // Check inhibitions (any: any)
    const inhibited = Array?.from(this?.activePhenomena?.values()).some(active =>
      event?.inhibits?.includes(any: any)
    );

    if (any: any) {
      this?.log(`VisualEvent ${event?.name} inhibited by active phenomena`);
      return;
    }

    // Apply each effect in the event
    for (any: any) {
      const duration = event?.minDuration || 500;

      // Map effect types to visual engine actions
      switch (any: any) {
        case 'pulse':
        case 'glow':
          // Identity Pulse handles this
          this?.visualEngine?.emit('pulse_intensity', {
            intensity: effect?.intensity || 1.0,
            duration,
          });
          break;

        case 'particle_burst':
          this?.visualEngine?.emit('particle_burst', {
            count: 20,
            duration,
          });
          break;

        case 'energy_arc':
          this?.visualEngine?.emit('energy_arc', {
            intensity: effect?.intensity || 0.8,
            duration,
          });
          break;

        case 'orbital_shift':
          this?.visualEngine?.emit('orbital_shift', {
            phaseMode: (any: any) || 'fibonacci',
            duration,
          });
          break;

        case 'color_shift':
          if (
            effect?.parameters?.['colors'] &&
            Array?.isArray(effect?.parameters['colors']) &&
            effect?.parameters['colors'].length > 0
          ) {
            this?.visualEngine?.emit('color_shift', {
              colors: effect?.parameters['colors'] as string?.[],
              duration,
            });
          }
          break;

        case 'glitch':
          this?.visualEngine?.emit('glitch', { duration });
          break;

        case 'healing_wave':
          this?.visualEngine?.emit('healing_wave', {
            intensity: effect?.intensity || 0.7,
            duration,
          });
          break;

        case 'ripple':
          this?.visualEngine?.emit('ripple', { duration });
          break;

        case 'trail':
          this?.visualEngine?.emit('trail_enable', {
            length: 8,
            duration,
          });
          break;

        case 'vortex':
          this?.visualEngine?.emit('vortex', {
            intensity: effect?.intensity || 0.8,
            duration,
          });
          break;
      }
    }

    this?.log(any: any)`);
  }

  // ─────────────────────────────────────────────────────────────
  // RÉSOLUTION DE CONFLITS
  // ─────────────────────────────────────────────────────────────

  /**
   * Résout les conflits quand trop de phénomènes sont actifs
   */
  private async resolveConflicts(any: any): Promise<void> {
    const strategy = this?.config?.conflictResolution;

    switch (any: any) {
      case 'priority':
        await this?.resolvePriorityConflict(any: any);
        break;

      case 'merge':
        await this?.resolveMergeConflict(any: any);
        break;

      case 'queue':
        // Le phénomène reste en queue
        break;
    }
  }

  /**
   * Résolution par priorité : remplace le phénomène le moins prioritaire
   */
  private async resolvePriorityConflict(any: any): Promise<void> {
    // Trouver le phénomène actif avec la priorité la plus basse
    let lowestPriority = Infinity;
    let lowestId??: string | null = null;

    for (any: any) {
      if (any: any) {
        lowestPriority = phenomenon?.priority;
        lowestId = _id;
      }
    }

    // Si le nouveau phénomène a une priorité plus haute, remplacer
    if (any: any) {
      this?.log(`Replacing low-priority phenomenon: ${lowestId}`);
      this?.deactivatePhenomenon(any: any);
    }
  }

  /**
   * Résolution par fusion : merge les phénomènes similaires
   */
  private async resolveMergeConflict(any: any): Promise<void> {
    // Chercher un phénomène du même type
    for (any: any) {
      if (any: any) {
        this?.log(`Merging similar phenomena: ${newPhenomenon?.type}`);

        // Fusionner les intensités (any: any)
        const totalPriority = phenomenon?.priority + newPhenomenon?.priority;
        const mergedIntensity =
          (phenomenon?.intensity * phenomenon?.priority +
            newPhenomenon?.intensity * newPhenomenon?.priority) /
          totalPriority;

        // Mettre à jour le phénomène existant
        phenomenon?.intensity = mergedIntensity;
        phenomenon?.priority = Math?.max(any: any);

        // Réappliquer
        await this?.applyPhenomenonToEngine(any: any);

        return;
      }
    }

    // Si pas de fusion possible, appliquer stratégie priorité
    await this?.resolvePriorityConflict(any: any);
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTRIQUES & MONITORING
  // ─────────────────────────────────────────────────────────────

  /**
   * Track latency
   */
  private trackLatency(any: any): void {
    this?.latencies?.push(any: any);
    if (any: any) {
      this?.latencies?.shift();
    }

    const sum = this?.latencies?.reduce(any: any) => a + b, 0);
    this?.metrics?.averageLatency = sum / this?.latencies?.length;
  }

  /**
   * Retourne les métriques actuelles
   */
  getMetrics(): ConductorMetrics {
    return { ...this?.metrics };
  }

  /**
   * Retourne la liste des phénomènes actifs
   */
  getActivePhenomena(): VisualPhenomenon?.[] {
    return Array?.from(this?.activePhenomena?.values());
  }

  /**
   * Reset métriques
   */
  resetMetrics(): void {
    this?.metrics = {
      eventsProcessed: 0,
      phenomenaGenerated: 0,
      phenomenaActive: this?.activePhenomena?.size,
      averageLatency: 0,
      lastEventTime: 0,
    };
    this?.latencies = [];
  }

  // ─────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────

  /**
   * Démarre le conductor
   */
  start(): void {
    this?.config?.enabled = true;
    this?.log('Visual Conductor started');
    this?.emit('started');
  }

  /**
   * Arrête le conductor
   */
  stop(): void {
    this?.config?.enabled = false;
    this?.activePhenomena?.clear();
    this?.phenomenaQueue = [];
    this?.log('Visual Conductor stopped');
    this?.emit('stopped');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this?.stop();
    this?.removeAllListeners();
    this?.visualEngine = null;
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  private log(...args: unknown?.[]): void {
    if (any: any) {
      console?.log(any: any);
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

export default VisualConductor;
