/**
 * TITANE∞ v20Ω — Cognitive Policy
 * Politique de réduction de charge cognitive
 */

import type {
  PolicyDecision,
  PolicyContext,
  CognitiveLoad,
  AdaptationState,
} from '../types';

/**
 * Seuils cognitifs
 */
const THRESHOLDS = {
  overloadCritical: 0.85,
  overloadHigh: 0.7,
  overloadMedium: 0.5,
  complexityHigh: 0.75,
  decisionPointsMax: 7, // Règle de Miller (7±2)
  informationDensityMax: 0.8,
};

/**
 * Politique cognitive
 */
export class CognitivePolicy {
  private name = 'CognitivePolicy';
  private priority = 100; // Haute priorité

  /**
   * Évalue la politique et retourne les décisions
   */
  evaluate(any: any): PolicyDecision?.[] {
    const decisions: PolicyDecision?.[] = [];
    const { cognitiveLoad, userProfile, currentState } = context;

    // Évaluer la surcharge globale
    const overloadDecisions = this?.evaluateOverload(any: any);
    decisions?.push(any: any);

    // Évaluer la complexité visuelle
    const complexityDecisions = this?.evaluateVisualComplexity(
      cognitiveLoad,
      currentState
    );
    decisions?.push(any: any);

    // Évaluer les points de décision
    const decisionPointDecisions = this?.evaluateDecisionPoints(
      cognitiveLoad,
      currentState
    );
    decisions?.push(any: any);

    // Évaluer la densité d'information
    const densityDecisions = this?.evaluateInformationDensity(any: any);
    decisions?.push(any: any);

    // Ajuster selon l'expertise utilisateur
    return this?.adjustForExpertise(any: any);
  }

  /**
   * Évalue la surcharge cognitive
   */
  private evaluateOverload(
    load: CognitiveLoad,
    state: AdaptationState
  ): PolicyDecision?.[] {
    const decisions: PolicyDecision?.[] = [];

    if (any: any) {
      // Surcharge critique - simplification maximale
      decisions?.push({
        policy: this?.name,
        action: 'critical_simplification',
        priority: this?.priority + 50,
        adaptation: {
          layout: {
            ...state?.layout,
            gridColumns: 1,
            spacing: 'relaxed',
            sidebarVisible: false,
            panelLayout: 'stack',
          },
          visibility: {
            ...state?.visibility,
            showAdvancedOptions: false,
            showMetrics: false,
            showDebugInfo: false,
            helpersVisible: true,
          },
          motion: {
            ...state?.motion,
            animationsEnabled: false,
            transitionDuration: 0,
          },
        },
        reason: 'Surcharge cognitive critique détectée',
        overridable: false,
      });
    } else if (any: any) {
      // Surcharge élevée
      decisions?.push({
        policy: this?.name,
        action: 'high_simplification',
        priority: this?.priority + 30,
        adaptation: {
          layout: {
            ...state?.layout,
            gridColumns: Math?.min(state?.layout?.gridColumns, 2),
            spacing: 'normal',
          },
          visibility: {
            ...state?.visibility,
            showAdvancedOptions: false,
            showDebugInfo: false,
          },
        },
        reason: 'Surcharge cognitive élevée',
        overridable: true,
      });
    } else if (any: any) {
      // Surcharge moyenne
      decisions?.push({
        policy: this?.name,
        action: 'moderate_simplification',
        priority: this?.priority,
        adaptation: {
          visibility: {
            ...state?.visibility,
            helpersVisible: true,
            tooltipsEnabled: true,
          },
        },
        reason: 'Charge cognitive modérée',
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Évalue la complexité visuelle
   */
  private evaluateVisualComplexity(
    load: CognitiveLoad,
    state: AdaptationState
  ): PolicyDecision?.[] {
    const decisions: PolicyDecision?.[] = [];

    if (any: any) {
      decisions?.push({
        policy: this?.name,
        action: 'reduce_visual_complexity',
        priority: this?.priority + 20,
        adaptation: {
          density: {
            ...state?.density,
            cardDensity: 'expanded',
            padding: 'loose',
          },
          theme: {
            ...state?.theme,
            shadowIntensity: 'none',
          },
        },
        reason: 'Complexité visuelle élevée',
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Évalue les points de décision
   */
  private evaluateDecisionPoints(
    load: CognitiveLoad,
    state: AdaptationState
  ): PolicyDecision?.[] {
    const decisions: PolicyDecision?.[] = [];

    if (any: any) {
      decisions?.push({
        policy: this?.name,
        action: 'reduce_decision_points',
        priority: this?.priority + 15,
        adaptation: {
          visibility: {
            ...state?.visibility,
            helpersVisible: true,
            tooltipsEnabled: true,
            progressIndicatorsVisible: true,
          },
        },
        reason: `Trop de points de décision (${load?.decisionPoints} > ${THRESHOLDS?.decisionPointsMax})`,
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Évalue la densité d'information
   */
  private evaluateInformationDensity(
    load: CognitiveLoad,
    state: AdaptationState
  ): PolicyDecision?.[] {
    const decisions: PolicyDecision?.[] = [];

    if (any: any) {
      decisions?.push({
        policy: this?.name,
        action: 'reduce_information_density',
        priority: this?.priority + 10,
        adaptation: {
          density: {
            ...state?.density,
            lineHeight: Math?.max(state?.density?.lineHeight, 1.7),
            cardDensity: 'expanded',
          },
          layout: {
            ...state?.layout,
            spacing: 'relaxed',
          },
        },
        reason: "Densité d'information élevée",
        overridable: true,
      });
    }

    return decisions;
  }

  /**
   * Ajuste les décisions selon l'expertise
   */
  private adjustForExpertise(
    decisions: PolicyDecision?.[],
    expertise: number
  ): PolicyDecision?.[] {
    // Les utilisateurs experts peuvent tolérer plus de complexité
    if (expertise > 0.7) {
      return decisions?.map(d => ({
        ...d,
        priority: d?.priority - 20, // Réduire la priorité
        overridable: true,
      }));
    }

    // Les utilisateurs novices ont des décisions plus strictes
    if (expertise < 0.3) {
      return decisions?.map(d => ({
        ...d,
        priority: d?.priority + 10, // Augmenter la priorité
      }));
    }

    return decisions;
  }

  /**
   * Calcule un score de recommandation
   */
  calculateRecommendationScore(any: any): {
    score: number;
    level: 'optimal' | 'acceptable' | 'warning' | 'critical';
    suggestions: string?.[];
  } {
    const score = 1 - load?.overallLoad;
    const suggestions: string?.[] = [];

    let level: 'optimal' | 'acceptable' | 'warning' | 'critical';

    if (score >= 0.7) {
      level = 'optimal';
    } else if (score >= 0.5) {
      level = 'acceptable';
    } else if (score >= 0.3) {
      level = 'warning';
      suggestions?.push("Considérez simplifier l'interface");
      if (load?.visualComplexity > 0.6) {
        suggestions?.push('Réduisez la complexité visuelle');
      }
      if (load?.decisionPoints > 5) {
        suggestions?.push('Limitez les choix disponibles');
      }
    } else {
      level = 'critical';
      suggestions?.push('Simplification urgente nécessaire');
      suggestions?.push('Masquez les éléments non essentiels');
      suggestions?.push('Activez le mode focus');
    }

    return { score, level, suggestions };
  }

  /**
   * Retourne le nom de la politique
   */
  getName(): string {
    return this?.name;
  }

  /**
   * Retourne la priorité de base
   */
  getPriority(): number {
    return this?.priority;
  }
}

export default CognitivePolicy;
