/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v23 — Interface Mirror
// Miroir cognitif : L’interface reflète l’état utilisateur et système

import { cognitiveEngine, CognitiveState } from './COGNITIVE_ENGINE';
import { motionEngine } from '../visual/MOTION_ENGINE';
import { hyperDepthEngine } from '../hyperdepth/HYPERDEPTH_ENGINE';
import { soundEngine } from '../sound/SOUND_ENGINE';

// 🪞 Configuration du miroir
export interface MirrorConfig {
  reflectUserState: boolean; // Refléter rythme utilisateur
  reflectSystemState: boolean; // Refléter état système
  syncGlow: boolean; // Synchroniser glow
  syncMotion: boolean; // Synchroniser mouvement
  syncSound: boolean; // Synchroniser son
  syncDepth: boolean; // Synchroniser profondeur
}

// 🌌 Interface Mirror Engine
export class InterfaceMirror {
  private config: MirrorConfig = {
    reflectUserState: true,
    reflectSystemState: true,
    syncGlow: true,
    syncMotion: true,
    syncSound: true,
    syncDepth: true,
  };

  private mirrorActive: boolean = false;

  /**
   * Activer le miroir cognitif
   */
  activate(): void {
    if (this.mirrorActive) return;

    this.mirrorActive = true;

    // Activer le cognitive engine
    cognitiveEngine.activate();

    // Démarrer la réflexion continue
    this.startReflection();
  }

  /**
   * Démarrer la réflexion continue
   */
  private startReflection(): void {
    setInterval(() => {
      if (!this.mirrorActive) return;

      const state = cognitiveEngine.getState();
      this.reflect(state);
    }, 1000); // Réflexion toutes les secondes
  }

  /**
   * Refléter l'état cognitif dans l'interface
   */
  private reflect(state: CognitiveState): void {
    // 1. Refléter le rythme utilisateur
    if (this.config.reflectUserState) {
      this.reflectUserRhythm(state);
    }

    // 2. Refléter l'état système
    if (this.config.reflectSystemState) {
      this.reflectSystemState(state);
    }
  }

  /**
   * Refléter le rythme utilisateur dans le visuel
   */
  private reflectUserRhythm(state: CognitiveState): void {
    const { userRhythm } = state;

    // Fatigue → Ralentir tout
    if (this.config.syncMotion && userRhythm.fatigue > 0.5) {
      motionEngine.slowDownMotions(1.5);
    }

    // Rythme rapide → Accélérer
    if (this.config.syncMotion && userRhythm.speed === 'fast') {
      motionEngine.speedUpMotions(0.8);
    }

    // Focus élevé → Glow subtil
    if (this.config.syncGlow && userRhythm.focus > 0.7) {
      hyperDepthEngine.setGlobalIntensity(0.2);
    }

    // Intensité élevée → Glow fort
    if (this.config.syncGlow && userRhythm.intensity > 0.7) {
      hyperDepthEngine.setGlobalIntensity(0.6);
    }

    // Son adaptatif
    if (this.config.syncSound) {
      const volume = Math.max(0.2, 0.5 - userRhythm.fatigue * 0.3);
      soundEngine.setMasterVolume(volume);
    }
  }

  /**
   * Refléter l'état système dans le visuel
   */
  private reflectSystemState(state: CognitiveState): void {
    const { systemState } = state;

    // État danger → Intensité visuelle maximale
    if (systemState === 'danger' && this.config.syncGlow) {
      hyperDepthEngine.setGlobalIntensity(1.0);
    }

    // État stable → Intensité normale
    if (systemState === 'stable' && this.config.syncGlow) {
      hyperDepthEngine.setGlobalIntensity(0.3);
    }

    // Offline → Tout ralentir
    if (systemState === 'offline') {
      if (this.config.syncMotion) motionEngine.stopAllMotions();
      if (this.config.syncSound) soundEngine.setEnabled(false);
      if (this.config.syncDepth) hyperDepthEngine.setGlobalIntensity(0.1);
    }
  }

  /**
   * Obtenir la configuration du miroir
   */
  getConfig(): MirrorConfig {
    return { ...this.config };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(updates: Partial<MirrorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Désactiver le miroir
   */
  deactivate(): void {
    this.mirrorActive = false;
    cognitiveEngine.deactivate();
  }

  /**
   * Obtenir le statut du miroir
   */
  getStatus(): {
    active: boolean;
    consciousness: string;
    userPattern: string;
    systemState: string;
    adaptations: number;
  } {
    const state = cognitiveEngine.getState();
    const report = cognitiveEngine.generateConsciousnessReport();

    return {
      active: this.mirrorActive,
      consciousness: state.consciousness,
      userPattern: state.userRhythm.pattern,
      systemState: state.systemState,
      adaptations: report.adaptations.length,
    };
  }
}

// 🌟 Instance singleton
export const interfaceMirror = new InterfaceMirror();
