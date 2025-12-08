/**
 * TITANE∞ v20Ω — Performance Policy
 * Politique d'optimisation des performances
 */

import type {
  PolicyDecision,
  PolicyContext,
  PerformanceSignal,
  AdaptationState,
} from '../types';

/**
 * Seuils de performance
 */
const PERFORMANCE_THRESHOLDS = {
  fpsCritical: 15,
  fpsWarning: 30,
  fpsOptimal: 55,
  memoryWarning: 0.7,
  memoryCritical: 0.85,
  frameDropsWarning: 10,
  frameDropsCritical: 30,
  renderTimeWarning: 50, // ms
  renderTimeCritical: 100, // ms
};

/**
 * Politique de performance
 */
export class PerformancePolicy {
  private name = 'PerformancePolicy';
  private priority = 120; // Haute priorité
  private degradationLevel = 0; // 0=none, 1=light, 2=moderate, 3=aggressive

  /**
   * Évalue la politique
   */
  evaluate(context: PolicyContext): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];
    const { signals, currentState } = context;

    // Trouver le signal de performance
    const perfSignal = signals.find(s => s.type === 'performance') as PerformanceSignal | undefined;

    if (perfSignal) {
      const { fps, frameDrops, memoryUsage, renderTime } = perfSignal.value;

      // Évaluer les FPS
      const fpsDecisions = this.evaluateFPS(fps, currentState);
      decisions.push(...fpsDecisions);

      // Évaluer la mémoire
      const memoryDecisions = this.evaluateMemory(memoryUsage, currentState);
      decisions.push(...memoryDecisions);

      // Évaluer les frame drops
      const frameDropDecisions = this.evaluateFrameDrops(frameDrops, currentState);
      decisions.push(...frameDropDecisions);

      // Évaluer le temps de rendu
      const renderDecisions = this.evaluateRenderTime(renderTime, currentState);
      decisions.push(...renderDecisions);
    }

    return decisions;
  }

  /**
   * Évalue les FPS
   */
  private evaluateFPS(fps: number, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    if (fps < PERFORMANCE_THRESHOLDS.fpsCritical) {
      // Performance critique - dégradation agressive
      this.degradationLevel = 3;
      decisions.push({
        policy: this.name,
        action: 'aggressive_degradation',
        priority: this.priority + 50,
        adaptation: {
          motion: {
            animationsEnabled: false,
            transitionDuration: 0,
            parallaxEnabled: false,
            loadingAnimations: 'none',
            hoverEffects: false,
            scrollBehavior: 'auto',
          },
          theme: {
            ...state.theme,
            shadowIntensity: 'none',
          },
          layout: {
            ...state.layout,
            gridColumns: 1,
          },
        },
        reason: `FPS critique (${fps} < ${PERFORMANCE_THRESHOLDS.fpsCritical})`,
        overridable: false,
      });
    } else if (fps < PERFORMANCE_THRESHOLDS.fpsWarning) {
      // Performance warning
      this.degradationLevel = 2;
      decisions.push({
        policy: this.name,
        action: 'moderate_degradation',
        priority: this.priority + 30,
        adaptation: {
          motion: {
            ...state.motion,
            transitionDuration: Math.min(state.motion.transitionDuration, 100),
            parallaxEnabled: false,
            loadingAnimations: 'spinner',
          },
          theme: {
            ...state.theme,
            shadowIntensity: 'none',
          },
        },
        reason: `FPS faible (${fps} < ${PERFORMANCE_THRESHOLDS.fpsWarning})`,
        overridable: true,
      });
    } else if (fps >= PERFORMANCE_THRESHOLDS.fpsOptimal && this.degradationLevel > 0) {
      // Performance restaurée
      this.degradationLevel = Math.max(0, this.degradationLevel - 1);
      if (this.degradationLevel === 0) {
        decisions.push({
          policy: this.name,
          action: 'restore_quality',
          priority: this.priority - 10,
          adaptation: {
            motion: {
              ...state.motion,
              animationsEnabled: true,
            },
          },
          reason: 'Performance restaurée',
          overridable: true,
        });
      }
    }

    return decisions;
  }

  /**
   * Évalue l'utilisation mémoire
   */
  private evaluateMemory(memoryUsage: number, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryCritical) {
      decisions.push({
        policy: this.name,
        action: 'memory_critical',
        priority: this.priority + 40,
        adaptation: {
          motion: {
            ...state.motion,
            animationsEnabled: false,
            loadingAnimations: 'none',
          },
          visibility: {
            ...state.visibility,
            showDebugInfo: false,
            showMetrics: false,
          },
        },
        reason: `Mémoire critique (${(memoryUsage * 100).toFixed(1)}%)`,
        overridable: false,
      });
    } else if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryWarning) {
      decisions.push({
        policy: this.name,
        action: 'memory_warning',
        priority: this.priority + 20,
        adaptation: {
          motion: {
            ...state.motion,
            loadingAnimations: 'spinner',
          },
        },
        reason: `Mémoire élevée (${(memoryUsage * 100).toFixed(1)}%)`,
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Évalue les frame drops
   */
  private evaluateFrameDrops(frameDrops: number, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    if (frameDrops > PERFORMANCE_THRESHOLDS.frameDropsCritical) {
      decisions.push({
        policy: this.name,
        action: 'frame_drops_critical',
        priority: this.priority + 35,
        adaptation: {
          motion: {
            ...state.motion,
            animationsEnabled: false,
            parallaxEnabled: false,
          },
        },
        reason: `Frame drops critiques (${frameDrops})`,
        overridable: false,
      });
    } else if (frameDrops > PERFORMANCE_THRESHOLDS.frameDropsWarning) {
      decisions.push({
        policy: this.name,
        action: 'frame_drops_warning',
        priority: this.priority + 15,
        adaptation: {
          motion: {
            ...state.motion,
            transitionDuration: Math.min(state.motion.transitionDuration, 150),
          },
        },
        reason: `Frame drops élevés (${frameDrops})`,
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Évalue le temps de rendu
   */
  private evaluateRenderTime(renderTime: number, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    if (renderTime > PERFORMANCE_THRESHOLDS.renderTimeCritical) {
      decisions.push({
        policy: this.name,
        action: 'render_time_critical',
        priority: this.priority + 25,
        adaptation: {
          layout: {
            ...state.layout,
            gridColumns: Math.min(state.layout.gridColumns, 2),
          },
          visibility: {
            ...state.visibility,
            showDebugInfo: false,
          },
        },
        reason: `Temps de rendu critique (${renderTime}ms)`,
        overridable: true,
      });
    } else if (renderTime > PERFORMANCE_THRESHOLDS.renderTimeWarning) {
      decisions.push({
        policy: this.name,
        action: 'render_time_warning',
        priority: this.priority + 5,
        adaptation: {
          theme: {
            ...state.theme,
            shadowIntensity: 'subtle',
          },
        },
        reason: `Temps de rendu élevé (${renderTime}ms)`,
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Retourne le niveau de dégradation actuel
   */
  getDegradationLevel(): number {
    return this.degradationLevel;
  }

  /**
   * Force un niveau de dégradation
   */
  setDegradationLevel(level: number): void {
    this.degradationLevel = Math.max(0, Math.min(3, level));
  }

  /**
   * Génère des recommandations de performance
   */
  getPerformanceRecommendations(signal: PerformanceSignal): string[] {
    const recommendations: string[] = [];
    const { fps, memoryUsage, frameDrops, renderTime } = signal.value;

    if (fps < PERFORMANCE_THRESHOLDS.fpsWarning) {
      recommendations.push('Désactivez les animations complexes');
      recommendations.push('Réduisez le nombre d\'éléments affichés');
    }

    if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryWarning) {
      recommendations.push('Fermez les onglets inutilisés');
      recommendations.push('Effacez le cache si possible');
    }

    if (frameDrops > PERFORMANCE_THRESHOLDS.frameDropsWarning) {
      recommendations.push('Désactivez le parallax et les effets de hover');
    }

    if (renderTime > PERFORMANCE_THRESHOLDS.renderTimeWarning) {
      recommendations.push('Simplifiez le layout');
      recommendations.push('Réduisez les ombres et effets visuels');
    }

    return recommendations;
  }

  /**
   * Retourne le nom de la politique
   */
  getName(): string {
    return this.name;
  }

  /**
   * Retourne la priorité
   */
  getPriority(): number {
    return this.priority;
  }
}

export default PerformancePolicy;
