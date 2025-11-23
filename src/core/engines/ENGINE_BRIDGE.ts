/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v22 — Engine Bridge
// Pont de synchronisation entre tous les moteurs (Visual, Sound, HoloMesh, HyperDepth)

import { glowEngine } from '../visual/GLOW_ENGINE';
import { motionEngine } from '../visual/MOTION_ENGINE';
import { stateEngine, SystemState } from '../visual/STATE_ENGINE';
import { soundEngine, SoundConfig } from '../sound/SOUND_ENGINE';
import { holoMeshEngine } from '../holography/HOLOMESH_ENGINE';
import { hyperDepthEngine } from '../hyperdepth/HYPERDEPTH_ENGINE';

// 🎭 Event types
export type EngineEvent =
  | 'state-change'
  | 'module-update'
  | 'metric-change'
  | 'user-action'
  | 'system-alert'
  | 'connection-change';

// 🎨 Event data
export interface EngineEventData {
  type: EngineEvent;
  payload: any;
  timestamp: number;
}

// 🧬 Engine Bridge principal
export class EngineBridge {
  private eventQueue: EngineEventData[] = [];
  private eventListeners: Map<EngineEvent, Array<(data: EngineEventData) => void>> = new Map();

  constructor() {
    this.initializeSynchronization();
  }

  /**
   * Initialiser la synchronisation entre moteurs
   */
  private initializeSynchronization(): void {
    // Synchroniser State Engine avec les autres moteurs
    stateEngine.onStateChange((state, _config) => {
      this.handleStateChange(state);
    });
  }

  /**
   * Gérer un changement d'état système (propagation complète)
   */
  private handleStateChange(state: SystemState): void {
    const stateConfig = stateEngine.getStateConfig(state);

    // 1. Sound Engine : jouer son approprié
    soundEngine.playStateSound(state);

    // 2. HyperDepth Engine : adapter profondeur
    hyperDepthEngine.setGlobalIntensity(stateConfig.intensity);

    // 3. Motion Engine : adapter vitesse
    if (state === 'danger' || state === 'warning') {
      motionEngine.speedUpMotions(0.7);
    } else if (state === 'stable') {
      motionEngine.slowDownMotions(1.0);
    }

    // 4. Émettre événement
    this.emitEvent({
      type: 'state-change',
      payload: { state, config: stateConfig },
      timestamp: Date.now(),
    });
  }

  /**
   * Mettre à jour un module cognitif (synchronisation complète)
   */
  updateModule(moduleName: string, value: number, previousValue: number = 0): void {
    // 1. Glow Engine : générer glow
    glowEngine.generateModuleGlow(moduleName, value);

    // 2. Motion Engine : adapter mouvement
    motionEngine.getModuleMotion(moduleName, value);

    // 3. Sound Engine : feedback sonore si changement significatif
    if (Math.abs(value - previousValue) >= 5) {
      soundEngine.playModuleFeedback(moduleName, value, previousValue);
    }

    // 4. HoloMesh Engine : mettre à jour intensité node
    holoMeshEngine.updateNodeIntensity(moduleName, value / 100);

    // 5. Émettre événement
    this.emitEvent({
      type: 'module-update',
      payload: { moduleName, value, previousValue },
      timestamp: Date.now(),
    });
  }

  /**
   * Gérer un changement de métrique système
   */
  updateMetrics(metrics: { cpu?: number; memory?: number; errors?: number; connections?: number }): void {
    // 1. Déterminer nouvel état
    const newState = stateEngine.determineStateFromMetrics(metrics);
    const currentState = stateEngine.getCurrentState();

    // 2. Si l'état change, propager
    if (newState !== currentState) {
      stateEngine.setState(newState);
    }

    // 3. Émettre événement
    this.emitEvent({
      type: 'metric-change',
      payload: metrics,
      timestamp: Date.now(),
    });
  }

  /**
   * Gérer une action utilisateur avec feedback multi-sensoriel
   */
  handleUserAction(action: 'click' | 'hover' | 'open' | 'close' | 'success' | 'error'): void {
    // Mapping action → son
    const soundMap: Record<typeof action, SoundConfig> = {
      click: { type: 'click', volume: 0.3 },
      hover: { type: 'hover', volume: 0.2 },
      open: { type: 'open', volume: 0.3, duration: 200 },
      close: { type: 'close', volume: 0.3, duration: 200 },
      success: { type: 'success', volume: 0.4 },
      error: { type: 'error', volume: 0.5 },
    };

    const soundConfig = soundMap[action];
    soundEngine.playSound(soundConfig);

    this.emitEvent({
      type: 'user-action',
      payload: { action },
      timestamp: Date.now(),
    });
  }

  /**
   * Émettre une alerte système (visuel + son + motion)
   */
  emitAlert(severity: 'info' | 'warning' | 'critical', message: string): void {
    // Mapping severity → état
    const stateMap = {
      info: 'processing' as SystemState,
      warning: 'warning' as SystemState,
      critical: 'danger' as SystemState,
    };

    const state = stateMap[severity];

    // 1. Changer état temporairement
    const previousState = stateEngine.getCurrentState();
    stateEngine.setState(state);

    // 2. Son d'alerte
    soundEngine.playStateSound(state);

    // 3. Restaurer état après 2s
    setTimeout(() => {
      stateEngine.setState(previousState);
    }, 2000);

    this.emitEvent({
      type: 'system-alert',
      payload: { severity, message },
      timestamp: Date.now(),
    });
  }

  /**
   * Synchroniser tous les moteurs avec l'état actuel
   */
  synchronizeAll(): void {
    const currentState = stateEngine.getCurrentState();
    const stateConfig = stateEngine.getStateConfig(currentState);

    // Synchroniser tous les moteurs
    hyperDepthEngine.setGlobalIntensity(stateConfig.intensity);
    soundEngine.setMasterVolume(0.4);
    glowEngine.clearActiveGlows();
    motionEngine.stopAllMotions();
  }

  /**
   * S'abonner à un type d'événement
   */
  on(event: EngineEvent, callback: (data: EngineEventData) => void): () => void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);

    // Retourner fonction de désinscription
    return () => {
      const currentListeners = this.eventListeners.get(event) || [];
      this.eventListeners.set(
        event,
        currentListeners.filter((cb) => cb !== callback)
      );
    };
  }

  /**
   * Émettre un événement
   */
  private emitEvent(data: EngineEventData): void {
    // Ajouter à la queue
    this.eventQueue.push(data);

    // Limiter la taille de la queue (garder 100 derniers)
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }

    // Notifier les listeners
    const listeners = this.eventListeners.get(data.type) || [];
    listeners.forEach((callback) => callback(data));
  }

  /**
   * Obtenir l'historique des événements
   */
  getEventHistory(limit: number = 50): EngineEventData[] {
    return this.eventQueue.slice(-limit);
  }

  /**
   * Nettoyer l'historique
   */
  clearEventHistory(): void {
    this.eventQueue = [];
  }

  /**
   * Réinitialiser tous les moteurs
   */
  resetAll(): void {
    stateEngine.reset();
    glowEngine.clearActiveGlows();
    motionEngine.stopAllMotions();
    soundEngine.stopAllSounds();
    holoMeshEngine.reset();
    hyperDepthEngine.reset();
    this.clearEventHistory();
  }

  /**
   * Obtenir le statut de tous les moteurs
   */
  getStatus(): {
    state: SystemState;
    glowActive: number;
    motionActive: number;
    soundEnabled: boolean;
    meshNodes: number;
    depthLayers: number;
  } {
    return {
      state: stateEngine.getCurrentState(),
      glowActive: 0, // TODO: implémenter compteur
      motionActive: 0, // TODO: implémenter compteur
      soundEnabled: true, // TODO: récupérer depuis soundEngine
      meshNodes: holoMeshEngine.getMeshData().nodes.length,
      depthLayers: hyperDepthEngine.getConfig().layers.length,
    };
  }
}

// 🌟 Instance singleton
export const engineBridge = new EngineBridge();

// 🎨 Export des moteurs individuels pour accès direct
export { glowEngine, motionEngine, stateEngine, soundEngine, holoMeshEngine, hyperDepthEngine };
