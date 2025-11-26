/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// ⚡ TITANE∞ v23 — Cognitive Engine
// Moteur cognitif complet (interface consciente et adaptative)

import { userRhythmAnalyzer, UserRhythm, UserEventType, RhythmMetric } from './USER_RHYTHM_ANALYZER';
import { adaptiveUI, AdaptiveUIConfig } from './ADAPTIVE_UI';
import { stateEngine, SystemState } from '../visual/STATE_ENGINE';
import { engineBridge } from '../engines/ENGINE_BRIDGE';

// 🎭 Niveau de conscience UI
export type ConsciousnessLevel = 'observation' | 'adaptation' | 'reflection' | 'communication';

// 🧠 État cognitif complet
export interface CognitiveState {
  consciousness: ConsciousnessLevel;
  userRhythm: UserRhythm;
  systemState: SystemState;
  uiConfig: AdaptiveUIConfig;
  active: boolean;
  lastSync: number;
}

// 🌌 Cognitive Engine principal
export class CognitiveEngine {
  private state: CognitiveState = {
    consciousness: 'observation',
    userRhythm: userRhythmAnalyzer.getRhythm(),
    systemState: stateEngine.getCurrentState(),
    uiConfig: adaptiveUI.getConfig(),
    active: false,
    lastSync: Date.now(),
  };

  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Activer le moteur cognitif
   */
  activate(): void {
    if (this.state.active) return;

    this.state.active = true;

    // 1. Observer le rythme utilisateur
    userRhythmAnalyzer.onRhythmChange((rhythm) => {
      this.handleRhythmChange(rhythm);
    });

    // 2. Observer l'état système
    stateEngine.onStateChange((systemState) => {
      this.handleStateChange(systemState);
    });

    // 3. Synchronisation périodique
    this.syncInterval = setInterval(() => {
      this.synchronize();
    }, 5000); // Toutes les 5 secondes

    // 4. Monter au niveau 'adaptation'
    this.state.consciousness = 'adaptation';
  }

  /**
   * Désactiver le moteur cognitif
   */
  deactivate(): void {
    if (!this.state.active) return;

    this.state.active = false;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.state.consciousness = 'observation';
  }

  /**
   * Gérer un changement de rythme utilisateur (Niveau 2: Adaptation)
   */
  private handleRhythmChange(rhythm: UserRhythm): void {
    this.state.userRhythm = rhythm;

    // Adapter l'UI selon le rythme
    adaptiveUI.adaptToUserRhythm(rhythm);
    this.state.uiConfig = adaptiveUI.getConfig();

    // Monter au niveau 'reflection'
    this.state.consciousness = 'reflection';

    // Propagation aux moteurs visuels
    this.propagateAdaptations();
  }

  /**
   * Gérer un changement d'état système (Niveau 3: Réflexion)
   */
  private handleStateChange(systemState: SystemState): void {
    this.state.systemState = systemState;

    // Adapter l'UI selon l'état
    adaptiveUI.adaptToSystemState(systemState);
    this.state.uiConfig = adaptiveUI.getConfig();

    // Monter au niveau 'communication'
    this.state.consciousness = 'communication';

    // Propagation aux moteurs
    this.propagateAdaptations();
  }

  /**
   * Propager les adaptations à tous les moteurs visuels
   */
  private propagateAdaptations(): void {
    const config = adaptiveUI.getConfig();

    // Ajuster animations selon la configuration
    if (config.animationSpeed === 'disabled') {
      engineBridge.updateMetrics({ cpu: 100 }); // Force slowdown
    } else if (config.animationSpeed === 'slow') {
      engineBridge.updateMetrics({ cpu: 70 });
    }

    // Adapter glow intensity
    // Note: Implémentation simplifiée, à étendre selon besoins
  }

  /**
   * Synchroniser tous les états (Niveau 4: Communication)
   */
  private synchronize(): void {
    this.state.lastSync = Date.now();

    // Synchroniser tous les moteurs
    engineBridge.synchronizeAll();

    // Redescendre au niveau 'observation'
    setTimeout(() => {
      if (this.state.consciousness === 'communication') {
        this.state.consciousness = 'observation';
      }
    }, 1000);
  }

  /**
   * Enregistrer un événement utilisateur
   */
  recordUserEvent(type: UserEventType, data?: Partial<RhythmMetric>): void {
    userRhythmAnalyzer.recordEvent({
      type,
      timestamp: Date.now(),
      ...data,
    });
  }

  /**
   * Obtenir l'état cognitif complet
   */
  getState(): CognitiveState {
    return { ...this.state };
  }

  /**
   * Générer un rapport de conscience
   */
  generateConsciousnessReport(): {
    level: ConsciousnessLevel;
    userState: string;
    systemState: string;
    adaptations: string[];
    recommendations: string[];
  } {
    const adaptations: string[] = [];
    const recommendations: string[] = [];

    // Analyse des adaptations actuelles
    const config = this.state.uiConfig;

    if (config.density === 'compact') adaptations.push('Densité réduite pour rapidité');
    if (config.animationSpeed === 'disabled') adaptations.push('Animations désactivées (surcharge système)');
    if (config.contrast === 'high') adaptations.push('Contraste élevé pour lisibilité');
    if (config.visualNoise === 'minimal') adaptations.push('Bruit visuel minimisé');

    // Recommandations
    if (this.state.userRhythm.fatigue > 0.5) {
      recommendations.push('Fatigue détectée : Simplification UI active');
    }
    if (this.state.systemState === 'danger') {
      recommendations.push('Système en état critique : Focus sur éléments essentiels');
    }
    if (this.state.userRhythm.speed === 'fast') {
      recommendations.push('Rythme rapide : UI optimisée pour efficacité');
    }

    return {
      level: this.state.consciousness,
      userState: `${this.state.userRhythm.pattern} (${this.state.userRhythm.speed})`,
      systemState: this.state.systemState,
      adaptations,
      recommendations,
    };
  }

  /**
   * Réinitialiser le moteur cognitif
   */
  reset(): void {
    this.deactivate();
    userRhythmAnalyzer.reset();
    adaptiveUI.reset();
    this.state = {
      consciousness: 'observation',
      userRhythm: userRhythmAnalyzer.getRhythm(),
      systemState: stateEngine.getCurrentState(),
      uiConfig: adaptiveUI.getConfig(),
      active: false,
      lastSync: Date.now(),
    };
  }
}

// 🌟 Instance singleton
export const cognitiveEngine = new CognitiveEngine();
