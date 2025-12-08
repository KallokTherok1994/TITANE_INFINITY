/**
 * TITANE∞ v20Ω — Safety Policy
 * Politique de sécurité et accessibilité
 */

import type {
  PolicyDecision,
  PolicyContext,
  UIContext,
  AdaptationState,
} from '../types';

/**
 * Contraintes de sécurité
 */
const SAFETY_CONSTRAINTS = {
  minTouchTarget: 44, // WCAG 2.5.5
  minFontSize: 12,
  minContrastRatio: 4.5, // WCAG AA
  maxAnimationDuration: 5000,
  minFocusIndicator: 2, // px
};

/**
 * Politique de sécurité UI/UX
 */
export class SafetyPolicy {
  private name = 'SafetyPolicy';
  private priority = 150; // Très haute priorité (sécurité)

  /**
   * Évalue la politique
   */
  evaluate(context: PolicyContext): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];
    const { uiContext, currentState, userProfile } = context;

    // Accessibilité obligatoire
    const accessibilityDecisions = this.evaluateAccessibility(uiContext, currentState);
    decisions.push(...accessibilityDecisions);

    // Sécurité des interactions
    const interactionDecisions = this.evaluateInteractionSafety(uiContext, currentState);
    decisions.push(...interactionDecisions);

    // Protection motion sickness
    const motionDecisions = this.evaluateMotionSafety(uiContext, currentState);
    decisions.push(...motionDecisions);

    // Mode accessibilité forcé
    if (userProfile.mode === 'accessibility') {
      const accessibilityModeDecisions = this.enforceAccessibilityMode(currentState);
      decisions.push(...accessibilityModeDecisions);
    }

    return decisions;
  }

  /**
   * Évalue l'accessibilité
   */
  private evaluateAccessibility(context: UIContext, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    // Contraste élevé requis par le système
    if (context.highContrast) {
      decisions.push({
        policy: this.name,
        action: 'enforce_high_contrast',
        priority: this.priority,
        adaptation: {
          theme: {
            ...state.theme,
            contrastMode: 'high',
            surfaceOpacity: 1.0,
            shadowIntensity: 'strong',
          },
        },
        reason: 'Préférence système: contraste élevé',
        overridable: false, // Sécurité = non overridable
      });
    }

    // Mouvement réduit requis
    if (context.reducedMotion) {
      decisions.push({
        policy: this.name,
        action: 'enforce_reduced_motion',
        priority: this.priority + 10,
        adaptation: {
          motion: {
            animationsEnabled: false,
            transitionDuration: 0,
            parallaxEnabled: false,
            loadingAnimations: 'none',
            hoverEffects: false,
            scrollBehavior: 'auto',
          },
        },
        reason: 'Préférence système: mouvement réduit',
        overridable: false,
      });
    }

    return decisions;
  }

  /**
   * Évalue la sécurité des interactions
   */
  private evaluateInteractionSafety(context: UIContext, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    // Sur touch, garantir des cibles suffisantes
    if (context.inputMode === 'touch') {
      const currentIconSize = state.density.iconSize;
      const currentButtonSize = state.density.buttonSize;

      if (currentIconSize < SAFETY_CONSTRAINTS.minTouchTarget ||
          (currentButtonSize === 'sm')) {
        decisions.push({
          policy: this.name,
          action: 'enforce_touch_targets',
          priority: this.priority,
          adaptation: {
            density: {
              ...state.density,
              iconSize: Math.max(currentIconSize, SAFETY_CONSTRAINTS.minTouchTarget),
              buttonSize: currentButtonSize === 'sm' ? 'md' : currentButtonSize,
            },
          },
          reason: 'Cibles tactiles minimum WCAG 2.5.5',
          overridable: false,
        });
      }
    }

    // Garantir une taille de police minimum
    const fontSizes = { small: 13, medium: 15, large: 17 };
    if (fontSizes[state.density.fontSize] < SAFETY_CONSTRAINTS.minFontSize) {
      decisions.push({
        policy: this.name,
        action: 'enforce_min_font_size',
        priority: this.priority,
        adaptation: {
          density: {
            ...state.density,
            fontSize: 'medium',
          },
        },
        reason: 'Taille de police minimum',
        overridable: false,
      });
    }

    return decisions;
  }

  /**
   * Évalue la sécurité motion
   */
  private evaluateMotionSafety(context: UIContext, state: AdaptationState): PolicyDecision[] {
    const decisions: PolicyDecision[] = [];

    // Limiter la durée des animations
    if (state.motion.transitionDuration > SAFETY_CONSTRAINTS.maxAnimationDuration) {
      decisions.push({
        policy: this.name,
        action: 'limit_animation_duration',
        priority: this.priority,
        adaptation: {
          motion: {
            ...state.motion,
            transitionDuration: SAFETY_CONSTRAINTS.maxAnimationDuration,
          },
        },
        reason: 'Durée d\'animation maximum dépassée',
        overridable: false,
      });
    }

    // Désactiver le parallax si problèmes vestibulaires possibles
    if (context.reducedMotion && state.motion.parallaxEnabled) {
      decisions.push({
        policy: this.name,
        action: 'disable_parallax',
        priority: this.priority + 5,
        adaptation: {
          motion: {
            ...state.motion,
            parallaxEnabled: false,
          },
        },
        reason: 'Parallax désactivé pour sécurité vestibulaire',
        overridable: false,
      });
    }

    return decisions;
  }

  /**
   * Force le mode accessibilité complet
   */
  private enforceAccessibilityMode(state: AdaptationState): PolicyDecision[] {
    return [{
      policy: this.name,
      action: 'accessibility_mode',
      priority: this.priority + 20,
      adaptation: {
        density: {
          ...state.density,
          fontSize: 'large',
          lineHeight: 2.0,
          padding: 'loose',
          iconSize: 28,
          buttonSize: 'lg',
        },
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
          contrastMode: 'high',
          surfaceOpacity: 1.0,
        },
        visibility: {
          ...state.visibility,
          labelsVisible: true,
          tooltipsEnabled: true,
          helpersVisible: true,
        },
      },
      reason: 'Mode accessibilité activé',
      overridable: false,
    }];
  }

  /**
   * Valide une adaptation contre les contraintes de sécurité
   */
  validateAdaptation(adaptation: Partial<AdaptationState>): {
    valid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Vérifier la densité
    if (adaptation.density) {
      if (adaptation.density.iconSize && adaptation.density.iconSize < SAFETY_CONSTRAINTS.minTouchTarget) {
        violations.push(`Icônes trop petites (${adaptation.density.iconSize}px < ${SAFETY_CONSTRAINTS.minTouchTarget}px)`);
      }
    }

    // Vérifier le motion
    if (adaptation.motion) {
      if (adaptation.motion.transitionDuration && adaptation.motion.transitionDuration > SAFETY_CONSTRAINTS.maxAnimationDuration) {
        violations.push(`Animation trop longue (${adaptation.motion.transitionDuration}ms)`);
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Génère un rapport d'accessibilité
   */
  generateAccessibilityReport(state: AdaptationState, context: UIContext): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Vérifier le mouvement
    if (context.reducedMotion && state.motion.animationsEnabled) {
      issues.push('Animations activées malgré prefers-reduced-motion');
      score -= 20;
    }

    // Vérifier le contraste
    if (context.highContrast && state.theme.contrastMode !== 'high') {
      issues.push('Mode contraste élevé non respecté');
      score -= 20;
    }

    // Vérifier les cibles tactiles
    if (context.inputMode === 'touch' && state.density.iconSize < 44) {
      issues.push('Cibles tactiles trop petites');
      recommendations.push('Augmentez la taille des icônes à 44px minimum');
      score -= 15;
    }

    // Vérifier la lisibilité
    if (state.density.lineHeight < 1.5) {
      recommendations.push('Augmentez l\'interligne pour une meilleure lisibilité');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
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

export default SafetyPolicy;
